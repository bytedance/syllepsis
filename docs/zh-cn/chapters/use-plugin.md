# 引用插件

`<SylEditor/>`只负责最简单的功能：编辑文字。若要拓展编辑器的功能，我们需要引入插件。

```jsx
// 引入"加粗"插件
import { BoldPlugin } from '@syllepsis/plugin-basic';
// ...

export default function App() {
  // 将BoldPlugin传递给SylEditor
  return <SylEditor plugins={[new BoldPlugin()]} />;
}
// ...
```


## 示例

在下面示例中，输入文字并**区选**，随后按下快捷键：Ctrl + B（MacOs为Command + B），即可发现文字被加粗。

[use-plugin](https://codesandbox.io/embed/use-plugin-hkfgw?hidenavigation=1 ':include :type=iframe width=100% height=500px')

## 更多插件

通过[插件](/zh-cn/plugins/README)列表，了解更多内置的插件。