import { Types } from '@syllepsis/adapter';

const NODE_NAME = {
  TABLE: 'table',
  TABLE_CELL: 'table_cell',
  TABLE_HEADER: 'table_header',
  TABLE_ROW: 'table_row',
};
interface ITableProps {
  allowTableNodeSelection: boolean;
  defaultCellWidth: number;
  useTableHeader: boolean;
  cellAttributes: Types.StringMap<{
    default: any;
    getFromDOM: (dom: HTMLElement) => any;
    setDOMAttr: (value: string, attrs: Types.StringMap<any>) => any;
  }>;
}

const TABLE_CONFIG: ITableProps = {
  allowTableNodeSelection: false,
  defaultCellWidth: 88,
  cellAttributes: {},
  useTableHeader: true,
};

export { ITableProps, NODE_NAME, TABLE_CONFIG };
