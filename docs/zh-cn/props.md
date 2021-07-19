# 属性 <!-- {docsify-ignore-all} -->

```jsx
import { SylEditor } from '@syllepsis/access-react';

<SylEditor
  placeholder="xxx"
  // ...
/>;
```

## Props

| 名称           | 类型                                        | 说明                                                                            |
| -------------- | ------------------------------------------- | ------------------------------------------------------------------------------- |
| plugins        | `Array<SylPlugin>`                          | 可选，[`SylPlugin`](/zh-cn/plugins/README)实例列表                              |
| module         | `Record<string, ModuleMap>`                 | 可选，扩展模块，如工具栏等，详见[链接](/zh-cn/modules/README.md) 等             |
| content        | `HTML string` \| `object`                   | 可选，编辑器默认内容                                                            |
| getEditor      | `function`                                  | 可选，获取编辑器实例: `(editor: SylApi) => any`                                 |
| placeholder    | `string`                                    | 可选，空内容占位符，接受字符串或 html                                           |
| onFocus        | `function`                                  | 可选，编辑器聚焦回调                                                            |
| onBlur         | `function`                                  | 可选，编辑器失焦回调                                                            |
| locale         | `object`                                    | 可选，详情见[国际化配置](/zh-cn/others/i18n)                                    |
| keepLastLine   | `boolean`                                   | 可选，是否保留最后一行空行，默认为`true`                                        |
| dropCursor     | `{ color: string, width: number } \| false` | 可选，拖拽指示条样式默认`color`为`#000000`，`width`为`1`，值为`false`时关闭指示 |
| spellCheck     | `boolean`                                   | 可选，是否开启拼写检查，默认为`false`                                           |
| autoFocus      | `boolean`                                   | 可选，是否在初始化完成后自动聚焦，默认为`false`                                 |
| onError        | `() => any`                                 | 可选，调用`SylApi`时的错误事件捕获，默认抛出                                    |
| keepWhiteSpace | `full \| undefined`                         | 可选，是否折叠空白字符，默认折叠。`full`需要配合`white-space: pre-wrap;`生效。  |
