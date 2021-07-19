# ListItemPlugin <!-- {docsify-ignore-all} -->

> [类型](/zh-cn/plugins/types)

```typescript
import { ListItemPlugin, BulletListPlugin, OrderedListPlugin } from '@syllepsis/plugin-basic';

// list_item（列表项）需与ordered_list（有序列表）或bullet_list（无序列表）配合使用

plugins: [
  new ListItemPlugin({
    defaultFontSize: number // 默认字体大小
    matchInnerTags?: string[], // 匹配li包含的tagName
    allowedAligns: boolean | string[], // 允许的对齐方式，false为不解析对齐
    allowedLineHeights: TAllowedValuesConfig, // 允许的行高，false为不解析line-height，[]为允许所有
    allowedSpaceBefores: TAllowedValuesConfig, // 允许的段前距值，false为不解析margin-top，[]为允许所有
    allowedSpaceAfters: TAllowedValuesConfig, // 允许的段后距值，false为不解析margin-bottom，[]为允许所有
    allowedSpaceBoths: TAllowedValuesConfig, // 允许的两端缩进值，false为不解析margin-left，margin-right，[]为允许所有
    addAttributes: IUserAttrsConfig; // 扩展默认attrs
  }),
  new OrderedListPlugin(), // 有序列表
  new BulletListPlugin(), // 无序列表
]
```

## 示例

[list-item](https://codesandbox.io/embed/plugin-list-item-1zppp?hidenavigation=1 ':include :type=iframe width=100% height=500px')
