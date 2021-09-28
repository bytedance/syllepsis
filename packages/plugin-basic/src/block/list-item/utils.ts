import { SylApi } from '@syllepsis/adapter';
import { Node as ProsemirrorNode, NodeType, Slice } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { canJoin, liftTarget } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { LIST_ITEM_NAME } from './const';

const getListItemType = (doc: ProsemirrorNode) => doc.type.schema.nodes.list_item as NodeType;

const isInList = (state: EditorState | Transaction) => {
  const itemType = getListItemType(state.doc);
  const { $from, $to } = state.selection;
  if (!itemType || $from.parent.type !== itemType || $to.parent.type !== itemType) return false;
  return true;
};

const getListPos = (state: EditorState, from: number, to: number) => {
  const itemType = getListItemType(state.doc);
  const listRes: number[] = [];
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type === itemType) listRes.push(pos + 1);
    return !node.isLeaf;
  });
  return listRes;
};

const checkAndMergeList = (tr: Transaction, pos: number) => {
  let res = false;
  if (!isInList(tr)) return res;
  const $pos = tr.doc.resolve(pos);
  let beforePos = pos;
  let afterPos = pos;
  if ($pos.depth) {
    beforePos = $pos.before();
    afterPos = $pos.after();
  }

  const $before = tr.doc.resolve(beforePos);
  const beforeNode = $before.nodeBefore;
  const beforeNodeAfter = $before.nodeAfter;
  let beforeNodePos = 0;
  if (beforeNode) beforeNodePos = beforePos - beforeNode.nodeSize;

  if (beforeNode && beforeNodeAfter && beforeNode.type === beforeNodeAfter.type && canJoin(tr.doc, beforePos)) {
    tr.join(beforePos);
    const nodeBefore = tr.doc.nodeAt(beforeNodePos);
    if (nodeBefore) afterPos = beforeNodePos + nodeBefore.nodeSize;
    res = true;
  }

  const $after = tr.doc.resolve(afterPos);
  const afterNode = $after.nodeBefore;
  const afterNodeAfter = $after.nodeAfter;

  if (afterNode && afterNodeAfter && afterNode.type === afterNodeAfter.type && canJoin(tr.doc, afterPos)) {
    tr.join(afterPos);
    res = true;
  }

  return res;
};

// `start` after lift inherits the serial number of the previous list
const fixListStart = (tr: Transaction) => {
  if (isInList(tr)) return;
  const nodeBefore = tr.doc.resolve(tr.selection.$from.before()).nodeBefore;
  const afterPos = tr.selection.$from.after();
  const nodeAfter = tr.doc.resolve(afterPos).nodeAfter;
  if (!nodeBefore || !nodeAfter || nodeBefore.type !== nodeAfter.type) return;
  if (nodeBefore.type.spec.role !== 'list' || !nodeBefore.attrs.start) return;

  let start = parseInt(nodeBefore.attrs.start, 10);
  nodeBefore.content.forEach(child => {
    if (child.type !== nodeBefore.type) start++;
  });
  tr.setNodeMarkup(afterPos, undefined, { start });
};

const doLiftList = (tr: Transaction, pos: number) => {
  const range = tr.doc.resolve(pos).blockRange();
  if (!range) return tr;
  if (range.depth) {
    const target = liftTarget(range);
    if (target === null || target === undefined) return tr;
    tr.lift(range, target ? target : range.depth - 1);
  }
  const $resPos = tr.doc.resolve(tr.mapping.map(range.start));
  if (!$resPos.depth || $resPos.parent.type.spec.role !== 'list') {
    if (!$resPos.nodeAfter) return tr;
    tr.setBlockType($resPos.pos, $resPos.pos + $resPos.nodeAfter.nodeSize, tr.doc.type.contentMatch.defaultType!);
  }

  return tr;
};
const liftListItem = (state: EditorState, dispatch?: EditorView['dispatch']) => {
  if (!isInList(state)) return false;

  const tr = state.tr;
  const { $from, $to } = state.selection;
  const listRes = getListPos(state, $from.pos, $to.pos).reverse();
  listRes.forEach(pos => doLiftList(tr, pos));
  fixListStart(tr);
  dispatch && dispatch(tr);
  return true;
};

// at the start of the line, judged whether to clear the list format
const liftListItemAtHead = (state: EditorState, dispatch?: EditorView['dispatch']) =>
  state.selection.empty && !state.selection.$from.nodeBefore && liftListItem(state, dispatch);

const splitListItem = (state: EditorState, dispatch?: EditorView['dispatch']) => {
  if (!dispatch || !isInList(state)) return false;
  let tr = state.tr;
  const { selection, schema } = state;
  const { $from, $to } = selection;
  const { list_item } = schema.nodes;

  if ($from.parent.content.size === 0) {
    liftListItem(state, dispatch);
    return true;
  }

  tr = tr.delete($from.pos, $to.pos);
  const attrs = $from.node().attrs;

  dispatch(
    tr
      .split($from.pos, 1, [
        {
          type: list_item,
          attrs,
        },
      ])
      .scrollIntoView(),
  );
  return true;
};

const splitListItemKeepMarks = (state: EditorState, dispatch?: EditorView['dispatch']) =>
  splitListItem(
    state,
    dispatch &&
      (tr => {
        const marks = state.storedMarks || (state.selection.$to.parentOffset && state.selection.$from.marks());
        if (marks) tr.ensureMarks(marks);
        dispatch(tr);
      }),
  );

const checkOutMaxNestedLevel = (state: EditorState, maxLevel = 0) => {
  let level = maxLevel;
  if (!level) return false;
  const { $from } = state.selection;
  let depth = $from.depth - 1;
  while (level && depth) {
    const parent = $from.node(depth--);
    if (parent.type.spec.role === 'list') level--;
  }
  return !level;
};

const sinkListItem = (state: EditorState, dispatch?: EditorView['dispatch'], canSink?: () => boolean) => {
  if (!dispatch || !isInList(state)) return false;
  if (canSink && canSink()) return true;

  const { $from, $to } = state.selection;
  let type = state.schema.nodes.bullet_list || state.schema.nodes.ordered_list;
  const tr = state.tr;
  const listRes = getListPos(state, $from.pos, $to.pos);
  listRes.reverse().forEach(pos => {
    const $nFrom = tr.doc.resolve(pos);
    if ($nFrom.depth > 1) type = $nFrom.node(-1).type;
    if (!type) return;
    const range = $nFrom.blockRange();
    tr.wrap(range!, [{ type }]);
    checkAndMergeList(tr, pos);
  });

  dispatch(tr.scrollIntoView());
  return true;
};

const filterKeymap = (fn: (state: EditorState, dispatch?: EditorView['dispatch']) => boolean) => (
  editor: SylApi,
  state: EditorState,
  dispatch?: EditorView['dispatch'],
) => fn(state, dispatch);

const getListItem = (slice: Slice) => {
  let listNode: ProsemirrorNode | null = null;

  slice.content.descendants(node => {
    if (node.type.name === LIST_ITEM_NAME) {
      listNode = node;
      return false;
    }
    if (listNode) return false;
  });

  return listNode as ProsemirrorNode | null;
};

export {
  checkAndMergeList,
  checkOutMaxNestedLevel,
  filterKeymap,
  getListItem,
  liftListItem,
  liftListItemAtHead,
  sinkListItem,
  splitListItemKeepMarks,
};
