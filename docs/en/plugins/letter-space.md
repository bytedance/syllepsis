# LetterSpacePlugin <!-- {docsify-ignore-all} -->

> [Type](/en/plugins/types)

```typescript
import {LetterSpacePlugin} from'@syllepsis/plugin-basic';

plugins: [
   new LetterSpacePlugin({
     allowedValues: TAllowedValuesConfig, // Allowed gap size
     values: TValuesConfig, // the value displayed in the drop-down menu
     defaultFontSize: number, // default font size
   }),
];
```

## Example

[letter-space](https://codesandbox.io/embed/plugin-letter-space-vi3ii?hidenavigation=1 ':include :type=iframe width=100% height=500px')