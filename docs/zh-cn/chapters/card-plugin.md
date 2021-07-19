# 自定义卡片插件

## 什么是卡片插件

假如用过类似 Notion 类产品（比如：[飞书文档](https://docs.feishu.cn)），相信会对文档中可以插入各种各样的元素感到兴趣。这是一种不同的编辑体验：富文本编辑器不再局限于文本，而支持插入各种各样自定义的东西（比如视频、音频等）。

在这些场景中，编辑器往往不需要关心元素内部的数据，只需通过接口和内部元素进行交换。 对于这种业务场景，我们将其抽象成了`Card`（卡片）。

和所有的插件一样，卡片也有`Schema`和`Controller`。为了降低开发成本，`Controller`的交互逻辑允许托付给 `React Component`，开发者更多地是描述`Schema`。

换句话说，开发者需要告知编辑器：

1. 什么样的数据能识别为卡片 (`parseDOM`, `textMatcher`)
2. 卡片将如何展示 (`ViewMap`)

在下面例子中，会多一个概念：`Schema`中会多出一个`ViewMap`属性，用于用相应的渲染库渲染卡片。`ViewMap`中默认需定义`template`与`mask`，`mask`即卡片视图的渲染规则。而`template`，不过是因为卡片在展示阶段，可能生成复杂的 DOM 结构，不适合作为提交数据，`template`仅用于描述提交的数据。

## 示例

[card-plugin](https://codesandbox.io/embed/card-eh2um?hidenavigation=1 ':include :type=iframe width=100% height=500px')
