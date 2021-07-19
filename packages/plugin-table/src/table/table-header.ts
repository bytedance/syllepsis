import { Block, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node as ProsemirrorNode } from 'prosemirror-model';

import { ITableProps, NODE_NAME } from './const';
import { createCellAttrs, getCellAttrs, setCellAttrs } from './utils';

const createTableHeaderPlugin = (props: ITableProps): typeof SylPlugin => {
  class TableHeaderItem extends Block<any> {
    name = NODE_NAME.TABLE_HEADER;
    content = 'block+';
    attrs = createCellAttrs(props.defaultCellWidth!, props.cellAttributes);
    tableRole = 'header_cell';
    isolating = true;
    parseDOM = [
      {
        tag: 'th',
        getAttrs: (dom: HTMLElement): any => getCellAttrs(dom, props.cellAttributes)
      }
    ];
    toDOM = (node: ProsemirrorNode): DOMOutputSpec => ['th', setCellAttrs(node, props.cellAttributes), 0];
  }

  return class TableHeaderPlugin extends SylPlugin {
    public Schema = TableHeaderItem;
  };
};

export { createTableHeaderPlugin };
