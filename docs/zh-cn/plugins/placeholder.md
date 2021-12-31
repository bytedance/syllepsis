# 占位插件（Beta）

> 占位插件目前还是实验性功能，旨在采用更激进的方式，探索是否存在一种比[卡片](/zh-cn/chapters/card-plugin)更便捷简单的方式，往编辑器中插入应用。
> 若发现Bug，或有相关建议，或均可通过[Github Issue](https://github.com/bytedance/syllepsis/issues)进行反馈。

虽然Syllepsis抽象了`卡片`，但新增`卡片`插件仍是一个复杂的过程。

本插件旨在**实现一系列卡片通用能力**，保持卡片交互相对统一的同时，将开发者从编辑器中释放出来，将注意力聚焦在组件的交互上。在这过程中，能天然获得按需加载的能力。在插件未加载，或加载不成功时，也能显示占位符，让用户提前获知此处存在应用。


## 使用

插件接受参数`components`，在`init`属性中什么函数，并返回入口文件：

```typescript
import "./styles.css";
import React from "react";
import { SylEditor } from "@syllepsis/access-react";
import { PlaceholderPlugin } from "@syllepsis/plugin-placeholder";

export default function () {
  return (
    <SylEditor 
      plugins={[
        new PlaceholderPlugin({
          components: {
            'Todo': {
              init: () => import("./components/todo")
            }
          }
        })
      ]}
  />
);
}

```

在入口文件中，视情况声明`meta`、`data`、`initTools` 以及 `initComp`：

```typescript
// index.js

// 基础属性
const meta = {};

// 初始化数据
const data = {
  content: "Hello Component"
};

// 加载后执行（通常用于创建一些DOM交互）
async function initTools(editor, meta, data, key) {
  editor.dynamicPlugins.insertPlaceholder(key, meta, data, 0);
}

// 在文本中显示的插件组件
function initComp() {
  return () => import("./comp");
}

export { meta, data, initComp, initTools };

```

而在`initComp`中，返回的便是React组件。

```typescript
// comp.jsx

import React from 'react';

const YourComponent = React.forwardRef((props, ref) => {
  // data，在插入时，为入口文件中声明的初始化数据
  // 插件调用update后，data为Update传入的数据
  const { data, updata } = props;
  return <div>{ data.content }</div>;
})

export default YourComponent;
```

## 例子（1）

[placeholder](https://codesandbox.io/embed/placeholder-xsbxv?hidenavigation=1 ':include :type=iframe width=100% height=500px')

## meta通用能力

```typescript
// meta用于描述占位插件的基本属性
 const meta = {
  typo: {
    // 宽度
    width: number,
    // 高度
    height: number,
    // 长宽比例
    ratio: number,
    // 自适应
    adapt: number,
    // 排版方式
    align: ['left', 'center', 'right']
  },
  able: {
    // 是否支持拓展
    drag: boolean,
    // 是否支持调整大小
    resize: boolean,
    // 是否支持Ctrl + Z
    history: boolean
  }
 }
```

## 定制接口

通过React内置的`Ref`声明，可定义：

- getActiveTools：激活插件后，应显示的按钮。 
- getCopyData: 复制时，写入剪切板的数据。

```typescript
const Comp = React.forwardRef((props, ref) => {
    useImperativeHandler(ref, () => {
        // 定制按钮
        getActiveTools: () => {
            return [{
                content: '编辑',
                onClick: () => {}
            }]
        },
        // 自定义复制粘贴数据（粘贴到外部）
        getCopyData: async () => {
            return {
                text, html
            }
        }
    });
    return <div/>
})
```

## 例子（2）

聚焦到编辑器上，通过左侧 + 号按钮，尝试在编辑器中插入插件。

[placeholder](https://codesandbox.io/embed/placeholder-plugins-rk2hn?hidenavigation=1 ':include :type=iframe width=100% height=500px')
