# BackgroundPlugin <!-- {docsify-ignore-all} -->

```typescript
import { BackgroundPlugin } from '@syllepsis/access-react';

plugins: [
  new BackgroundPlugin({
    default: string, //  默认背景色，值为这个值时会取消样式，默认是#FFFFFF
    transparent: boolean, // 是否支持透明度，默认 true (0.1.45)
  }),
];
```

## 示例

[background](https://codesandbox.io/embed/plugin-background-95i0o?hidenavigation=1 ':include :type=iframe width=100% height=500px')
