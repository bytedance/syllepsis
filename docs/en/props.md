!> This Chapter is translated by machine. please feedback [Issue](https://github.com/bytedance/syllepsis/issues) if expression unclear.

# Property <!-- {docsify-ignore-all} -->

```jsx
import { SylEditor } from '@syllepsis/access-react';

<SylEditor
  placeholder="xxx"
  // ...
/>;
```

## Props

| Name           | Type                                                                                                             | Description                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| plugins        | `Array<SylPlugin>`                                                                                               | Optional, [`SylPlugin`](/en/plugins/README) instance list                                                                                 |
| module         | `Record<string, ModuleMap>`                                                                                      | Optional, extension modules, such as toolbars. Refer to [link](/en/modules/README.md) etc.                                                |
| content        | `HTML string` \| `object`                                                                                        | Optional, the default content of the editor                                                                                               |
| getEditor      | `function`                                                                                                       | Optional, get the editor instance: `(editor: SylApi) => any`                                                                              |
| placeholder    | `string`                                                                                                         | Optional, empty content placeholder, accept string or html                                                                                |
| onFocus        | `function`                                                                                                       | Optional, editor focus callback                                                                                                           |
| onBlur         | `function`                                                                                                       | Optional, editor defocus callback                                                                                                         |
| locale         | `object`                                                                                                         | Optional, see [Internationalization](/en/others/i18n)                                                                                     |
| keepLastLine   | `boolean`                                                                                                        | Optional, whether to keep the last blank line, the default is `true`                                                                      |
| dropCursor     | `{ color: string, width: number} \| false`                                                                       | Optional, when the drag indicator bar style defaults to `color` is `#000000`, `width` is `1`, and the value is `false` Close instructions |
| spellCheck     | `boolean`                                                                                                        | Optional, whether to enable spell check, the default is `false`                                                                           |
| autoFocus      | `boolean`                                                                                                        | Optional, whether to auto focus after the initialization is complete, the default is `false`                                              |
| onError        | `() => any`                                                                                                      | Optional, error event capture when calling `SylApi`, thrown by default                                                                    |
| keepWhiteSpace | `full \| undefined`                                                                                              | Optional, whether to fold white space characters, default fold. `full` needs to cooperate with `white-space: pre-wrap;` to take effect.   |
| eventHandler   | [`IEventHandler`](https://bytedance.github.io/syllepsis/#/en/chapters/syl-plugin?id=controller)                  | Optional, used to add some event handler.                                                                                                 |
| keymap         | [`Record<string, TKeymapHandler>`](https://bytedance.github.io/syllepsis/#/en/chapters/syl-plugin?id=controller) | Optional, used to add keyboard shortcuts handler.                                                                                         |
