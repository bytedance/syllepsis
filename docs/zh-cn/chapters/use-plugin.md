# 引用插件

## 引入加粗插件

仅仅引入`<SylEditor/>`，编辑器只负责最简单的功能：编辑文字。 若要拓展编辑器的功能，我们需要引入`插件`。
引入插件的做法非常简单，我们只需从`@syllepsis/plugin-basic`中`import`所需插件， 并传给`plugins`项即可。

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

OK，我们的编辑器已经具备了加粗功能。

## 示例

可以在编辑框输入`Hello`，然后同时快捷键：Ctrl 和 B（Mac 系统为 Command + B），输入 Plugin。我们会发现 Plugin 被加粗了： Hello **Plugin**

当然，和绝大多数编辑器一样，我们先输入`Hello Plugin`，然后区选`Plugin`，再按下 Ctrl 和 B，同样能达到以上效果。

[use-plugin](https://codesandbox.io/embed/use-plugin-hkfgw?hidenavigation=1 ':include :type=iframe width=100% height=500px')
