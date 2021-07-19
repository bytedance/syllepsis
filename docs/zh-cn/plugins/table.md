# TablePlugin <!-- {docsify-ignore-all} -->

> [类型](/zh-cn/plugins/types)

```typescript
import { TablePlugin } from '@syllepsis/plugin-table';

plugins: [
  new TablePlugin({
      // 缩放相关配置
      columnResize?: {
        handleWidth?: number, // 缩放指示条宽度，默认5
        cellMinWidth?: number // 最小单元格宽度，默认56
      },
      // 表格相关配置
      table: {
        defaultCellWidth?: number	// 单元格默认宽度，默认88
        useTableHeader?: boolean // 是否使用table_header节点
        // 用于增加cell默认attrs
        cellAttributes: IUserAttrsConfig; // 扩展默认attrs
      },
      // 菜单按钮相关配置
      button?: {
        row?: number, // 行数，默认7
        column?: number, // 列数，默认7
        cellWith?: number, // 单元格大小，默认16
        margin?: number, // 单元格之间间距，默认2
        defaultColor?: string, // 默认颜色，默认 #F2F2F2
        activeColor?: string, // 激活颜色，默认#B2D1FF
        trigger?: 'hover' | 'click' // 菜单触发方式
      }
  })
]
```

## 示例

[table](https://codesandbox.io/embed/plugin-table-lr55d?hidenavigation=1 ':include :type=iframe width=100% height=500px')
