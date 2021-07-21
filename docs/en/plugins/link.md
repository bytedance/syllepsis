# LinkPlugin <!-- {docsify-ignore-all} -->

> [Type](/en/plugins/types)

```typescript
import {LinkPlugin} from'@syllepsis/access-react';

plugins: [
   new LinkPlugin({
     // Optional, verify the link rules, return false to indicate that the verification is successful; error to true to indicate that the verification failed, and text to the error message;
     validateHref: (href: string) => ({ error, text }),
   }),
];
```

## Example

[list-item](https://codesandbox.io/embed/plugin-link-uipkm?hidenavigation=1 ':include :type=iframe width=100% height=500px')