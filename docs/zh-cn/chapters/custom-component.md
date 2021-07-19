# 编写组件

虽然`SylEditor`内置了一些常用插件，但在多数场景下，开发者则希望引入自己的组件库。感谢 React 等框架，让编写前端组件变得容易。 下面的例子将说明如何让 React 组件和编辑器联系起来。

## 自定义按钮

通常地，按钮有以下通用交互

- 当**点击**按钮时，需要对**选区**应用某种**样式**（ React Component -> Editor ）
- 当**区选**某段文字时，假如这段文字已有某种**样式**，此时需要**高亮**按钮（ Editor -> React Component）

## 实现要点

1. 通过`getEditor`方法获得编辑器的句柄`editor`（更多的 editor API 说明，请参考 [API](/zh-cn/api) 章节）
2. 当**点击**按钮时，可通过`editor`提供的API**设置格式**，如：`editor.setFormat` ( React Component -> Editor)
3. 通过`editor.on(事件名)`监听**选区变更**，当发现**选区变更**时，通过`editor.isActive`方法，获取`当前位置或选区`是否激活格式，从而**高亮**按钮（ Editor -> React Component ）

## 示例

[custom-component](https://codesandbox.io/embed/custom-component-st77e?hidenavigation=1 ':include :type=iframe width=100% height=500px')
