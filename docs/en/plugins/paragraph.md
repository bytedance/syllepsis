# ParagraphPlugin

> [Type](/en/plugins/types)

```typescript
import {ParagraphPlugin} from'@syllepsis/plugin-basic';

plugins: [
  //....
  new ParagraphPlugin({
    defaultFontSize: number // default font size
    addMatchTags: boolean | string[], // add matching tagName, such as ['section']
    allowedAligns: boolean | string[], // Allowed alignment, false means no alignment
    canMatch?: (dom: HTMLElement) => boolean; // Determine whether it can match the corresponding dom
    allowedClass: string[], // Allowed class name, false means not to parse class
    allowedLineHeights: TAllowedValuesConfig, // Allowed line height, false means not parse line-height, [] means allow all
    allowedLineIndents: TAllowedValuesConfig, // Allowed first line indentation value, false means not parse text-indent, [] means allow all
    allowedSpaceBefores: TAllowedValuesConfig, // Allowed segment front margin value, false means not parse margin-top, [] means allow all
    allowedSpaceAfters: TAllowedValuesConfig, // Allowed space after value, false means not to parse margin-bottom, [] means allow all
    allowedSpaceBoths: TAllowedValuesConfig, // Allowed indentation value at both ends, false means not to parse margin-left, margin-right, [] means allow all
    addAttributes: IUserAttrsConfig; // Extend default attrs
  })
]
``` 