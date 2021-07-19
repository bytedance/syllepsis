import { Block, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node as ProsemirrorNode } from 'prosemirror-model';

import { ITableProps, NODE_NAME } from './const';
import { createCellAttrs, getCellAttrs, setCellAttrs } from './utils';

const createTableCellPlugin = (props: ITableProps): typeof SylPlugin => {
  class TableCellItem extends Block<any> {
    name = NODE_NAME.TABLE_CELL;
    content = 'block+';
    attrs = createCellAttrs(props.defaultCellWidth!, props.cellAttributes);
    tableRole = 'cell';
    isolating = true;
    parseDOM = [
      {
        tag: 'td',
        getAttrs: (dom: HTMLElement): any => getCellAttrs(dom, props.cellAttributes)
      },
      {
        tag: 'th',
        priority: 20,
        getAttrs: (dom: HTMLElement): any => getCellAttrs(dom, props.cellAttributes)
      }
    ];
    toDOM = (node: ProsemirrorNode): DOMOutputSpec => ['td', setCellAttrs(node, props.cellAttributes), 0];
  }
  return class TableCellPlugin extends SylPlugin {
    public Schema = TableCellItem;
  };
};

export { createTableCellPlugin };
