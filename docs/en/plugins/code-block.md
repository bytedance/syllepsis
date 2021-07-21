# CodeBlockPlugin <!-- {docsify-ignore-all} -->

```typescript
import {CodeBlockPlugin} from '@syllepsis/plugin-code-block';

plugins: [
  new CodeBlockPlugin({
    mode: string, // highlight mode, other language needs to be imported from `codemirror/mode`
  }),
];
```

## Example

[code-block](https://codesandbox.io/embed/code-block-3cni9?hidenavigation=1 ':include :type=iframe width=100% height=500px')