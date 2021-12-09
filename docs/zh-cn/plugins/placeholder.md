# 占位插件（Beta）

虽然Syllepsis抽象了插件，但新增插件仍是一个复杂的过程。

在某些场景中，开发者并不太在意和编辑器的交互，编辑器仅仅是一个存放组件的容器。开发者更希望自己的组件，能像IFrame一样，内嵌入插件中。一个比较典型的场景，就是Notion。 该插件的基本思路，实现一个**具备通用行为**（比如尺寸，选区）的占位插件，之后再加载并替代为对应的React组件。采用此方式，能折中实现插件的"动态加载"。 但值得注意，采用此方式后，所有组件在编辑器中都是一个**黑盒子**。这意味着整个组件在编辑器中只占用一个索引，编辑器和组件属于一种相对隔离的状态（即时为纯文字，编辑器对组件内部状态毫无感知）。如果需要和编辑器保持较强的交互，可考虑常规的插件实现方式。

## 使用

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

在`todo/index.js`中，有以下约束

```typescript
// todo/index.js
// 一些基础能力
const meta = {};
const data = {
  content: "Hello Component"
};

// 加载后执行
async function initTools(editor, meta, data, key) {
  editor.dynamicPlugins.insertPlaceholder(key, meta, data, 0);
}

// 执行editor.dynamicPlugins.insertPlaceholder时才执行
function initComp() {
  return () => import("./comp");
}

export { meta, data, initComp, initTools };

```

```typescript
// todo/comp.tsx
import React from 'react';

const YourComponent = React.forwardRef((props, ref) => {
  // data，在插入时，为声明的data
  // update后，data为Update的数据
  const { data, updata } = props;
  return <div>{ data.content }</div>;
})

export default YourComponent;
```


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

