# 插件与工具栏

本章例子，将结合前几章内容，说明如何实现一个**字体选择**插件，并使用**下拉选择**交互。

## 模块

本章出现新的属性：**模块**（`Module`），代表一些非编辑器核心的"配件"。

通过传入属性即可生效：`<SylEditor module={module}/>`。

(<small>八卦一下：这个名词是从[Quiljs](https://quilljs.com/docs/modules/)中继承来的。如果有心智成本，等同于工具栏即可。</small>)

目前支持的模块有：

- 静态工具栏（固定显示在编辑器顶部）
- 跟随式工具栏（区选文本时才出现）

具体可通过[模块](http://localhost:3000/#/zh-cn/modules/README)一章了解，在此先不展开。

## 自定义模块内容

可在`Controller`中声明`toolbar`，来定制具体的展示方式和内容。`toolbar`的声明，会同时在以上两种模块中生效。

```typescript
class Controller {
  public toolbar = {
    className: 'xxx',
    // hover时显示
    tooltip: 'xxx',
    type: "dropdown",
    icon: () => {
      // 返回显示的React组件
    },
    // 返回可选的值
    value: () => []
  } 
}
```

## 例子

[font-family](https://codesandbox.io/embed/custom-font-family-jekcn?hidenavigation=1 ':include :type=iframe width=100% height=500px')