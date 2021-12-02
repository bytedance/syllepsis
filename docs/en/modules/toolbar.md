# Static Toolbar (`Toolbar`)

- Toolbar constructor `Ctor` is provided by `Syllepsis` and import from `@syllepsis/editor`

```typescript
import {ToolbarLoader} from'@syllepsis/editor';

 <SylEditor
  module={
    toolbar: {
      Ctor: ToolbarLoader,
      option: {xxx },
    },
  }
 />
```

- `option` configuration is as follows:

| Configuration | Type                                        | Description                                                                                         |
| ------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| mount         | `HTMLElement`                               | Optional, the node mounted on the toolbar                                                           |
| Component     | `any`                                       | Optional, rendering function                                                                        |
| tools         | `Array<string \|'\|'>`                      | The plug-ins displayed in the toolbar.<br/> - `string`: plugin icon name <br> - `\|`: dividing line |
| className     | `string`                                    | Optional, toolbar class name                                                                        |
| tooltips      | `{ name: string }`                          | Optional, the tip displayed when hovering to the button                                             |
| icons         | `Types.StringMap<any>`                      | Optional, the icon component of the button, the key is the plug-in name                             |
| onToolClick   | `(editor: SylApi, name: string) => void`    | Optional, button click callback                                                                     |
| utils         | `{ name: IToolbarUtil }`                    | Optional, buttons attached to the toolbar, register through this configuration                      |
| tipDirection  | `'up' \|'left' \|'down' \|'right'`          | Optional, currently only valid for vertical buttons                                                 |
| tipDistance   | `number`                                    | Optional, tooltipTip is the margin of the button                                                    |
| trigger       | `'click' \|'hover'`                         | Optional, drop-down menu trigger mode                                                               |
| menuDirection | `'up' \|'down' \|'up-start' \|'down-start'` | Optional, drop-down menu location                                                                   |

Configuration example:

```typescript
import {BoldPlugin} from'@syllepsis/plugins';
import {ToolbarLoader} from'@syllepsis/editor';
import {SylEditor} from'@syllepsis/access-react';

  <SylEditor
    plugins=[new BoldPlugin()]
    module={
      toolbar: {
        Ctor: ToolbarLoader,
        option: {
          // Show bold buttons and dividing lines
          tools: ['bold','｜']
        }
      }
    }
  >
}
```
