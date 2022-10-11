# AlignPlugin <!-- {docsify-ignore-all} -->

```typescript
import { AlignLeftPlugin, AlignCenterPlugin, AlignRightPlugin, AlignJustifyPlugin } from '@syllepsis/plugin-basic';

plugins: [
  new AlignLeftPlugin({
    inclusive: boolean; // Whether to include all associated nodes, the default is false (that is, only the matching nodes at the top level are updated)
  }),
  new AlignCenterPlugin({
    inclusive: boolean; // Whether to include all associated nodes, the default is false (that is, only the matching nodes at the top level are updated)
  }),
  new AlignRightPlugin({
    inclusive: boolean; // Whether to include all associated nodes, the default is false (that is, only the matching nodes at the top level are updated)
  }),
  new AlignJustifyPlugin({
    inclusive: boolean; // Whether to include all associated nodes, the default is false (that is, only the matching nodes at the top level are updated)
  })
]
```
