import { Block, findCutBefore, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec } from 'prosemirror-model';
import { EditorState, NodeSelection, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { IMenuConfig, TableButton } from './component/menu-button';
import { ITableProps, NODE_NAME } from './const';
import { canSplitCell, closestTable, createTableNode, goToCell, judgeSelectAllTable, tableOperation } from './utils';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    table?: {
      insert: (row: number, column: number) => boolean;
      cut: () => boolean;
      copy: () => boolean;
      mergeCells: () => boolean;
      splitCells: () => boolean;
      addRowBefore: () => boolean;
      addRowAfter: () => boolean;
      addColumnBefore: () => boolean;
      addColumnAfter: () => boolean;
      deleteRow: () => boolean;
      deleteColumn: () => boolean;
      deleteTable: () => boolean;
      canSplitCell: () => boolean;
      goPrevCell: () => boolean;
      goNextCell: () => boolean;
    };
  }
}

interface ITableItemProps extends IMenuConfig, ITableProps {}

class TableItem extends Block<any> {
  name = NODE_NAME.TABLE;
  content = 'table_row+';
  tableRole = 'table';
  isolating = true;
  notLastLine = true;
  group = 'block';
  parseDOM = [{ tag: 'table' }];
  toDOM = (): DOMOutputSpec => ['table', ['tbody', 0]];
}

class TableItemController extends SylController<ITableItemProps> {
  public name = NODE_NAME.TABLE;
  private menuBtn: TableButton | null = null;
  private $menu: HTMLElement | null = null;

  constructor(editor: SylApi, props: ITableItemProps) {
    super(editor, props);
    if (this.props.trigger === 'hover') this.toolbar.tooltip = false as any;
  }

  public insertTable = ({ row, column }: { row: number; column: number }) => {
    const node = createTableNode(row, column, {
      cellWidth: this.props.defaultCellWidth,
      useTableHeader: this.props.useTableHeader,
    });
    const { index } = this.editor.getSelection();
    const { $from } = this.editor.view.state.selection;
    if (!node) return false;
    this.editor.insert(node);
    let indexOffset = index + 3;
    if ($from && $from.node().childCount) {
      indexOffset = index + 5;
    }
    this.editor.setSelection({
      index: indexOffset,
      length: 0,
    });
    return true;
  };

  public command = {
    insert: (editor: SylApi, row: number, column: number) => this.insertTable({ row, column }),
    cut: (editor: SylApi) => tableOperation.cut(editor),
    copy: (editor: SylApi) => tableOperation.copy(editor),
    mergeCells: (editor: SylApi) => tableOperation.mergeCells(editor),
    splitCells: (editor: SylApi) => tableOperation.splitCells(editor),
    addRowBefore: (editor: SylApi) => tableOperation.addRowBefore(editor),
    addRowAfter: (editor: SylApi) => tableOperation.addRowAfter(editor),
    addColumnBefore: (editor: SylApi) => tableOperation.addRowBefore(editor),
    addColumnAfter: (editor: SylApi) => tableOperation.addColumnAfter(editor),
    deleteRow: (editor: SylApi) => tableOperation.deleteRow(editor),
    deleteColumn: (editor: SylApi) => tableOperation.deleteColumn(editor),
    deleteTable: (editor: SylApi) => tableOperation.deleteTable(editor),
    canSplitCell: (editor: SylApi) => canSplitCell(editor),
    goPrevCell: (editor: SylApi) => {
      const { state, dispatch } = editor.view;
      return goToCell(state, dispatch, -1);
    },
    goNextCell: (editor: SylApi) => {
      const { state, dispatch } = editor.view;
      return goToCell(state, dispatch);
    },
  };

  public keymap = {
    Tab: (editor: SylApi) => this.command.goNextCell(editor),
    'Shift-Tab': (editor: SylApi) => this.command.goPrevCell(editor),
    Backspace: (editor: SylApi, state: EditorState, dispatch: EditorView['dispatch']) => {
      const { $anchor, from, to } = state.selection;
      const tr = state.tr;
      if (judgeSelectAllTable(editor)) {
        const $pos = state.selection.$anchor;
        const node = $pos.node(1);
        if (node.type.spec.tableRole !== 'table') return false;
        tr.setSelection(TextSelection.create(tr.doc, $pos.before(1), $pos.after(1))).deleteSelection();
        dispatch(tr);
        return true;
      }
      if (from !== to) return false;
      const $cut = findCutBefore($anchor);
      if (!$cut) return false;
      const before = $cut.nodeBefore;
      // currently empty, the previous is the node is table
      if (!before || before.type.spec.tableRole !== 'table' || $cut.pos !== from - 1) return false;
      tr.setSelection(NodeSelection.create(state.doc, $cut.pos - before.nodeSize));
      dispatch(tr);
      return true;
    },
  };

  public toolbar = {
    name: NODE_NAME.TABLE,
    tooltip: NODE_NAME.TABLE,
    getRef: (dom: HTMLElement) => {
      if (this.$menu && this.$menu !== dom && this.menuBtn) this.menuBtn.unMount();
      this.$menu = dom;
      this.menuBtn = new TableButton(this.editor, dom, this.insertTable, this.props || {});
    },
    handler: (editor: SylApi) => {},
  };

  public editorWillUnmount() {
    this.menuBtn && this.menuBtn.unMount();
  }

  public disable = (editor: SylApi) => Boolean(closestTable(editor.view.state.selection.$from));
}

class TableItemPlugin extends SylPlugin {
  public Controller = TableItemController;
  public Schema = TableItem;
}

export { TableItem, TableItemController, TableItemPlugin };
