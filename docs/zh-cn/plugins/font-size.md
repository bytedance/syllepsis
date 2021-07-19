# FontSizePlugin <!-- {docsify-ignore-all} -->

> [类型](/zh-cn/plugins/types)

```typescript
import { FontSizePlugin } from '@syllepsis/plugin-basic';

plugins: [
  new FontSizePlugin({
    allowedValues: TAllowedValuesConfig, //  允许的字体大小值
    values: TValuesConfig, //  下拉菜单显示的值
    unit: 'em' | 'px', // font-size使用的单位，默认为em
  }),
];
```

## 示例

[font-size](https://codesandbox.io/embed/use-plugin-forked-86pdb?hidenavigation=1 ':include :type=iframe width=100% height=500px')
