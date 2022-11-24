import { createDetachedElement, SylApi } from '@syllepsis/adapter';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { AllSelection, EditorState, Plugin, PluginKey, TextSelection, Transaction } from 'prosemirror-state';
import { CellSelection } from 'prosemirror-tables';

import { NODE_NAME } from './const';
import { TContextMenu } from './menu-helper';
import { TableContextMenu } from './table-context-menu';
import { closestCell, judgeSelectAllTable } from './utils';

const KEY = new PluginKey('tableHelper');

const getCellPosInTable = (table: ProseMirrorNode, anchorCell: ProseMirrorNode, headCell: ProseMirrorNode) => {
  let anchor = 0;
  let head = 0;
  table.content.forEach((tableRow: ProseMirrorNode, offset: number) => {
    if (anchor && head) return false;
    tableRow.content.forEach((tableCell: ProseMirrorNode, cellOffset: number) => {
      if (tableCell === anchorCell) anchor = offset + cellOffset;
      else if (tableCell === headCell) head = offset + cellOffset;
    });
  });

  return {
    anchor,
    head,
  };
};

const TableHelperPlugin = (editor: SylApi, menus: TContextMenu[]) =>
  new Plugin({
    key: KEY,
    view: view => new TableContextMenu(editor, view, menus),
    props: {
      handleDOMEvents: {
        cut(view, event: Event) {
          const { state, dispatch } = view;
          const tr = state.tr;
          if (judgeSelectAllTable(editor)) {
            const $pos = state.selection.$anchor;
            const node = $pos.node(1);
            if (node.type.spec.tableRole === 'table') {
              const from = $pos.before(1);
              const to = $pos.after(1);
              dispatch(tr.setSelection(TextSelection.create(tr.doc, from, to)));
            }
          }
          return false;
        },
      },
      transformPastedHTML(html: string) {
        const metas = /(\s*<meta [^>]*>)*/.exec(html);
        let result = html;
        if (metas) result = html.slice(metas[0].length);
        const $div = createDetachedElement('div');
        $div.innerHTML = result;
        if ($div.children.length === 1) {
          const $context = $div.querySelector('[data-pm-slice]');
          const sliceData = $context && /^(\d+) (\d+) (.*)/.exec($context.getAttribute('data-pm-slice') || '');
          try {
            // when copying a single text in the table, remove `data-pm-slice`.(it will cause contain table_cell)
            if (
              $context &&
              sliceData &&
              sliceData[1] === sliceData[2] &&
              sliceData[3].indexOf('["table",null,"table_row",null,') === 0
            ) {
              $context.removeAttribute('data-pm-slice');
            }
          } catch (e) {
            return html;
          }
        }
        return $div.innerHTML;
      },
    },
    appendTransaction: (trs: readonly Transaction[], oldState: EditorState, newState: EditorState) => {
      if (newState.selection instanceof CellSelection || newState.selection instanceof AllSelection) {
        return;
      }
      const { $from, $to, empty } = newState.selection;
      if (empty || !$from.depth || !$to.depth) return;
      const fromNode = $from.node(1);
      const toNode = $from.node(1);

      if (fromNode.type.name === NODE_NAME.TABLE && fromNode === toNode) {
        // convert all selected across cells in the table to CellSelection
        const fromCell = closestCell($from);
        const toCell = closestCell($to);

        if (!fromCell || !toCell || fromCell.node === toCell.node) return;
        const { anchor, head } = getCellPosInTable(fromNode, fromCell.node, toCell.node);
        const startPos = $from.before(1) + 2;

        return newState.tr.setSelection(CellSelection.create(newState.doc, startPos + anchor, startPos + head) as any);
      }
    },
  });

export { TableHelperPlugin };
