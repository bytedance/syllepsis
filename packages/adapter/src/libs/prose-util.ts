import { Mark, Node as ProseMirrorNode, NodeType, ResolvedPos } from 'prosemirror-model';
import { EditorState, Selection, TextSelection, Transaction } from 'prosemirror-state';
import { RemoveMarkStep } from 'prosemirror-transform';

const isEmptyDoc = (doc: ProseMirrorNode) =>
  doc.childCount === 1 && !doc.firstChild!.content.size && doc.firstChild!.type === doc.type.contentMatch.defaultType;

const isOriginAttrs = (node: ProseMirrorNode, nodeType: NodeType = node.type) => {
  const typeAttrs = nodeType.spec.attrs;
  if (!typeAttrs) return;
  const attrNames = Object.keys(typeAttrs);
  return !attrNames.some(name => {
    if (typeof typeAttrs[name].default === undefined || node.attrs[name] === typeAttrs[name].default) return false;
    return true;
  });
};

const findCutBefore = ($pos: ResolvedPos) => {
  if (!$pos.parent.type.spec.isolating) {
    for (let i = $pos.depth - 1; i >= 0; i--) {
      if ($pos.index(i) > 0) {
        return $pos.doc.resolve($pos.before(i + 1));
      }
      if ($pos.node(i).type.spec.isolating) {
        break;
      }
    }
  }
  return null;
};

const getPrevNodeLastTextBlock = ($pos: ResolvedPos) => {
  let curNode = $pos.nodeBefore;
  let depth = 0;
  let pos = $pos.pos;
  while (curNode) {
    pos = $pos.pos - curNode.nodeSize - depth;
    if (curNode.isTextblock) {
      break;
    }
    curNode = curNode.lastChild;
    depth++;
  }
  return { node: curNode, pos };
};

const REMOVE_ALL = '_';
const splitStr = (str?: string | null) => (str ? str.split(/\s+/) : []);

// get information about excludeMarks and remain marks
const handleSpecInfo = (node: ProseMirrorNode | null | undefined, excludeMarkList: string[], whiteList: string[]) => {
  if (!node) return false;
  const _excludeMarkList = splitStr(node.type.spec.excludeMarks);
  const _whiteList = splitStr(node.type.spec.marks);
  if (excludeMarkList.includes(REMOVE_ALL)) return true;
  if (whiteList.includes('')) return true;
  excludeMarkList.push(..._excludeMarkList);
  _whiteList.push(..._whiteList);
  return false;
};

// get the content of `excludeMarks` of the node at the current position, and return a list of compatible marks
const getFitMarksHandler = ($pos: ResolvedPos) => {
  let depth = $pos.depth + 1;
  const excludeMarkList: string[] = [];
  const whiteList: string[] = [];
  let removeAll = false;

  const pointerNode = $pos.nodeAfter;
  removeAll = handleSpecInfo(pointerNode, excludeMarkList, whiteList);

  while (depth--) {
    const parentNode = $pos.node(depth);
    removeAll = handleSpecInfo(parentNode, excludeMarkList, whiteList);
  }

  if (excludeMarkList.length + whiteList.length === 0) return;

  return (marks: Mark[]) => {
    if (removeAll) return [];
    return marks.filter(mark => {
      if (excludeMarkList.includes(mark.type.name)) return false;
      if (whiteList.length && !whiteList.includes(mark.type.name)) return false;
      return true;
    });
  };
};

// remove the mark that Node cannot contain, identify the custom `spec.excludeMarks`
const removeExcludesMarks = (tr: Transaction) => {
  const { $from, $to } = tr.selection;
  let isRemoved = false;
  tr.doc.nodesBetween(
    $from.depth ? $from.before() : $from.pos,
    $to.depth ? $to.after() : $to.pos,
    (node, pos, parent, index) => {
      if (node.isLeaf && node.marks.length) {
        const fitRule = getFitMarksHandler(tr.doc.resolve(pos));
        if (fitRule) {
          const newMarks = fitRule(node.marks);
          if (newMarks.length === node.marks.length) return;
          parent.content = parent.content.replaceChild(
            index,
            node.isText
              ? node.type.schema.text(node.textContent, newMarks)
              : node.type.create(node.attrs, node.content, newMarks),
          );
          isRemoved = true;
        }
      }
      return !node.isLeaf;
    },
  );
  return isRemoved;
};

const getUnInheritAttr = (node: ProseMirrorNode) => {
  if (!node || !node.type.spec.attrs) return [];
  return Object.keys(node.type.spec.attrs).filter(key => {
    const attrSpec = node.type.spec.attrs;
    if (!attrSpec) return false;
    return attrSpec[key].inherit === false;
  });
};

// reset the attrs of the node in current selection whose `spec.inherit` is false,
const resetUnInheritAttr = (oldState: EditorState, newState: EditorState) => {
  if (oldState.doc === newState.doc) return;
  const $oFrom = oldState.selection.$from;
  const $nFrom = newState.selection.$from;
  if (!$oFrom.depth || !$nFrom.depth || $oFrom.before() === $nFrom.before()) {
    return;
  }
  const oldNode = $oFrom.parent;
  const newNode = $nFrom.parent;
  if (oldNode.type !== newNode.type || oldNode === newNode) return;
  getUnInheritAttr(oldNode).forEach(key => {
    if (oldNode.attrs[key] === newNode.attrs[key]) {
      if (oldNode.attrs === newNode.attrs) {
        newNode.attrs = {
          ...newNode.attrs,
          [key]: (newNode.type as any).attrs[key].default,
        };
      } else {
        newNode.attrs[key] = (newNode.type as any).attrs[key].default;
      }
    }
  });
};

// in the case of multiple ranges, the number of pos is incorrect
const getRealSelectionInfo = (selection: Selection) => {
  let { from, to } = selection;
  const isReverse = selection.anchor > selection.head;

  selection.ranges.forEach(({ $from, $to }) => {
    from = Math.min($from.pos, from);
    to = Math.max($to.pos, to);
  });

  return { from, to, anchor: isReverse ? to : from, head: isReverse ? from : to };
};

type TMatched = { style: Mark; from: number; to: number; step: number }[];

const removeMark = (doc: ProseMirrorNode, tr: Transaction, from: number, to: number) => {
  const matched: TMatched = [];
  let step = 0;
  doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isInline) return;
    step++;
    const toRemove = node.marks;
    if (toRemove && toRemove.length) {
      const end = Math.min(pos + node.nodeSize, to);
      for (let i = 0; i < toRemove.length; i++) {
        const style = toRemove[i];
        let found;
        for (let j = 0; j < matched.length; j++) {
          const m = matched[j];
          if (m.step === step - 1 && style.eq(matched[j].style)) found = m;
        }
        if (found) {
          found.to = end;
          found.step = step;
        } else {
          // not clear Mark which decare `notClear === true`
          if (!style.type.spec.notClear) {
            matched.push({ style, from: Math.max(pos, from), to: end, step });
          }
        }
      }
    }
  });

  matched.forEach(m => tr.step(new RemoveMarkStep(m.from, m.to, m.style)));
  return tr;
};

const tryReplaceEmpty = (tr: Transaction, $from: ResolvedPos, node: ProseMirrorNode) => {
  const isInlineNode = node.type.isInline;
  if (
    !isInlineNode &&
    $from.depth &&
    !$from.parent.childCount &&
    validateNodeContent($from.node($from.depth - 1), node)
  ) {
    const startPos = $from.before();
    tr.replaceWith(startPos, $from.after(), node);
    const $pos = tr.doc.resolve(tr.selection.$to.depth ? tr.selection.$to.after() : tr.selection.to);
    if (tr.selection.from === startPos && (!$pos.nodeAfter || $pos.nodeAfter.isTextblock)) {
      tr.setSelection(TextSelection.create(tr.doc, $pos.pos));
    }
    return true;
  }
  return false;
};

const getStoreMarks = (state: EditorState) =>
  state.tr.storedMarks || (state.selection.$to.parentOffset && state.selection.$from.marks()) || [];

const validateNodeContent = (parent: ProseMirrorNode, child: ProseMirrorNode) => {
  if (child.type.name === 'doc') {
    let isMatch = true;
    child.content.forEach(n => {
      if (!isMatch || !parent.type.contentMatch.matchType(n.type)) {
        isMatch = false;
      }
    });

    return isMatch;
  }

  return Boolean(parent.type.contentMatch.matchType(child.type));
};

const getChildTextblockType = (nodeType: NodeType) => {
  const edgeCount = nodeType.contentMatch.edgeCount;
  for (let i = 0; i < edgeCount; i++) {
    const childType = nodeType.contentMatch.edge(i).type;
    if (childType.isTextblock) {
      return childType;
    }
  }
};

export {
  findCutBefore,
  getChildTextblockType,
  getPrevNodeLastTextBlock,
  getRealSelectionInfo,
  getStoreMarks,
  getUnInheritAttr,
  isEmptyDoc,
  isOriginAttrs,
  removeExcludesMarks,
  removeMark,
  resetUnInheritAttr,
  tryReplaceEmpty,
  validateNodeContent,
};
