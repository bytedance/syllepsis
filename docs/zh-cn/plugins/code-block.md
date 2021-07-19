# CodeBlockPlugin <!-- {docsify-ignore-all} -->

```typescript
import { CodeBlockPlugin } from '@syllepsis/plugin-code-block';

plugins: [
  new CodeBlockPlugin({
    mode: string, //  高亮匹配模式，目前非javascript需自行从`codemirror/mode`引入
  }),
];
```

## 示例

[code-block](https://codesandbox.io/embed/code-block-3cni9?hidenavigation=1 ':include :type=iframe width=100% height=500px')
