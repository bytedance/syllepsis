import './style.css';

import { SylApi, SylUnionPlugin } from '@syllepsis/adapter';
import merge from 'lodash.merge';
import { columnResizing, isInTable, tableEditing } from 'prosemirror-tables';
import { NodeView } from 'prosemirror-view';

import { BUTTON_DEFAULT_CONFIG, IMenuConfig } from './component/menu-button';
import { ITableProps, TABLE_CONFIG } from './const';
import { createTableCellPlugin } from './table-cell';
import { createTableHeaderPlugin } from './table-header';
import { TableHelperPlugin } from './table-helper';
import { TableItemPlugin } from './table-item';
import { createTableRowPlugin } from './table-row';

interface ITablePluginProps {
  columnResize?: { handleWidth?: number; cellMinWidth?: number; View?: NodeView<any>; lastColumnResizable?: boolean };
  table?: Partial<ITableProps>;
  button?: IMenuConfig;
}

const DEFAULT_PROPS = {
  columnResize: { handleWidth: 5, cellMinWidth: 56 },
  table: TABLE_CONFIG,
  button: BUTTON_DEFAULT_CONFIG,
};

// locale menuTip
class TablePlugin extends SylUnionPlugin<ITablePluginProps> {
  public name = 'table';

  public init(editor: SylApi, props: ITablePluginProps) {
    const config = merge({}, DEFAULT_PROPS, props);
    const sylPlugins = [
      { plugin: createTableCellPlugin(config.table) },
      { plugin: createTableRowPlugin(config.table) },
      { plugin: TableItemPlugin, controllerProps: { ...config.table, ...config.button } },
    ];

    if (config.table.useTableHeader) sylPlugins.push({ plugin: createTableHeaderPlugin(config.table) });

    return {
      nativePlugins: [columnResizing(config.columnResize), tableEditing(config.table), TableHelperPlugin(editor)],
      sylPlugins,
    };
  }
}

export { isInTable, ITablePluginProps, ITableProps, TablePlugin };
