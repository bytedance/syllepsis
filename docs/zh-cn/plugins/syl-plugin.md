# 插件属性

## 基本结构

```typescript
class SylPlugin {
  public name: string;
  public Schema: typeof Formattable;
  // 也可以通过 asyncController: () => Promise<typeof SylController> 异步加载 Controller, 共存会覆盖Controller
  public Controller: typeof SylController;
}
```

## Schema

节点类型以及渲染的定义

```typescript
// Block 即为 Node, Inline 对应 Mark，属性参考：https://prosemirror.net/docs/ref/#model.NodeSpec
import { Block, Inline } from '@packages/adapter';

// 比Inline以及Block多一个自定义的ViewMap属性，可用不同渲染库实现，默认不能包含可编辑内容
import { Card, InlineCard } from '@syllepsis/access-react';
```

在`prosemirror`的基础上，我们提供了一些自定义的`Spec`，用于定义节点表现

### 行内元素特殊属性

| 配置名       | 释义                                                                                                                               | 示例                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| notClear     | 为 true 时不会被 SylApi.clearFormat 清除                                                                                           | notClear = true       |
| notStore     | 为 true 时删除元素内容后再输入不会保存元素结构                                                                                     | notStore = true       |
| getText      | 行内卡片配合 attrs.text 使用,指定 SylApi.getText()时是否获取文本                                                                   | getText = false       |
| inclusive    | 为 false 时在元素后面输入时不继承元素结构                                                                                          | inclusive = false     |
| excludeMarks | 表示行内元素/卡片不可以包含的行内元素                                                                                              | excludeMarks = 'bold' |
| fixCursor    | 当行内元素为非文本或存在 padding 或者 marin 导致光标位置不正确的时候，默认为 false（为`true`时在`Chrome88`版本会导致光标显示不出） | fixCursor = false     |

### 块级元素特殊属性

| 配置名       | 释义                                                   | 示例                  |
| ------------ | ------------------------------------------------------ | --------------------- |
| excludeMarks | 表示块级元素/卡片不可以包含的行内元素                  | excludeMarks = 'bold' |
| notLastLine  | 声明块级元素不能处于最后一行（此时会自动插入一个空行） | notLastLine = true    |

### 行内元素特殊属性

| 配置名         | 释义                                                                                      | 示例                   |
| -------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| traceSelection | 用于控制是否需要跟踪文本选区并更新 props.isSelected（在大量节点全选时，对性能有明显影响） | traceSelection = false |

### ViewMap

卡片`ViewMap`中渲染函数的入参

```typescript
interface IViewMapProps<T = Types.StringMap<any>> {
  attrs: T; // 当前节点的 attrs
  editor: SylApi;
  dispatchUpdate: (attrs: Partial<T>) => any; // 更新卡片attrs
  getPos: () => number; // 获取卡片位置
  isSelected: boolean; // 是否选中，与traceSelection配合使用
  wrapDOM: HTMLElement; // 包裹的父节点
}
```

---

## Controller

插件的操作相关控制

```typescript
interface IToolbar {
  className?: string; // 按钮类名
  tooltip?: string | ((node: any) => any); // 按钮tooltip
  icon?: any | ((editor: SylApi, attrs: Types.StringMap<any>, extra: any) => any); // 按钮的icon
  handler?(editor: SylApi): void; // 点击按钮的回调
  showName?: string | boolean; // 在下拉列表内时显示的名称
  getRef?(ref: HTMLElement | null): void; // 获取按钮挂载的DOM
}

interface IMatcherConfig<MatcherType = RegExp | RegExp[], HandlerType = TextMatcherHandler> {
  name?: string;
  matcher: RegExp | RegExp[];
  handler?: (match: RegExpMatchArray, offset: number) => boolean | Record<string, any>;
}

// 挂载在editor实例，通过editor.command[name]调用
interface IControllerCommand {
  [key: string]: (editor: SylApi, ...args: any[]) => any;
}

// https://prosemirror.net/docs/ref/#keymap.keymap，处理快捷键
type TKeymapHandler = (
  editor: SylApi,
  state: EditorState,
  dispatch: EditorView['dispatch'],
  view: EditorView,
) => boolean;

// 处理编辑器内事件
interface IEventHandler {
  handleKeyDown?: (editor: SylApi, view: EditorView, event: KeyboardEvent) => boolean;
  handleKeyPress?: (editor: SylApi, view: EditorView, event: KeyboardEvent) => boolean;
  handleTextInput?: (editor: SylApi, view: EditorView, from: number, to: number, text: string) => boolean;
  handleClickOn?: (
    editor: SylApi,
    view: EditorView,
    pos: number,
    node: ProsemirrorNode,
    nodePos: number,
    event: MouseEvent,
    direct: boolean,
  ) => boolean;
  handleClick?: (editor: SylApi, view: EditorView, pos: number, event: MouseEvent) => boolean;
  handleDoubleClickOn?: (
    editor: SylApi,
    view: EditorView,
    pos: number,
    node: ProsemirrorNode,
    nodePos: number,
    event: MouseEvent,
    direct: boolean,
  ) => boolean;
  handleDoubleClick?: (editor: SylApi, view: EditorView, pos: number, event: MouseEvent) => boolean;
  handleTripleClickOn?: (
    editor: SylApi,
    view: EditorView,
    pos: number,
    node: ProsemirrorNode,
    nodePos: number,
    event: MouseEvent,
    direct: boolean,
  ) => boolean;
  handleTripleClick?: (editor: SylApi, view: EditorView, pos: number, event: MouseEvent) => boolean;
  handlePaste?: (editor: SylApi, view: EditorView, event: Event, slice: Slice) => boolean;
  handleDrop?: (editor: SylApi, view: EditorView, event: Event, slice: Slice, moved: boolean) => boolean;
  handleScrollToSelection?: (editor: SylApi, view: EditorView) => boolean;
  transformPastedHTML?: (editor: SylApi, html: string) => string;
  transformPastedText?: (editor: SylApi, text: string) => string;
  transformPasted?: (editor: SylApi, p: Slice) => Slice;
  clipboardTextSerializer?: (editor: SylApi, p: Slice) => string;
  handleDOMEvents?: Types.StringMap<(editor: SylApi, view: EditorView, event: any) => boolean>;
}

class SylController<T extends Types.StringMap<any> = any> {
  public name: string; // 插件标识
  public editor: SylApi;
  public toolbar: IToolbar;
  public textMatcher?: Array<IMatcherConfig<RegExp | RegExp[], TextMatcherHandler>>;
  public props: Partial<T> = {};
  public command?: IControllerCommand;
  public disable?(editor: SylApi): boolean; // 判断禁用
  public active?(editor: SylApi): boolean; // 判断是否高亮
  public eventHandler?: IEventHandler;
  public keymap?: Types.StringMap<TKeymapHandler>;
  public transformGetHTML?(html: string): string; // getHTML时对数据做处理
  // https://prosemirror.net/docs/ref/#state.PluginSpec.appendTransaction, 只在需要修改时返回Transaction
  public appendTransaction?(tr: Transaction, oldState: EditorState, _newState: EditorState): void | Transaction;

  constructor(editor: SylApi, props: Partial<T>) {}

  // 在编辑器卸载时会被调用
  public editorWillUnmount() {}
}
```
