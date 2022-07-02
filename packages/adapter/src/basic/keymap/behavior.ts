import { undo as OriginUndo } from 'prosemirror-history';
import { Fragment, Node, ResolvedPos } from 'prosemirror-model';
import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from 'prosemirror-state';
import { canSplit, liftTarget } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { findCutBefore, getPrevNodeLastTextBlock, getStoreMarks } from '../../libs';
import { undoTextShortcut } from '../text-shortcut/shortcut-plugin';

const appendKeepMark = (command: (state: EditorState, dispatch: EditorView['dispatch']) => any) => (
  state: EditorState,
  dispatch?: EditorView['dispatch'],
) =>
  command(state, tr => {
    const marks = state.storedMarks || (state.selection.$to.parentOffset && state.selection.$from.marks());
    if (marks) tr.ensureMarks(marks);
    dispatch && dispatch(tr);
  });

const doLiftNode = (tr: Transaction, pos: number) => {
  const range = tr.doc.resolve(pos).blockRange();
  if (!range) return tr;
  if (range.depth) {
    const target = liftTarget(range);
    if (target === null || target === undefined) return tr;
    tr.lift(range, target ? target : range.depth - 1);
  }
  const $resPos = tr.doc.resolve(tr.mapping.map(range.start));
  if (!$resPos.depth || $resPos.parent.type.isTextblock) {
    if (!$resPos.nodeAfter) return tr;
    tr.setBlockType($resPos.pos, $resPos.pos + $resPos.nodeAfter.nodeSize, tr.doc.type.contentMatch.defaultType!);
  }

  return tr;
};

const insertBreak = (state: EditorState, dispatch?: EditorView['dispatch']) => {
  const { selection } = state;
  if ((selection as TextSelection).$cursor && selection.empty) {
    const marks = getStoreMarks(state);
    dispatch?.(state.tr.insert(selection.from, state.schema.nodes.break.create()).ensureMarks(marks));
    return true;
  }
  return false;
};

const deleteSelection = (state: EditorState, dispatch?: EditorView['dispatch']) => {
  const { empty, from, $from } = state.selection;
  if (empty) return false;
  let tr = state.tr.deleteSelection();
  const textOffset = $from.parentOffset;
  const newSelection = Selection.near(tr.doc.resolve(from - 1 > 0 ? (textOffset ? from : from - 1) : 1));
  tr = tr.setSelection(newSelection).scrollIntoView();
  dispatch && dispatch(tr);
  return true;
};

/**
 * at the beginning of the content select the node with the `spec` `sylCard`
 * jump to the end of `textblock`
 * join any joinable
 */
const selectBefore = (state: EditorState, dispatch?: EditorView['dispatch']) => {
  const { $cursor } = state.tr.selection as TextSelection;
  if (!$cursor || $cursor.parentOffset || !$cursor.parent.content.size) {
    return false;
  }
  const $cut = findCutBefore($cursor);
  if (!$cut) return false;
  const before = $cut.nodeBefore;
  if (!before) return false;
  if (before.type.spec.sylCard) {
    const newSelection = NodeSelection.create(state.tr.doc, $cut.pos - before.nodeSize);
    dispatch && dispatch(state.tr.setSelection(newSelection));
    return true;
  }

  if (before.type.spec.role === 'list') {
    const { node, pos } = getPrevNodeLastTextBlock($cut);
    if (node && dispatch) {
      const tr = state.tr.deleteRange(pos + node.nodeSize - 1, $cursor.pos);
      dispatch(tr.setSelection(TextSelection.create(tr.doc, pos + node.nodeSize - 1)).scrollIntoView());
      return true;
    }
  }
  return false;
};

const splitBlock = (state: EditorState, dispatch?: EditorView['dispatch']) => {
  const ref = state.selection;
  const { $from, $to } = ref;

  if (state.selection instanceof NodeSelection && state.selection.node.isBlock) {
    if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) {
      return false;
    }
    dispatch && dispatch(state.tr.split($from.pos).scrollIntoView());
    return true;
  }

  if (!$from.parent.isBlock) {
    return false;
  }

  // the paragraph is only recreated when there is no content, and the remaining types are created when at the end
  const needCreate =
    $from.parent.type === state.doc.type.contentMatch.defaultType
      ? !$from.parent.textContent
      : $to.parentOffset === $to.parent.content.size;
  const tr = state.tr;
  if (state.selection instanceof TextSelection) {
    tr.deleteSelection();
  }

  const defaultType = $from.depth === 0 ? undefined : $from.node(-1).contentMatchAt($from.indexAfter(-1)).defaultType;

  let types = needCreate && defaultType ? [{ type: defaultType }] : undefined;
  let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
  if (!types && !can && defaultType && canSplit(tr.doc, tr.mapping.map($from.pos), 1, [{ type: defaultType }])) {
    types = [{ type: defaultType! }];
    can = true;
  }

  if (can && defaultType) {
    tr.split(tr.mapping.map($from.pos), 1, types);

    if (
      !needCreate &&
      !$from.parentOffset &&
      $from.parent.type !== defaultType &&
      $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), Fragment.from(defaultType.create()))
    ) {
      tr.setNodeMarkup(tr.mapping.map($from.before()), defaultType);
    }
  }
  dispatch && dispatch(tr.scrollIntoView());

  return true;
};

const splitBlockKeepMarks = appendKeepMark(splitBlock);

const deleteZeroChar = (state: EditorState, dispatch?: EditorView['dispatch']) => {
  const tr = state.tr;
  const { $from } = state.selection;

  if (!$from.nodeBefore) return false;

  const zeroChars: { from: number; to: number }[] = [];
  let deleteLen = 0;

  const getMatchRes = ($pos: ResolvedPos, node: Node | undefined | null) => {
    if (!node) return;
    const matchRes = node.textContent.match(/\u200B+$/);
    if (matchRes) {
      deleteLen = matchRes[0].length;
      zeroChars.push({ from: $pos.pos - matchRes[0].length, to: $pos.pos });
    }
  };

  getMatchRes($from, $from.nodeBefore);
  const $posBefore = tr.doc.resolve($from.pos - deleteLen - 1);
  getMatchRes($posBefore, $posBefore.nodeBefore);

  zeroChars.forEach(({ from, to }) => tr.delete(from, to));
  dispatch && dispatch(tr);
  return false;
};

const clearAtHead = (state: EditorState, dispatch?: EditorView['dispatch']) => {
  const { $from, empty } = state.selection;
  if (!empty) return false;
  if ($from.pos !== 1 || $from.depth !== 1) return false;

  const { tr, doc } = state;
  const parentNode = $from.node();
  if (!parentNode.isTextblock || parentNode.childCount) return false;

  const afterPos = $from.after();

  const nodeAfter = state.doc.resolve(afterPos).nodeAfter;
  if (nodeAfter) {
    tr.delete($from.before(), afterPos);
    dispatch?.(tr);
    return true;
  }

  const defaultNodeType = doc.type.contentMatch.defaultType!;
  const defaultNode = defaultNodeType.create();
  if (!parentNode.eq(defaultNode)) {
    dispatch?.(tr.setBlockType($from.before(), afterPos, defaultNodeType));
    return true;
  }

  return false;
};

const undo = (state: EditorState, dispatch?: EditorView['dispatch']): boolean =>
  [undoTextShortcut, OriginUndo].some(fn => fn(state, dispatch));

export {
  clearAtHead,
  deleteSelection,
  deleteZeroChar,
  doLiftNode,
  insertBreak,
  selectBefore,
  splitBlock,
  splitBlockKeepMarks,
  undo,
};
