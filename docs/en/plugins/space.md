# Space <!-- {docsify-ignore-all} -->

> [Type](/en/plugins/types)

```typescript
import {SpaceBeforePlugin, SpaceAfterPlugin, SpaceBothPlugin} from'@syllepsis/plugin-basic';

plugins: [
   new SpaceBeforePlugin({
     values: TValuesConfig, // the value displayed in the drop-down box
   }),
   new SpaceAfterPlugin({
     values: TValuesConfig, // the value displayed in the drop-down box
   }),
   new SpaceBothPlugin({
     values: TValuesConfig, // the value displayed in the drop-down box
   }),
];
```

## Example


[space](https://codesandbox.io/embed/plugin-space-8utog?hidenavigation=1 ':include :type=iframe width=100% height=500px')