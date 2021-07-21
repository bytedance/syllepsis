# ListItemPlugin <!-- {docsify-ignore-all} -->

> [Type](/en/plugins/types)

```typescript
import {ListItemPlugin, BulletListPlugin, OrderedListPlugin} from'@syllepsis/plugin-basic';

// list_item (list item) needs to be used in conjunction with ordered_list (ordered list) or bullet_list (unordered list)

plugins: [
  new ListItemPlugin({
    defaultFontSize: number // default font size
    matchInnerTags?: string[], // match the tagName contained in li
    allowedAligns: boolean | string[], // Allowed alignment, false means no alignment
    allowedLineHeights: TAllowedValuesConfig, // Allowed line height, false means not parse line-height, [] means allow all
    allowedSpaceBefores: TAllowedValuesConfig, // Allowed segment front margin value, false means not parse margin-top, [] means allow all
    allowedSpaceAfters: TAllowedValuesConfig, // Allowed space after value, false means not to parse margin-bottom, [] means allow all
    allowedSpaceBoths: TAllowedValuesConfig, // Allowed indentation value at both ends, false means not to parse margin-left, margin-right, [] means allow all
    addAttributes: IUserAttrsConfig; // Extend default attrs
  }),
  new OrderedListPlugin(), // ordered list
  new BulletListPlugin(), // unordered list
]
```

## Example

[list-item](https://codesandbox.io/embed/plugin-list-item-1zppp?hidenavigation=1 ':include :type=iframe width=100% height=500px')