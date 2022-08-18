import { Mark, MarkType, Node as ProseMirrorNode, NodeRange, NodeType, ResolvedPos, Slice } from 'prosemirror-model';
import { AllSelection, EditorState, SelectionRange, TextSelection, Transaction } from 'prosemirror-state';
import { RemoveMarkStep } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { doLiftNode } from '../basic/keymap/behavior';
import { removeMark, Types } from '../libs';

type TSelectedNodes = {
  node: ProseMirrorNode;
  topPos: number;
  nodeRange: NodeRange;
  originDepth: number;
}[];

interface IFixRangeInfo {
  extendedFrom: number;
  extendedTo: number;
  $originFrom: ResolvedPos;
  $originTo: ResolvedPos;
}

const clearFormat = (view: EditorView) => {
  const tr = view.state.tr;
  const { selection, doc } = view.state;

  selection.ranges.forEach(({ $from, $to }) => {
    const curMark = (tr.storedMarks || []).concat($from.marks());
    curMark.forEach(mark => tr.removeStoredMark(mark));
    removeMark(doc, tr, $from.pos, $to.pos);
  });

  view.dispatch(tr);
  view.focus();
  return true;
};

const getMarkState = (mark: Mark) => {
  if (Object.keys(mark.attrs).length) {
    return mark.attrs;
  } else {
    return true;
  }
};

const getFormat = (view: EditorView, range?: Types.IRangeStatic) => {
  const {
    tr: { doc },
    selection,
    storedMarks,
  } = view.state;
  const docName = doc.type.name;
  const paragraphName = doc.type.contentMatch.defaultType!.name;

  let { from, to, $from } = selection;
  if (range && typeof range.index === 'number' && typeof range.length === 'number') {
    from = range.index;
    to = from + range.length;
    $from = doc.resolve(from);
  }

  const res: Types.StringMap<any> = {};

  let parentNode = $from.depth === 1 ? $from.parent : $from.node(-1);

  if (!parentNode) parentNode = view.state.doc;

  if (![docName, paragraphName].includes(parentNode.type.name)) {
    res[parentNode.type.name] = parentNode.attrs;
  }

  if (from !== to) {
    doc.nodesBetween(from, to, (node, pos, parent) => {
      node.marks.forEach(mark => {
        res[mark.type.name] = getMarkState(mark);
      });
      if (node.isTextblock) {
        // maybe nested node
        if (parent.type.name !== docName) {
          res[parent.type.name] = parent.attrs;
        } else if (node.type.name !== paragraphName) {
          res[node.type.name] = node.attrs;
        }
      }
      return !node.isLeaf;
    });
  } else {
    const curMarks = storedMarks ? storedMarks : $from.marks();
    if (curMarks.length) {
      curMarks.forEach(mark => {
        res[mark.type.name] = getMarkState(mark);
      });
    }
  }

  return res;
};

// handler for mark's spec `excludes`，remove all the marks that can't coexist. (the default behavior of `prosemirror` is prevent)
const removeConflictMark = (tr: Transaction, markType: MarkType) => {
  let res = tr;
  tr.selection.ranges.forEach(({ $from, $to }) => {
    tr.doc.nodesBetween($from.pos, $to.pos, (node, nodePos) => {
      if (node.isText && node.marks.length) {
        node.marks.forEach(mark => {
          const excludes = mark.type.spec.excludes || '';
          if (excludes === '_' || excludes.includes(markType.name)) {
            res = res.step(
              new RemoveMarkStep(Math.max($from.pos, nodePos), Math.min($to.pos, nodePos + node.nodeSize), mark),
            );
          }
        });
      }
    });
  });
  return res;
};

const replaceMark = (markType: MarkType, attrs: { [key: string]: any }, nTr: Transaction) => {
  const tr = removeConflictMark(nTr, markType);

  nTr.selection.ranges.forEach(({ $from, $to }) => {
    if ($from.pos === $to.pos) {
      tr.removeStoredMark(markType).addStoredMark(markType.create(attrs));
    } else {
      tr.removeMark($from.pos, $to.pos, markType).addMark($from.pos, $to.pos, markType.create(attrs));
    }
  });

  return nTr;
};

const markApplies = (doc: ProseMirrorNode, ranges: SelectionRange<any>[], type: MarkType) => {
  const loop = (i: number) => {
    const ref = ranges[i];
    const $from = ref.$from;
    const $to = ref.$to;
    let can = $from.depth === 0 ? doc.type.allowsMarkType(type) : false;
    doc.nodesBetween($from.pos, $to.pos, node => {
      if (can) {
        return false;
      }
      can = node.inlineContent && node.type.allowsMarkType(type);
    });
    if (can) {
      return { v: true };
    }
  };

  for (let i = 0; i < ranges.length; i++) {
    const returned = loop(i);

    if (returned) return returned.v;
  }
  return false;
};

const toggleMark = (
  markType: MarkType<any>,
  attrs: boolean,
  nTr: Transaction,
  storedMarks: undefined | null | Mark[],
) => {
  const { empty, $cursor, ranges } = nTr.selection as TextSelection;

  if ((empty && !$cursor) || !markApplies(nTr.doc, ranges, markType)) {
    return nTr;
  }
  let tr = attrs ? removeConflictMark(nTr, markType) : nTr;

  if ($cursor) {
    if (attrs) {
      tr = tr.addStoredMark(markType.create());
    } else if (markType.isInSet(storedMarks || $cursor.marks())) {
      tr = tr.removeStoredMark(markType);
    }
  } else {
    let has = false;
    for (let i = 0; !has && i < ranges.length; i++) {
      const ref$1 = ranges[i];
      const $from = ref$1.$from;
      const $to = ref$1.$to;
      has = nTr.doc.rangeHasMark($from.pos, $to.pos, markType);
    }
    for (let i$1 = 0; i$1 < ranges.length; i$1++) {
      const ref$2 = ranges[i$1];
      const $from$1 = ref$2.$from;
      const $to$1 = ref$2.$to;
      if (attrs) {
        tr.addMark($from$1.pos, $to$1.pos, markType.create());
      } else if (has) {
        tr.removeMark($from$1.pos, $to$1.pos, markType);
      }
    }
  }

  return tr;
};

interface TSelectedInfos {
  // Selected node and range information
  selectedNodes: Array<{
    node: ProseMirrorNode;
    nodeRange: NodeRange;
  }>;
  // actually selected range
  selectedRange: {
    $from: ResolvedPos;
    $to: ResolvedPos;
  };
  // actual processing range
  wrappingRange: {
    from: number;
    to: number;
  };
}

// check whether there are `isolating` nodes in the range
const containsIsolatingNode = (ranges: SelectionRange[]) => {
  const $from = ranges[0].$from;
  const $to = ranges[0].$to;

  let isContain = false;
  $from.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
    if (isContain) return true;
    if (node.type.spec.isolating) {
      // `from` and `to` should not contain by same `isolating` node or selected the isolating node
      if ($from.pos <= pos || $to.pos >= pos + node.nodeSize) {
        isContain = true;
      }
    }
  });
  return isContain;
};

// return an array containing the contents of each `range` according to `selection.ranges`
const getSelectedInfos = ({ doc, selection }: Transaction) => {
  const selectedInfos: Array<TSelectedInfos> = [];

  const ranges = selection.ranges.sort((a, b) => a.$from.pos - b.$from.pos);
  // the location to start collecting, mainly used for isolating nodes
  let startPos = selection.$from.depth ? ranges[0].$from.before(1) : 0;

  const containIsolatingNode = ranges.length === 1 && containsIsolatingNode(ranges);

  ranges.forEach(({ $to, $from: $selectFrom }) => {
    let $from: null | ResolvedPos = $selectFrom;

    let extendedFrom = $from.pos;
    let extendedTo = $to.pos;

    const from = $from.pos;
    const to = $to.pos;

    let selectedNodes: TSelectedInfos['selectedNodes'] = [];

    doc.nodesBetween(from, to, (curNode, nodePos, parent) => {
      if (nodePos < startPos) return false;

      // do not process cross-area selected isolating nodes
      if (containIsolatingNode && curNode.type.spec.isolating) {
        startPos = nodePos + curNode.nodeSize;
        $from &&
          selectedNodes.length &&
          selectedInfos.push({
            selectedNodes,
            selectedRange: {
              $from,
              $to: doc.resolve(nodePos),
            },
            wrappingRange: {
              from: extendedFrom,
              to: nodePos,
            },
          });

        selectedNodes = [];
        $from = null;
        extendedFrom = startPos;

        return false;
      }

      // collect the `inline block` and `leaf` node
      if (curNode.inlineContent) {
        const $pos = doc.resolve(nodePos + 1);
        if (!$from) $from = $pos;
        let blockRange = $pos.blockRange();
        if (!blockRange) blockRange = { start: nodePos, end: nodePos } as NodeRange<any>;

        if (!selectedNodes.some(({ node }) => node === curNode)) {
          selectedNodes.push({
            node: curNode,
            nodeRange: blockRange,
          });
        }

        let fixFrom = extendedFrom;
        let fixTo = extendedTo;
        // fix the problem of incorrect range selection when selecting nodes, and stop when meet an `isolating` parent node
        if ($pos.depth > 1 && !parent.type.spec.isolating) {
          if (parent.firstChild === curNode) {
            fixFrom = $pos.before(-1);
          }
          if (parent.lastChild === curNode) {
            fixTo = $pos.after(-1);
          }
        }

        extendedFrom = Math.min(extendedFrom, blockRange.start, fixFrom);
        extendedTo = Math.max(extendedTo, blockRange.end, fixTo);

        return false;
      } else if (curNode.isLeaf) {
        selectedNodes.push({
          node: curNode,
          nodeRange: { start: nodePos, end: nodePos } as NodeRange<any>,
        });
      }

      return true;
    });

    selectedNodes.length &&
      selectedInfos.push({
        selectedNodes,
        selectedRange: {
          $from,
          $to,
        },
        wrappingRange: {
          from: extendedFrom,
          to: extendedTo,
        },
      });
  });

  return selectedInfos.sort((a, b) => b.selectedRange.$from.pos - a.selectedRange.$from.pos);
};

// fix the incorrect pos in selectedNodes after the list level is changed
const fixNodeRange = (tr: Transaction, wrappingRange: { from: number; to: number }, nodes: TSelectedNodes) => {
  const doc = tr.doc;
  const { from, to } = wrappingRange;

  let i = 0;
  doc.nodesBetween(from, to > doc.nodeSize - 2 ? doc.nodeSize - 2 : to, (node, pos) => {
    if (nodes[i] && node === nodes[i].node) {
      nodes[i++].nodeRange = doc.resolve(pos + 1).blockRange()!;
      return false;
    }
    if (i >= nodes.length) return false;
    return !node.isLeaf;
  });

  return nodes;
};

// lift all nested nodes to the top level
const liftNestedNode = (
  selectedNodes: TSelectedInfos['selectedNodes'],
  _tr: Transaction,
  wrappingRange: { from: number; to: number },
) => {
  let shouldFixRange = false;
  let { from: extendedFrom, to: extendedTo } = wrappingRange;
  let tr = _tr;
  let { from, to } = tr.selection;
  let res: TSelectedNodes = [];

  for (let i = selectedNodes.length - 1; i >= 0; i--) {
    const { node, nodeRange } = selectedNodes[i];
    const topPos = _tr.doc.resolve(nodeRange.start).before(1);
    // stop depth calculation until `isolating` node or root
    let originDepth = nodeRange.depth;
    for (let j = nodeRange.depth; j >= 0; j--) {
      const parent = nodeRange.$from.node(j);
      originDepth = nodeRange.depth - j;
      if (parent.type.spec.isolating) {
        break;
      }
    }
    let depth = originDepth;
    const initPos = nodeRange.start + 1;
    let pos = initPos;
    while (depth > 0) {
      tr = doLiftNode(tr, pos);
      pos = tr.mapping.map(initPos);
      depth--;
      shouldFixRange = true;
    }
    res.unshift({ node, nodeRange, originDepth, topPos });
  }

  if (shouldFixRange) res = fixNodeRange(tr, wrappingRange, res);

  extendedFrom = tr.mapping.map(extendedFrom);
  extendedTo = tr.mapping.map(extendedTo);
  from = tr.mapping.map(from);
  to = tr.mapping.map(to);

  return {
    nodes: res,
    extendedFrom,
    extendedTo,
    from,
    to,
    docSize: tr.doc.nodeSize,
  };
};

const checkAndMergeNestedItems = (nestedItems: ProseMirrorNode[], nodeType: NodeType) => {
  let start = null;
  let end = null;
  for (let i = 0; i <= nestedItems.length + 1; i++) {
    if (nestedItems[i]) {
      if (start === null) {
        start = i;
        end = i;
      } else if (typeof end === 'number') {
        end++;
      }
      // combine or reMarkup or keep all previous child nodes into one node
    } else if (typeof start === 'number' && typeof end === 'number') {
      const canNestedSelf = nodeType.contentMatch.matchType(nodeType);
      const defaultContentType = nodeType.contentMatch.defaultType;
      let children = nestedItems.slice(start, end + 1);
      if (defaultContentType) {
        // if it can not nest itself, just fallback to the default content type
        if (!canNestedSelf) {
          children = children.map(node => defaultContentType.create(node.attrs, node.content, node.marks));
        } else {
          children = children.map(node => {
            if (!nodeType.contentMatch.matchType(node.type)) {
              return defaultContentType.create(node.attrs, node.content, node.marks);
            }
            return node;
          });
        }
      }
      const newItems = canNestedSelf ? [nodeType.createAndFill({}, children)!] : children;
      nestedItems.splice(start, children.length, ...newItems, ...new Array(children.length - newItems.length));
      i = start + newItems.length;
      start = null;
      end = null;
    }
  }
  return nestedItems;
};

// generate nested nodes based on nesting information
const createNestedNode = (nodes: TSelectedNodes, nodeType: NodeType) => {
  const sortedNestItems = nodes.reduce((res, selectedNode, idx) => {
    const depth = selectedNode.originDepth - 1;
    const result = { node: selectedNode.node, idx };
    if (!Array.isArray(res[depth])) {
      res[depth] = [result];
    } else {
      res[depth].push(result);
    }
    return res;
  }, [] as { node: ProseMirrorNode; idx: number }[][]);

  let nestedItems: ProseMirrorNode[] = [];

  while (sortedNestItems.length) {
    const curItems = sortedNestItems.pop();
    if (curItems) {
      curItems.forEach(({ node, idx }) => {
        nestedItems[idx] = node;
      });
    }
    if (sortedNestItems.length) {
      nestedItems = checkAndMergeNestedItems(nestedItems, nodeType);
    }
  }

  return nestedItems.filter((item: any) => item);
};

/**
 * @param nodeTy node type to be created
 * @param node child node
 * @param attrs attrs of the node to be created
 */
const createNode = (nodeTy: NodeType, node: ProseMirrorNode, attrs = {}) =>
  nodeTy.createAndFill(Object.assign({}, node.attrs, attrs), node.content, node.marks);

// restore selection based on content
const getRangeAfterReplace = (
  state: EditorState,
  tr: Transaction,
  { extendedFrom, extendedTo, $originFrom, $originTo }: IFixRangeInfo,
) => {
  const docSize = tr.doc.nodeSize - 2;
  let newFrom = extendedFrom;
  let newTo = extendedTo;

  if (!(state.selection instanceof AllSelection)) {
    let isMatchFrom = false;
    let defaultPos: null | number = null;
    const fromContent = $originFrom.node().textContent;
    const toContent = $originTo.node().textContent;

    tr.doc.nodesBetween(extendedFrom, Math.min(extendedTo, docSize), (node, pos) => {
      if (node.inlineContent) {
        if (defaultPos === null) defaultPos = pos + 1;
        if (!isMatchFrom && node.textContent === fromContent) {
          newFrom = pos + 1 + $originFrom.parentOffset;
          isMatchFrom = true;
        }
        if (isMatchFrom && node.textContent === toContent) {
          newTo = pos + 1 + Math.min(node.textContent.length, $originTo.parentOffset);
        }
      }
      return isMatchFrom ? false : !node.isLeaf;
    });

    if (!isMatchFrom) {
      newFrom = defaultPos || newFrom;
      newTo = newFrom;
    }
  }

  return {
    from: newFrom,
    to: Math.min(newTo, docSize),
  };
};

// apply the format to the node and return to the new selection range
const formatNodeType = (
  targetNodeType: NodeType,
  attributes: Types.StringMap<any> | undefined,
  sNodes: TSelectedInfos['selectedNodes'],
  selectedRange: TSelectedInfos['selectedRange'],
  wrappingRange: { from: number; to: number },
  nTr: Transaction,
  state: EditorState,
) => {
  let transaction = nTr;

  // check whether it is a nested node, the text of the nested node should be placed in the defaultType
  const isNestedNodeType = !targetNodeType.isTextblock;
  const contentNodeType = isNestedNodeType ? targetNodeType.contentMatch.defaultType! : targetNodeType;

  const { nodes: selectedNodes, extendedFrom, extendedTo, docSize } = liftNestedNode(
    sNodes,
    transaction,
    wrappingRange,
  );

  const newNodes: ProseMirrorNode<any>[] = [];
  for (let i = 0; i < selectedNodes.length; i++) {
    const { node, originDepth } = selectedNodes[i];
    if (node.isTextblock && originDepth && isNestedNodeType) {
      // nested textBlock
      const nestedContentNodes: TSelectedNodes = [];

      while (
        selectedNodes[i] &&
        selectedNodes[i].node.isTextblock &&
        // if same parent node, continue
        (!nestedContentNodes.length ||
          selectedNodes[i].topPos === nestedContentNodes[nestedContentNodes.length - 1].topPos)
      ) {
        nestedContentNodes.push(selectedNodes[i]);
        i++;
      }
      i--;
      newNodes.push(...createNestedNode(nestedContentNodes, targetNodeType));
    } else {
      let addNode = node;
      if (!addNode.isLeaf) {
        addNode = createNode(contentNodeType, node, contentNodeType === targetNodeType && attributes)!;
      }
      addNode && newNodes.push(addNode);
    }
  }

  const rootNodeType: NodeType = isNestedNodeType ? targetNodeType : state.schema.nodes.doc; // dummy root

  const defaultRootNodeContentType = rootNodeType.contentMatch.defaultType;
  // make sure the content node is accept by rootNode
  if (defaultRootNodeContentType) {
    newNodes.forEach((node, idx) => {
      if (!rootNodeType.contentMatch.matchType(node.type)) {
        newNodes[idx] = defaultRootNodeContentType.create(node.attrs, node.content, node.marks);
      }
    });
  }

  const root = rootNodeType.createAndFill(attributes, newNodes)!;

  if (isNestedNodeType) {
    transaction.replaceRangeWith(extendedFrom, extendedTo, root);
  } else {
    transaction = transaction.replaceRange(extendedFrom, extendedTo, new Slice(root.content, 0, 0));
  }

  return getRangeAfterReplace(state, transaction, {
    extendedFrom,
    extendedTo: extendedTo + transaction.doc.nodeSize - docSize,
    $originFrom: selectedRange.$from,
    $originTo: selectedRange.$to,
  });
};

const formatSelection = (
  formatType: string,
  formatValue: Types.StringMap<any> | boolean,
  formatRange?: { from: number; to: number },
) => (state: EditorState, tr: Transaction) => {
  const {
    schema,
    doc,
    selection: { from, to, ranges, anchor, head },
  } = state;

  let reSelect = (_tr: Transaction) => _tr;

  // if `formatRange` is specified, keep the same selected content after setting
  if (formatRange) {
    reSelect = (_tr: Transaction) => {
      if (state.selection instanceof AllSelection) {
        _tr.setSelection(new AllSelection(_tr.doc));
        // set format before the current selection
      } else if (formatRange.to <= from) {
        const diffSize = _tr.doc.nodeSize - state.doc.nodeSize;
        return _tr.setSelection(TextSelection.create(_tr.doc, from + diffSize, to + diffSize));
      } else {
        _tr.setSelection(TextSelection.create(_tr.doc, from, to));
      }
      return _tr.setSelection(TextSelection.create(_tr.doc, anchor, head));
    };

    // reset the selection according to the `formatRange`
    tr.setSelection(TextSelection.create(doc, formatRange.from, formatRange.to));
  }

  if (schema.marks[formatType]) {
    if (typeof formatValue === 'boolean') {
      toggleMark(schema.marks[formatType], formatValue, tr, state.storedMarks);
    } else {
      replaceMark(schema.marks[formatType], formatValue, tr);
    }
  } else if (schema.nodes[formatType]) {
    const nodeType = schema.nodes[formatType];
    const selectedInfos = getSelectedInfos(tr);

    if (!selectedInfos.length) return tr;

    let resultFrom = doc.nodeSize;
    let resultTo = 0;

    selectedInfos.forEach(({ selectedNodes, wrappingRange, selectedRange }) => {
      const { from: rFrom, to: rTo } = formatNodeType(
        formatValue ? nodeType : schema.nodes.paragraph,
        typeof formatValue === 'boolean' ? undefined : formatValue,
        selectedNodes,
        selectedRange,
        wrappingRange,
        tr,
        state,
      );

      resultFrom = Math.min(resultFrom, rFrom);
      resultTo = Math.max(resultTo, rTo);
    });

    /**
     * if there are multiple ranges,
     * the position of the node calculated at the beginning needs to consider the change of the previous node size
     */
    if (selectedInfos.length > 1) {
      const diffSize = tr.doc.nodeSize - state.doc.nodeSize;
      resultTo += diffSize - Math.floor(diffSize / selectedInfos.length);
    }

    /**
     * if the selection area is split, or the `format range` actually contains the current `selection`,
     * the selection needs to modified to ensure that the same content is selected
     */
    const firstRange = selectedInfos[0];
    const lastRange = selectedInfos[selectedInfos.length - 1];
    if (formatRange || (firstRange.wrappingRange.from < to && lastRange.wrappingRange.to > from)) {
      reSelect = (_tr: Transaction) => {
        if (state.selection instanceof AllSelection) return _tr.setSelection(new AllSelection(_tr.doc));

        ranges.sort((a, b) => a.$from.pos - b.$from.pos);
        const newRange = getRangeAfterReplace(state, _tr, {
          extendedFrom: Math.min(from, resultFrom),
          extendedTo: Math.max(to, resultTo),
          $originFrom: ranges[0].$from,
          $originTo: ranges[ranges.length - 1].$to,
        });

        return _tr.setSelection(TextSelection.create(_tr.doc, newRange.from, newRange.to));
      };
    }

    tr.setSelection(TextSelection.create(tr.doc, resultFrom, resultTo));
  }

  return reSelect(tr);
};

export { clearFormat, formatSelection, getFormat };
