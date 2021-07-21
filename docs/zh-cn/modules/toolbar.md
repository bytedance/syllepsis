# 静态工具栏（`Toolbar`）

- 工具栏的构造函数`Ctor`由`Syllepsis`提供，从`@syllepsis/editor`引入

```typescript
import { ToolbarLoader } from '@syllepsis/editor';

 <SylEditor
  module={
    toolbar: {
      Ctor: ToolbarLoader,
      options: { xxx },
    },
  }
 />
```

- `option`配置如下：

| 配置名        | 类型                                           | 说明                                                                                |
| ------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| mount         | `HTMLElement`                                  | 可选，工具栏挂载的节点                                                              |
| Component     | `any`                                          | 可选，渲染函数                                                                      |
| tools         | `Array<string \| '\|'>`                        | 工具栏显示的插件，顺序对应位置<br>- 值为 plugins 的 name 属性<br>- `\|`为显示分割线 |
| className     | `string`                                       | 可选，工具栏样式名                                                                  |
| tooltips      | `{ name: string }`                             | 可选，hover 到按钮时显示的 tip                                                      |
| icons         | `Types.StringMap<any>`                         | 可选，按钮的图标组件, key 为插件名称                                                |
| onToolClick   | `(editor: SylApi, name: string) => void`       | 可选，按钮点击的回调                                                                |
| utils         | `{ name: IToolbarUtil }`                       | 可选，附加到工具栏的按钮，通过这个配置注册                                          |
| tipDirection  | `'up' \| 'left' \| 'down' \| 'right'`          | 可选，目前只对垂直类按钮生效                                                        |
| tipDistance   | `number`                                       | 可选，tooltipTip 距离按钮的边距                                                     |
| trigger       | `'click' \| 'hover'`                           | 可选，下拉菜单触发方式                                                              |
| menuDirection | `'up' \| 'down' \| 'up-start' \| 'down-start'` | 可选，下拉菜单位置                                                                  |

配置例子：

```typescript
import { BoldPlugin } from '@syllepsis/plugins';
import { ToolbarLoader } from '@syllepsis/editor';
import { SylEditor } from '@syllepsis/access-react';

  <SylEditor
    plugins=[new BoldPlugin()]
    module={
      toolbar: {
        Ctor: ToolbarLoader,
        options: {
          // 显示加粗按钮和分割线
          tools: ['bold', '｜']
        }
      }
    }
  >
}
```

---
