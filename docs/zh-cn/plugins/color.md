# ColorPlugin <!-- {docsify-ignore-all} -->

```typescript
import { ColorPlugin } from '@syllepsis/access-react';

plugins: [
  new ColorPlugin({
    default: string, //  默认字色，值为这个值时会取消样式，默认是#000000
    transparent: boolean, // 是否支持透明度，默认 true (0.1.46)
  }),
];
```

## 示例

[color](https://codesandbox.io/embed/plugin-color-g18vz?hidenavigation=1 ':include :type=iframe width=100% height=500px')
