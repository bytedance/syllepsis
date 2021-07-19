# FormatPainterPlugin <!-- {docsify-ignore-all} -->

```typescript
import { FormatPainterPlugin } from '@syllepsis/plugin-basic';

plugins: [
  //....
  new FormatPainterPlugin({
    // 默认支持设置isTextblock的node，以及notStore，notClear不为true的mark
    ignoreNodes?: string[]; // 忽略的node
    ignoreMarks?: string[]; // 忽略的mark
    addNodes?: string[]; // 增加的node
    addMarks?: string[];  // 增加的mark
  })
]
```

## 示例

[format-painter](https://codesandbox.io/embed/plugin-format-painter-7v69g?hidenavigation=1 ':include :type=iframe width=100% height=500px')
