import { SylApi, Types } from '@syllepsis/adapter';
import { AttributeSpec, Node as ProsemirrorNode, ResolvedPos } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  CellSelection,
  deleteColumn,
  deleteRow,
  deleteTable,
  goToNextCell,
  mergeCells,
  splitCell,
} from 'prosemirror-tables';
import { EditorView } from 'prosemirror-view';

import { NODE_NAME } from './const';

const isInList = ($pos: ResolvedPos) => $pos.parent.type.name === 'list_item';

const createCellAttrs = (defaultColWidth: number, extraAttrs: Types.StringMap<any> = {}) => {
  const attrs: Types.StringMap<AttributeSpec> = {
    colspan: {
      default: 1,
    },
    rowspan: {
      default: 1,
    },
    colwidth: {
      default: [defaultColWidth],
    },
  };

  Object.keys(extraAttrs).forEach(key => {
    attrs[key] = { default: extraAttrs[key].default };
  });

  return attrs;
};

const getCellAttrs = (dom: Element, extraAttrs: Types.StringMap<any> = {}): Types.StringMap<any> => {
  const widthAttr = dom.getAttribute('data-colwidth');
  const widths = widthAttr && /^\d+(,\d+)*$/.test(widthAttr) ? widthAttr.split(',').map(s => Number(s)) : null;
  const colspan = Number(dom.getAttribute('colspan') || 1);
  const result: Types.StringMap<any> = {
    colspan,
    rowspan: Number(dom.getAttribute('rowspan') || 1),
    colwidth: widths && widths.length === colspan ? widths : null,
  };

  Object.keys(extraAttrs).forEach(prop => {
    const getter = extraAttrs[prop].getFromDOM;
    const value = getter && getter(dom);
    if (value !== null) result[prop] = value;
  });

  return result;
};

const setCellAttrs = (node: ProsemirrorNode, extraAttrs: Types.StringMap<any> = {}) => {
  const attrs: Types.StringMap<any> = {};
  if (node.attrs.colspan !== 1) attrs.colspan = node.attrs.colspan;
  if (node.attrs.rowspan !== 1) attrs.rowspan = node.attrs.rowspan;
  if (node.attrs.colwidth) attrs['data-colwidth'] = node.attrs.colwidth.join(',');

  Object.keys(extraAttrs).forEach(prop => {
    const setter = extraAttrs[prop].setDOMAttr;
    if (setter) setter(node.attrs[prop], attrs);
  });

  return attrs;
};

const createRow = (type: string, _column: number, config: { cellWidth?: number }) => {
  const content = [];
  let col = _column;
  const attrs = type === NODE_NAME.TABLE_CELL ? { colwidth: [config.cellWidth] } : undefined;
  while (col--) {
    content.push({ type, attrs, content: [{ type: 'paragraph' }] });
  }
  return {
    type: NODE_NAME.TABLE_ROW,
    content,
  };
};

const createTableNode = (_row: number, column: number, config: { cellWidth?: number; useTableHeader?: boolean }) => {
  if (!_row || !column) return null;
  let row = _row;
  const content = [];
  if (config.useTableHeader) {
    content.push(createRow(NODE_NAME.TABLE_HEADER, column, config));
    row--;
  }
  while (row--) {
    content.push(createRow(NODE_NAME.TABLE_CELL, column, config));
  }
  return { type: NODE_NAME.TABLE, content };
};

const closestNode = ($pos: ResolvedPos, nodeNames: string[]) => {
  let depth = $pos.depth;
  while (depth > 0) {
    const node = $pos.node(depth);
    if (nodeNames.some(name => name === node.type.name)) {
      return { node, from: $pos.before(depth), to: $pos.after(depth) };
    }
    depth--;
  }
};

const closestCell = ($pos: ResolvedPos) => closestNode($pos, [NODE_NAME.TABLE_CELL, NODE_NAME.TABLE_HEADER]);

const closestTable = ($pos: ResolvedPos) => closestNode($pos, [NODE_NAME.TABLE]);

const goToCell = (state: EditorState, dispatch: EditorView['dispatch'], dir: 1 | -1 = 1) => {
  const { $from } = state.selection;
  const tableInfo = closestTable($from);
  if (!tableInfo) return false;
  const table = tableInfo.node;
  if (isInList($from)) return false;
  const cellInfo = closestCell($from);
  if (!cellInfo) return false;
  const cell = cellInfo.node;
  if (dir === -1 && table.firstChild && cell === table.firstChild.firstChild) return true;
  else if (dir === 1 && table.lastChild && cell === table.lastChild.lastChild) return true;
  return goToNextCell(dir)(state, dispatch);
};

// get the total number of cells in the table
const getTableLength = (node: ProsemirrorNode) => {
  if (node.type.name === 'table') {
    const rowLength = node.childCount;
    const colLength = (node.firstChild && node.firstChild.childCount) || 0;
    return rowLength * colLength;
  }
  return 0;
};

const judgeSelectAllTable = (editor: SylApi) => {
  try {
    const { ranges, $head } = editor.view.state.selection;
    const tableNode = $head.node(1);
    return ranges.length === getTableLength(tableNode);
  } catch (e) {
    return false;
  }
};

const cellWrapping = ($pos: ResolvedPos) => {
  for (let d = $pos.depth; d > 0; d--) {
    const role = $pos.node(d).type.spec.tableRole;
    if (role === 'cell' || role === 'header_cell') return $pos.node(d);
  }
  return null;
};

const canSplitCell = (editor: SylApi): boolean => {
  const sel = editor.view.state.selection;
  let cellNode;
  if (!(sel instanceof CellSelection)) {
    cellNode = cellWrapping(sel.$from);
    if (!cellNode) return false;
  } else {
    if (sel.$anchorCell.pos !== sel.$headCell.pos) return false;
    cellNode = sel.$anchorCell.nodeAfter;
  }
  if (cellNode && cellNode.attrs.colspan === 1 && cellNode.attrs.rowspan === 1) {
    return false;
  }
  return true;
};

const tableOperation = {
  cut(editor: SylApi) {
    const { state } = editor.view;
    editor.focus();
    const sel = state.selection;
    if (sel.empty) return;
    return document.execCommand('cut');
  },
  copy(editor: SylApi) {
    editor.focus();
    return document.execCommand('copy');
  },
  mergeCells(editor: SylApi) {
    const { state, dispatch } = editor.view;
    return mergeCells(state, dispatch);
  },
  splitCells(editor: SylApi) {
    const { state, dispatch } = editor.view;
    return splitCell(state, dispatch);
  },
  addRowBefore(editor: SylApi) {
    const { state, dispatch } = editor.view;
    return addRowBefore(state, dispatch);
  },
  addRowAfter(editor: SylApi) {
    const { state, dispatch } = editor.view;
    return addRowAfter(state, dispatch);
  },
  addColumnBefore(editor: SylApi) {
    const { state, dispatch } = editor.view;
    return addColumnBefore(state, dispatch);
  },
  addColumnAfter(editor: SylApi) {
    const { state, dispatch } = editor.view;
    return addColumnAfter(state, dispatch);
  },
  deleteRow(editor: SylApi) {
    const { state, dispatch } = editor.view;
    return deleteRow(state, dispatch);
  },
  deleteColumn(editor: SylApi) {
    const { state, dispatch } = editor.view;
    return deleteColumn(state, dispatch);
  },
  deleteTable(editor: SylApi) {
    const { state, dispatch } = editor.view;
    return deleteTable(state, dispatch);
  },
  canSplitCell: (editor: SylApi) => canSplitCell(editor),
};

export {
  canSplitCell,
  closestCell,
  closestTable,
  createCellAttrs,
  createTableNode,
  getCellAttrs,
  goToCell,
  judgeSelectAllTable,
  setCellAttrs,
  tableOperation,
};
