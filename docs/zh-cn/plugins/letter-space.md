# LetterSpacePlugin <!-- {docsify-ignore-all} -->

> [类型](/zh-cn/plugins/types)

```typescript
import { LetterSpacePlugin } from '@syllepsis/plugin-basic';

plugins: [
  new LetterSpacePlugin({
    allowedValues: TAllowedValuesConfig, //  允许的间距大小
    values: TValuesConfig, //  下拉菜单显示的值
    defaultFontSize: number, // 默认字体大小
  }),
];
```

## 示例

[letter-space](https://codesandbox.io/embed/plugin-letter-space-vi3ii?hidenavigation=1 ':include :type=iframe width=100% height=500px')
