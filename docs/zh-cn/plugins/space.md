# Space <!-- {docsify-ignore-all} -->

> [类型](/zh-cn/plugins/types)

```typescript
import { SpaceBeforePlugin, SpaceAfterPlugin, SpaceBothPlugin } from '@syllepsis/plugin-basic';

plugins: [
  new SpaceBeforePlugin({
    values: TValuesConfig, // 下拉框显示的值
  }),
  new SpaceAfterPlugin({
    values: TValuesConfig, // 下拉框显示的值
  }),
  new SpaceBothPlugin({
    values: TValuesConfig, // 下拉框显示的值
  }),
];
```

## 示例


[space](https://codesandbox.io/embed/plugin-space-8utog?hidenavigation=1 ':include :type=iframe width=100% height=500px')
