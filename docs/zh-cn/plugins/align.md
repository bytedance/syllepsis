# AlignPlugin <!-- {docsify-ignore-all} -->

```typescript
import { AlignLeftPlugin, AlignCenterPlugin, AlignRightPlugin, AlignJustifyPlugin } from '@syllepsis/plugin-basic';

plugins: [
  new AlignLeftPlugin({
    inclusive: boolean; // 是否包含所有关联节点，默认是false（即只更新顶层的匹配到的节点）
  }),
  new AlignCenterPlugin({
    inclusive: boolean; // 是否包含所有关联节点，默认是false（即只更新顶层的匹配到的节点）
  }),
  new AlignRightPlugin({
    inclusive: boolean; // 是否包含所有关联节点，默认是false（即只更新顶层的匹配到的节点）
  }),
  new AlignJustifyPlugin({
    inclusive: boolean; // 是否包含所有关联节点，默认是false（即只更新顶层的匹配到的节点）
  })
]
```
