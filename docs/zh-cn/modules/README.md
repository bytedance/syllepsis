# module

`Syllepsis`提供了外部模块扩展的接口，使用者可以根据通过配置而不是组件的形式去实现扩展模块，能更好地实现在不同项目的复用以及实现统一。

`module`需提供构造函数`Ctor`与配置`option`。

`Syllepsis`内部提供了基础的扩展模块[静态工具栏](/zh-cn/modules/toolbar.md)以及[跟随式工具栏](/zh-cn/modules/toolbar-inline.md)，使用时只需经过简单的配置即可实现一个完备的可交互编辑器（_具体内容请点击链接了解_）。
