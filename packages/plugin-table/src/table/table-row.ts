import { Block, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec } from 'prosemirror-model';

import { ITableProps, NODE_NAME } from './const';

const createTableRowPlugin = (props: ITableProps): typeof SylPlugin => {
  class TableRowItem extends Block<any> {
    name = NODE_NAME.TABLE_ROW;
    content = `(table_cell${props.useTableHeader ? ' | table_header' : ''})*`;
    tableRole = 'row';
    parseDOM = [{ tag: 'tr' }];
    toDOM = (): DOMOutputSpec => ['tr', 0];
  }

  return class TableRowPlugin extends SylPlugin {
    public Schema = TableRowItem;
  };
};

export { createTableRowPlugin };
