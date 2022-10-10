import lodashMerge from 'lodash.merge';
import { Mark, MarkType, Node as ProsemirrorNode, NodeType } from 'prosemirror-model';
import { NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { tryReplaceEmpty, Types, validateNodeContent } from '../libs';

interface IGeneralOption {
  addToHistory?: boolean;
  scrollIntoView?: boolean;
  focus?: boolean;
}
interface InsertOption extends IGeneralOption {
  index?: number;
  replaceEmpty?: boolean;
  deleteSelection?: boolean;
  inheritMarks?: boolean;
}

interface ICardInfo {
  type: string;
  attrs?: Types.StringMap<any>;
}

interface IMarkInfo {
  type: string;
  attrs?: Types.StringMap<any>;
}

interface INodeInfo extends ICardInfo {
  content?: INodeInfo[] | string;
  marks?: Array<string | IMarkInfo>;
}

const defaultInsertOption: Required<InsertOption> = {
  index: 0,
  scrollIntoView: true,
  focus: true,
  replaceEmpty: true,
  addToHistory: true,
  deleteSelection: true,
  inheritMarks: true,
};

const getOption = (defaultOption: Types.StringMap<any>) => <T>(
  param: number | Types.StringMap<any> | undefined,
  curIndex: any,
): T => {
  const option: any = { ...defaultOption, index: curIndex };

  if (typeof param === 'number') {
    option.index = param;
  } else if (param instanceof Object) {
    Object.assign(option, param);
  }

  return option;
};

const getInsertOption = getOption(defaultInsertOption);

const getNodeType = (view: EditorView, nodeName: string) => {
  const node = view.state.schema.nodes[nodeName];
  if (!node) {
    console.error(`Not found ${nodeName} in schema!`);
    return false;
  }
  if (nodeName === 'text') {
    return {
      name: 'text',
      create: (attrs, content, marks) => view.state.schema.text(content, marks),
    } as NodeType;
  }
  return node;
};

const getMarkType = (view: EditorView, markName: string) => {
  const mark = view.state.schema.marks[markName];
  if (!mark) {
    console.error(`Not found ${markName} in schema!`);
    return false;
  }
  return mark;
};

const createMark = (mark: MarkType, attrs?: Types.StringMap<any>) => mark.create(attrs);

const createNode = (
  node: NodeType | any,
  attrs?: Types.StringMap<any>,
  content?: ProsemirrorNode[] | string,
  marks?: Mark[],
) => (node as any).create(attrs, content, marks) as ProsemirrorNode;

const collector = <T>(
  data: string | any[] | undefined,
  fn: (item: any, index: number, total: any[]) => T | undefined,
) => {
  const collectList: T[] = [];
  if (!data) return collectList;
  if (typeof data === 'string') return data;
  data.reduce((result, ...args) => {
    const res = fn(...args);
    if (res) result.push(res);
    return result;
  }, collectList);

  return collectList;
};

const generateMark = (view: EditorView, mark: IMarkInfo | string) => {
  const markInfo = typeof mark === 'string' ? { type: mark } : mark;
  const markType = getMarkType(view, markInfo.type);
  if (!markType) return;
  return createMark(markType, markInfo.attrs);
};

const generateNode = (view: EditorView, topNodeInfo: INodeInfo | string): ProsemirrorNode | undefined => {
  const nodeInfo = typeof topNodeInfo === 'string' ? { type: topNodeInfo } : topNodeInfo;

  const { marks, type, attrs, content } = nodeInfo;
  const topNodeType = getNodeType(view, type);
  if (!topNodeType) return;

  const contentMarks: Mark[] = collector<Mark>(marks as IMarkInfo[], (_markInfo: IMarkInfo) =>
    generateMark(view, _markInfo),
  ) as Mark[];

  const contentNodes: string | ProsemirrorNode[] = collector<ProsemirrorNode>(content, (_nodeInfo: INodeInfo) =>
    generateNode(view, _nodeInfo),
  );

  return createNode(topNodeType, attrs, contentNodes, contentMarks);
};

/**
 * insert
 */
const insert = (view: EditorView, nodeInfo: INodeInfo | string, index?: InsertOption | number) => {
  const { state, dispatch } = view;
  const userConfig = getInsertOption<Required<InsertOption>>(index, state.selection.from);

  const { index: pos, scrollIntoView, deleteSelection, addToHistory } = userConfig;
  const $from = state.doc.resolve(pos);
  const newNode = generateNode(view, nodeInfo);
  if (!newNode) return;

  const tr = state.tr;

  if (deleteSelection && pos === state.selection.from) {
    tr.deleteSelection();
  }

  const isInlineNode = newNode.type.isInline;
  if (isInlineNode && userConfig.inheritMarks) {
    let curMarks: Mark[] = view.state.storedMarks || [];
    if (!curMarks.length) curMarks = $from.marks();
    if (curMarks.length) {
      curMarks.push(...newNode.marks);
      newNode.marks = curMarks;
    }
  }

  if (state.doc.resolve(pos).depth >= 2) {
    // insert inline node directly
    if (isInlineNode) {
      tr.insert(pos, newNode);
    } else if (!tryReplaceEmpty(tr, $from, newNode)) {
      const $pos = tr.doc.resolve(pos);
      let depth = $pos.depth;
      // find the parent node that can be inserted into the block node to avoid tearing the node after insertion
      while (depth >= 0) {
        const higherNode = $pos.node(depth);
        if (validateNodeContent(higherNode, newNode)) {
          tr.insert($pos.after(depth + 1), newNode);
          break;
        }
        depth--;
      }
    }
  } else if (!userConfig.replaceEmpty || !tryReplaceEmpty(tr, $from, newNode)) {
    tr.insert(pos, newNode);
    if (state.selection instanceof NodeSelection && pos === state.selection.from && newNode.isLeaf && !newNode.isText) {
      tr.setSelection(NodeSelection.create(tr.doc, pos));
    }
  }

  if (!addToHistory) tr.setMeta('addToHistory', false);
  dispatch(scrollIntoView ? tr.scrollIntoView() : tr);
  userConfig.focus && view.focus();
};

const insertText = (
  view: EditorView,
  text: string,
  format: Types.StringMap<any> = {},
  index?: number | InsertOption,
) => {
  const marks = [] as IMarkInfo[];
  let topNodeInfo: INodeInfo | null = null;

  Object.keys(format).forEach(type => {
    if (getNodeType(view, type)) topNodeInfo = { type, attrs: format[type] };
    else if (getMarkType(view, type)) marks.push({ type, attrs: format[type] });
  });

  const textNodeInfo = { type: 'text', content: text, marks };

  if (!topNodeInfo) {
    return insert(view, textNodeInfo, index);
  } else {
    return insert(view, Object.assign(topNodeInfo, { content: [textNodeInfo] }));
  }
};

/**
 * replace
 */
interface IReplaceOption extends IGeneralOption {
  index: number;
  length: number;
  inheritMarks?: boolean;
  replaceEmpty?: boolean;
}
const defaultReplaceOption: Required<IReplaceOption> = {
  index: 0,
  length: -1,
  scrollIntoView: true,
  inheritMarks: true,
  addToHistory: true,
  replaceEmpty: true,
  focus: true,
};
const getReplaceOption = getOption(defaultReplaceOption);

const replace = (view: EditorView, nodeInfo: INodeInfo | string, replaceOption?: IReplaceOption | number) => {
  const config = getReplaceOption<Required<IReplaceOption>>(replaceOption, view.state.selection.from);

  const newNode = generateNode(view, nodeInfo);
  if (!newNode) return;

  const { state, dispatch } = view;
  const { tr } = state;

  const $from = state.doc.resolve(config.index);
  let $to = state.selection.$to;
  let length = config.length;
  if (length >= 0) {
    $to = state.doc.resolve(config.index + length);
  }
  if (config.inheritMarks) {
    ($from.marksAcross($to) || []).forEach(mark => {
      if (!newNode.marks.some(({ type }) => type === mark.type)) {
        newNode.marks = mark.addToSet(newNode.marks);
      }
    });
  }

  const { index, scrollIntoView, focus, addToHistory } = config;
  if (length < 0) length = $to.pos - $from.pos;

  if (!config.replaceEmpty || !tryReplaceEmpty(tr, $from, newNode)) tr.replaceWith(index, index + length, newNode);

  if (!addToHistory) tr.setMeta('addToHistory', false);
  dispatch(scrollIntoView ? tr.scrollIntoView() : tr);
  focus && view.focus();
};

/**
 * update
 */
interface IUpdateOption extends IGeneralOption {
  index: number;
  merge?: boolean; // whether to merge Object, the default is true
}
const defaultUpdateOption: Required<IUpdateOption> = {
  index: 0,
  scrollIntoView: false,
  focus: false,
  addToHistory: true,
  merge: true,
};

const getUpdateOption = getOption(defaultUpdateOption);

const update = (view: EditorView, attrs: Types.StringMap<any>, updateOption: IUpdateOption | number) => {
  const { state, dispatch } = view;
  const { index, scrollIntoView, focus, addToHistory, merge } = getUpdateOption<Required<IUpdateOption>>(
    updateOption,
    state.selection.from,
  );
  let tr = state.tr;
  const curNode = state.doc.nodeAt(index);
  if (!curNode) return false;
  if (!Object.keys(attrs).some(key => key in curNode.attrs)) return;

  const handle = merge ? lodashMerge : Object.assign;
  tr = tr.setNodeMarkup(index, undefined, handle({}, curNode.attrs, attrs));

  if (!addToHistory) tr = tr.setMeta('addToHistory', false);
  dispatch(scrollIntoView ? tr.scrollIntoView() : tr);
  focus && view.focus();
};

/**
 * delete
 */
interface IDeleteOption extends IGeneralOption {
  index?: number;
  length?: number;
}

const defaultDeleteOption: Required<IDeleteOption> = {
  index: 0,
  length: 1,
  scrollIntoView: true,
  addToHistory: true,
  focus: true,
};

const getDeleteOption = getOption(defaultDeleteOption);

const _delete = (view: EditorView, deleteOption: IDeleteOption) => {
  const selection = view.state.selection;
  const { index, length, scrollIntoView, focus, addToHistory } = getDeleteOption<Required<IDeleteOption>>(
    deleteOption,
    selection.from,
  );
  const from = index === 0 || index ? index : selection.from;
  const to = length === 0 || length ? from + length : selection.to;
  const { state, dispatch } = view;
  const tr = state.tr.delete(from, to);

  if (!addToHistory) tr.setMeta('addToHistory', false);
  dispatch(scrollIntoView ? tr.scrollIntoView() : tr);
  focus && view.focus();
};

export {
  _delete,
  ICardInfo,
  IGeneralOption,
  INodeInfo,
  insert,
  InsertOption,
  insertText,
  IReplaceOption,
  IUpdateOption,
  replace,
  update,
};
