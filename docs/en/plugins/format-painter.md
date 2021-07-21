# FormatPainterPlugin <!-- {docsify-ignore-all} -->

```typescript
import {FormatPainterPlugin} from'@syllepsis/plugin-basic';

plugins: [
  //....
  new FormatPainterPlugin({
    // By default, support isTextblock's node
    // support notStore and notClear's node, whose values are not true.
    ignoreNodes?: string[]; // Ignored node
    ignoreMarks?: string[]; // Ignored mark
    addNodes?: string[]; // added node
    addMarks?: string[]; // added mark
  })
]
```

## Example

[format-painter](https://codesandbox.io/embed/plugin-format-painter-7v69g?hidenavigation=1 ':include :type=iframe width=100% height=500px')