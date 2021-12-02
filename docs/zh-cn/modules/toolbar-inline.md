# 跟随式工具栏（`toolbarInline`）

![image.png](https://p-vcloud.byteimg.com/tos-cn-i-em5hxbkur4/3d80c53a94844747a4b78664c50f7991~tplv-em5hxbkur4-noop.image?width=334&height=186)

> 定位规则
>
> - 有文字内容时展示，优先显示在选区上方
> - 跨行选中时，根据鼠标松开的位置来决定显示在上方或者是下方
> - 拖动选中，鼠标松开的位置与选区差距过大时，优先在鼠标松开的位置显示，并保持左右位置
> - 其他有选区但是没有工具栏的情况，移动鼠标出现，以鼠标位置为中心显示

- 跟随式工具栏的构造函数`Ctor`由`SylEditor`提供，从`@syllepsis/editor`引入

```typescript
import { ToolbarInlineLoader } from '@syllepsis/editor';
import { SylEditor } from '@syllepsis/access-react';

  <SylEditor
    module={
      toolbar: {
        Ctor: ToolbarInlineLoader,
        option: { ... }
      }
    }
  />
```

- `option`配置如下：

| 配置名        | 类型                                                               | 说明                                                                                |
| ------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| tools         | `Array<string \| '\|'>`                                            | 工具栏显示的插件，顺序对应位置<br>- 值为 plugins 的 name 属性<br>- `\|`为显示分割线 |
| Component     | `any`                                                              | 可选，渲染函数                                                                      |
| tooltips      | `{ name: string }`                                                 | 可选，hover 到按钮时显示的 tip                                                      |
| icons         | `Types.StringMap<any>`                                             | 可选，按钮的图标组件, key 为插件名称                                                |
| tipDirection  | `'up' \| 'left' \| 'down' \| 'right'`                              | 可选，目前只对垂直类按钮生效                                                        |
| tipDistance   | `number`                                                           | 可选，tooltipTip 距离按钮的边距                                                     |
| onToolClick   | `(editor: SylApi, name: string) => void`                           | 可选，按钮点击的回调                                                                |
| utils         | `{ name: IToolbarUtil }`                                           | 可选，附加到工具栏的按钮，通过这个配置注册                                          |
| trigger       | `'click' \| 'hover'`                                               | 可选，下拉菜单触发方式                                                              |
| menuDirection | `'up' \| 'down' \| 'up-start' \| 'down-start'`                     | 可选，下拉菜单位置                                                                  |
| menuDistance  | `number`                                                           | 可选，菜单距离按钮的距离                                                            |
| threshold     | `{ top?: number; left?: number; right?: number; bottom?: number }` | 可选，工具栏距离编辑器最小边距                                                      |
| judgeShow     | `(editor: SylApi) => boolean`                                      | 可选，判断是否显示工具栏                                                            |
| zIndex        | `number`                                                           | 可选，工具栏 dom 的 z-index                                                         |

- 内置`command`
  挂载在`editor.command.toolbarInline`上的方法

| 方法名     | 类型            | 说明                         |
| ---------- | --------------- | ---------------------------- |
| show       | `() => void`    | 显示工具栏，或者强制刷新位置 |
| hide       | `() => void`    | 隐藏工具栏                   |
| enable     | `() => void`    | 启用工具栏                   |
| disable    | `() => void`    | 禁用工具栏                   |
| getVisible | `() => boolean` | 获取工具栏显示状态           |

配置例子：

```typescript
import { BoldPlugin, ToolbarInlineLoader } from '@syllepsis/plugins';
import { SylEditor } from '@syllepsis/access-react';

  <SylEditor
    module={
      toolbar: {
        Ctor: ToolbarInlineLoader,
        option: {
          tools: ['bold', '|']
        }
      }
    }
  />
```
