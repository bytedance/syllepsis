# FontSizePlugin <!-- {docsify-ignore-all} -->

> [Type](/en/plugins/types)

```typescript
import {FontSizePlugin} from'@syllepsis/plugin-basic';

plugins: [
   new FontSizePlugin({
     allowedValues: TAllowedValuesConfig, // Allowed font size values
     values: TValuesConfig, // the value displayed in the drop-down menu
     unit:'em' |'px', // The unit used by font-size, the default is em
   }),
];
```

## Example

[font-size](https://codesandbox.io/embed/use-plugin-forked-86pdb?hidenavigation=1 ':include :type=iframe width=100% height=500px')