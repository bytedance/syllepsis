# 自定义插件

虽然`@syllepsis/plugins-basic`提供了大量的插件，但总会不满足某些业务场景，此 Demo 将实现一个最简单的插件`Strike`（下划线），讲述如何自定义插件。

## 期望插件能实现以下功能

1. Markdown 语法：当输入`~~文字~~`时，自动转化为删除线
2. 识别来源：能将`<del>文字</del>`、`<strike>文字</strike>`、`<div style="text-decoration: line-through;">`识别为分割线
3. 统一展示：所有分割线，统一以`<s>文字</s>`的标签展示
4. 响应快捷键：键盘按下 Ctrl 和 `\`（Mac 为 Command 和 `\`）时，应用删除线格式

## 对应需求的代码摘要

1. Markdown 语法：配置`textMatcher`的`matcher`属性（正则），识别文本
2. 识别来源：配置`parseDOM`属性，声明哪些 `HTML` 数据 将被识别为删除线
3. 统一展示：配置`toDOM`属性，描述如何在 `DOM` 中展示数据
4. 响应快捷键：配置`keymap`属性，快速注册快捷键

当然，以下代码还会提及两类 Class：`Controller`和`Schema`。这是一种类 MVC 的组织代码方式，目的是让代码更清晰。

- `Controller`：代码一般和**用户交互**相关
- `Schema`的：代码一般和**编辑器数据模型**相关

> Schema 与 Controller 不是必须都提供的，视具体情况决定

## 示例

尝试在以下例子中

1. 输入文字
2. 按下 Ctrl + \\（Mac：Command），再输入文字
3. 区选部分文字，按下 Ctrl + \\（Mac：Command）

[custom-plugin](https://codesandbox.io/embed/custom-plugin-gf6k5?hidenavigation=1 ':include :type=iframe width=100% height=500px')
