# LinkPlugin <!-- {docsify-ignore-all} -->

> [类型](/zh-cn/plugins/types)

```typescript
import { LinkPlugin } from '@syllepsis/access-react';

plugins: [
  new LinkPlugin({
    // 可选，校验链接规则，返回error为false表示校验成功；error为true表示校验失败，text为错误信息；
    validateHref: (href: string) => ({ error, text }),
  }),
];
```

## 示例

[list-item](https://codesandbox.io/embed/plugin-link-uipkm?hidenavigation=1 ':include :type=iframe width=100% height=500px')
