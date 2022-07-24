# ColorPlugin <!-- {docsify-ignore-all} -->

```typescript
import { ColorPlugin } from '@syllepsis/access-react';

plugins: [
  new ColorPlugin({
    default: string, //  default font color，it will be reset when the attribute equal，default is '#000000'
    transparent: boolean, // Whether to support transparency, default true (0.1.46)
  }),
];
```

## 示例

[color](https://codesandbox.io/embed/plugin-color-g18vz?hidenavigation=1 ':include :type=iframe width=100% height=500px')
