# TablePlugin <!-- {docsify-ignore-all} -->

> [Type](/en/plugins/types)

```typescript
import {TablePlugin} from'@syllepsis/plugin-table';

plugins: [
  new TablePlugin({
      // Scaling related configuration
      columnResize?: {
        handleWidth?: number, // The width of the zoom indicator bar, the default is 5
        cellMinWidth?: number // minimum cell width, default 56
      },
      // Table related configuration
      table: {
        defaultCellWidth?: number // The default cell width, the default is 88
        useTableHeader?: boolean // Whether to use table_header node
        // Used to increase cell default attrs
        cellAttributes: IUserAttrsConfig; // extend default attrs
      },
      // Menu button related configuration
      button?: {
        row?: number, // number of rows, default 7
        column?: number, // The number of columns, the default is 7
        cellWith?: number, // cell size, default 16
        margin?: number, // Space between cells, default 2
        defaultColor?: string, // Default color, default #F2F2F2
        activeColor?: string, // Active color, default #B2D1FF
        trigger?:'hover' |'click' // Menu trigger method
      }
  })
]
```

## Example

[table](https://codesandbox.io/embed/plugin-table-lr55d?hidenavigation=1 ':include :type=iframe width=100% height=500px')