# 模块（Module）

`Syllepsis`提供外部模块扩展接口，开发者可通过**配置**<small>（而不是组件）</small>的形式，自定义扩展。

通过配置的方式，更容易在不同项目中复用，简单且统一。

**模块**（`Module`）需提供**构造函数**（`Ctor`）与**自定义选项**（`option`）。

`Syllepsis`内部提供了基础的扩展模块：

1. [静态工具栏](/zh-cn/modules/toolbar.md)
2. [跟随式工具栏](/zh-cn/modules/toolbar-inline.md)


   
只需简单配置，即可实现一个完备可交互的编辑器（[_例子_](/zh-cn/playground)）。
