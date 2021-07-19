# @syllepsis/plugin-table

[official website](https://bytedance.github.io/syllepsis/)

`prosemirror-tables` combine with `syllepsis`.

we provide more custom props and context menus to help you edit table more easily.

```
import { TablePlugin } from '@syllepsis/plugin-table'

new TablePlugin({
    // about resize handler
    columnResize?: {
      handleWidth?: number, // width of indicator bar.(default 5)
      cellMinWidth?: number // min width of cell. (default 56)
    },
    // relative to table
    table: {
      defaultCellWidth?: number    // default width of cell.(default 88)
      useTableHeader?: boolean // whether to use `table_header`
      cellAttributes: IUserAttrsConfig; // extends of attrs
    },
    // toolbar button config of `table`
    button?: {
      row?: number, // number of rows inserted in the indicated area，default 7
      column?: number, // number of column inserted in the indicated area，default 7
      cellWith?: number, // width of cell，default 16
      margin?: number, // margin of cell，default 2
      defaultColor?: string, // default cell background，default #F2F2F2
      activeColor?: string, // default active background，default #B2D1FF
      trigger?: 'hover' | 'click' // trigger method of table
    }
})
```
