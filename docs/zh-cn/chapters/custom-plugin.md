# 自定义插件

虽然`@syllepsis/plugins-basic`提供了大量的插件，但总有不满足业务场景的时候。

此 Demo 将实现一个最简单的插件 `Strike`（删除线）。

## 需求

1. **Markdown 语法**：当输入 `~~文字~~` 时，自动识别
2. **识别多种格式**：`<del>文字</del>`、`<strike>文字</strike>`、`<div style="text-decoration: line-through;">`
3. **统一展示**：统一以 `<s>文字</s>` 标签展示
4. **快捷键**：键盘按下 Ctrl + `\`（Mac 为 Command + `\`）时，应用删除线格式

## 代码摘要

1. **Markdown 语法**：配置`textMatcher`的`matcher`属性（正则），识别文本
2. **识别多种格式**：配置`parseDOM`属性，声明哪些 `HTML` 数据 将被识别为删除线
3. **统一展示**：配置`toDOM`属性，描述如何在 `DOM` 中展示数据
4. **快捷键**：配置`keymap`属性，快速注册快捷键

当然，代码还涉及两类抽象 Class：`Controller`和`Schema`。

这是一种类 MVC 的代码组织方式，目的是让代码更清晰。

- `Controller`：和**用户交互**相关
- `Schema`的：和**编辑器数据模型**相关

> Schema 与 Controller 非必须项，视具体情况决定

## 示例

尝试在以下例子中：

1. 输入文字
2. 按下快捷键 `Ctrl + \`（Mac：`Command + \`），再输入文字
   - 后续文字将**继承**删除线格式
3. 区选部分文字，按下快捷键 `Ctrl + \`（Mac：`Command + \`）
   - 区选文字将**应用**删除线格式

[custom-plugin](https://codesandbox.io/embed/custom-plugin-gf6k5?hidenavigation=1 ':include :type=iframe width=100% height=500px')
