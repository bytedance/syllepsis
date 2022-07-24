# BackgroundPlugin <!-- {docsify-ignore-all} -->

```typescript
import { BackgroundPlugin } from '@syllepsis/access-react';

plugins: [
  new BackgroundPlugin({
    default: string, //  default background color，it will be reset when the attribute equal，default is '#FFFFFF'
    transparent: boolean, // Whether to support transparency, default true (0.1.46)
  }),
];
```

## 示例

[background](https://codesandbox.io/embed/plugin-background-95i0o?hidenavigation=1 ':include :type=iframe width=100% height=500px')
