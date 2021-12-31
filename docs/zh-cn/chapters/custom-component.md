# 组件联动

`SylEditor`内置了一些常用前端组件和交互，但在某些场合，开发者希望引入自己的组件库。

以下例子说明如何关联编辑器和组件。

## 按钮联动

通常地，按钮有以下通用交互：

- 当**点击**按钮时，对**选区的文本**应用某种**样式**（ React Component -> Editor ）
- 当**区选**某段文字时，假如区选文字已应用某种**样式**，此时需要**高亮**按钮（ Editor -> React Component）

### 实现要点

1. 通过`getEditor`方法获得编辑器的句柄`editor`（更多的 editor API 说明，请参考 [API](/zh-cn/api) 章节）
2. 当**点击**按钮时，可通过`editor`提供的API**设置格式**，如：`editor.setFormat`（React Component -> Editor）
3. 通过`editor.on(事件名)`监听**选区变更**，通过`editor.isActive`方法，判断格式是否激活，进而**高亮**按钮（Editor -> React Component）

### 示例

[custom-component](https://codesandbox.io/embed/custom-component-st77e?hidenavigation=1 ':include :type=iframe width=100% height=500px')
