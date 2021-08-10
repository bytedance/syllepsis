# API

`SylAPi`指编辑器提供的操作其自身的接口，开发者可通过`getEditor`得到实例。

参考例子：[API](zh-cn/chapters/api.md)

## Property

### view

`Prosemirror`中的`EditorView`对象。参考[文档](https://prosemirror.net/docs/ref/#view)。

### isEmpty

`boolean`
编辑器内容是否为空。

### text

`string`
编辑器的文本内容。

### isFocused

`boolean`
编辑器是否聚焦。

### undoable

`boolean`
编辑器是否可**撤销**。

### redoable

`boolean`
编辑器是否可**重做**。

### editable

`boolean`
编辑器是否可**编辑**。

### shortcutable

`boolean`
编辑器是否启用了快捷输入。参考[插件](/zh-cn/plugins/README)中的`markdown`条目。

### isDestroy

`boolean`
编辑器是否被销毁。

## API

### getHTML

```typescript
// types
(config?: { layerType?: string; mergeEmpty?: boolean }) => string | undefined;
```

获取编辑器`html`内容。

- `layerType`指获取在`ViewMap`中或者`controllerProps.layers`中配置的`layer`内容，默认为`template`。

- `mergeEmpty`指是否合并连续空段落与连续换行，默认为`false`。

### setHTML

```typescript
// types
(
  value: string,
  options?: {
    allowUndo?: boolean;
    silent?: boolean;
    mergeEmpty?: boolean;
    keepWhiteSpace?: boolean;
  }
) => void
```

设置编辑器内容，传入`html`字符串。

- `allowUndo`指是否允许撤销，默认为`false`。
- `silent`指是否触发`text-change`事件，默认为`true`，不触发。
  - 注意：`silent`为`true`时`allowUndo`必为`false`。
- `mergeEmpty`指是否合并连续空段落与连续换行，默认为`true`。
- `keepWhiteSpace`为`true`时保留空白字符，`false`折叠成一个，默认为`false`。

### getContent

`getContent: () => { doc: object, selection: object }`

获取`json`结构的数据内容。

### setContent

`setContent: ({ doc: object, selection: object }) => void`

设置`json`结构的数据内容。

### getExistNodes

`getExistNodes: (nodeName: string) => IMappingNode[]`

获取当前编辑器中所有名称为`nodeName`的`node`元素。如：获取所有图片节点`editor.getExistedNodes('image')`。

### getExistMarks

`getExistMarks: (markName: string) => IMappingNode[]`

获取当前编辑器中所有名称为`markName`的`mark`元素。如：获取所有加粗的节点`editor.getExistedMarks('bold')`。

### enable

`enable: () => void`

启用编辑能力。

### disable

`disable: () => void`

禁用编辑能力。

### enableShortcut

`enableShortcut: () => void`

启用快捷输入能力。

### disableShortcut

`disableShortcut: () => void`

禁用快捷输入能力。

### getSelection

`getSelection: () => IGetSelectionInfo`

获取当前选区，`index` 代表光标位置；`length` 代表选中长度，注意非文本长度。
`anchor`为锚点位置，`head`为终止位置，用于区分选中方向
当选中节点时返回选中的`node`

### setSelection

`setSelection: (range: IRangeStatic & { scrollIntoView?: boolean, selectNode?: boolean }) => void`

设置选区，`index`代表光标位置，`length`代表选区长度。
`scrollIntoView`参数，控制是否将选区滚动到视窗，默认为`true`。
`selectNode`参数，控制是否选中节点，默认为 `false`

### getText

`getText: (range?: IRangeStatic) => string | undefined`

获取文本内容，以及行内元素`spec.getText`为 true 的`attrs.text`的内容。

### undo

`undo: () => boolean`

撤销操作。

### redo

`redo: (run?: boolean) => boolean`

重做操作。

### nodesBetween

```typescript
nodesBetween: (
  walker: (
  	node: Node,
  	pos: number,
  	parent: Node
	) => boolean | undefined,
  range?: Types.IRangeStatic
) => void
```

用于遍历文档

- `walker`函数用于遍历文档，返回`true`则对当前节点执行深度遍历，返回`false`则跳出当前节点，默认深度遍历。
- `range`为遍历的范围的，遍历全文可传入`{ index: 0, length: SylApi.length }`，默认范围为当前选区。

### insert

`insert: (nodeInfo: INodeInfo | string, index?: InsertOption | number) => void`

插入节点，可用于插入嵌套节点。

### insertCard

`insertCard: (type: string, attrs: { [key: string]: any }, index?: InsertOption | number) => void`

用于插入卡片。`type`为卡片类型。替换空行以后版本支持。

### insertInlineCardWithPara

`insertInlineCardWithPara: (type: string, attrs: { [key: string]: any }, index?: InsertOption | number) => void`

用于插入行内卡片，表现为在下一行插入卡片。

### insertText

`insertText: (text: string, format?: { [key: string]: boolean | object }, index?: number | InsertOption) => void`

插入文本，可设置格式，如标题，加粗等。`format`可参考[setFormat](#setformat-format-key-string-boolean-object-void)`API`。

### update

`update: (attrs: { [key: string]: any}, updateOption: IUpdateOption | number) => false | undefined`

更新指定位置节点的属性值。

### updateCardAttrs

`updateCardAttrs: (index: number, attrs: { [key: string]: any }) => void`

更新卡片的数据，`index`为卡片所在的位置，`index`可以通过`Schema`中传入的`getPos`参数获取。

### replace

`replace: (nodeInfo: INodeInfo | string, replaceOption?: IReplaceOption | number) => void`

替换指定范围内容。

### replaceCard

`replaceCard: (type: string, attrs: { [key: string]: any }, index: number | IReplaceOption) => void`

替换指定位置的卡片。

### delete

`delete: (index?: number, length?: number, option?: IDeleteOption) => void`

删除指定区域内容。

### deleteCard

`deleteCard: (index: number) => void`

删除卡片，传入卡片的位置信息。

### setFormat

`setFormat: (format: { [key: string]: boolean | object }, { focus?: boolean, index?: number, length?: number }) => void`

设置选区内容行内样式，粗体，标题，列表等。`key`为样式名，`value`是样式的属性值，如果没有可通过`boolean`控制应用和取消。

如设置粗体样式，粗体对应的`name`为`bold`，没有`attr`，可以通过执行`editor.setFormat({ bold: true })`对选区设置加粗样式。`editor.setFormat({ bold: false })`清空选区中的加粗样式。

支持通过`index`与`length`指定设置的选区。

### getFormat

`getFormat: () => { [key: string]: boolean | object }`

获取当前位置的文本格式以及格式的信息。返回类似[setFormat](#setformat-format-key-string-boolean-object-void)入参。

### clearFormat

`clearFormat: () => boolean`

清除文本格式。

### addCommand

`addCommand: (name: string | null, commandObj: { [key: string]: (...args: any[]) => any; }) => void`

添加一个挂载在编辑器上面的事件集，可以通过编辑器实例上的 command 方法调用事件。

### on

`on: (event: EventChannel.LocalEvent, handler: (...args: any[]) => void) => void`

监听事件，可用于监听内置事件。

### off

`off: (event: EventChannel.LocalEvent, handler: (...args: Array\<any\>) => void) => void`

移除事件监听。

### blur

`blur: () => void`

编辑器失焦。

### focus

`focus: () => void`

编辑器聚焦。

### getShadows

`getShadows: (key?: ((spec: Types.StringMap\<any\>) => boolean) | string, index?: number, length?: number) => Decoration[]`

可以通过 key 值或者匹配 spec 的任意属性来获取某段文档翻内或者整个文档范围内的`shadow`信息。

### insertShadow

`insertShadow: (data: { pos?: number, editable?: boolean, shadow: (dom: HTMLElement,view: EditorView,getPos: () => number) => HTMLElement, spec: { key: string } }, inline?: boolean) => void`

插入装饰节点，不影响到文档数据。用法参考[ShadowAPI](/zh-cn/others/shadow-api.md)。

### removeShadow

`removeShadow: (key: string) => { index: number, length: number, spec: { key: string } } | undefined`

根据 key 值删除装饰节点。

### appendShadow

`appendShadow : (data: { index: number, length: number, attrs?: { class?:string, nodeName: string, style?: string, [key:string]: any}, spec: { key: string } }, inline?: boolean) => void`

装饰已有的节点。

## Types

### IRangeStatic

```typescript
{
  index: number; // 光标位置，选区起点
  length: number; // 选区长度
}
```

### IGetSelectionInfo

```typescript
interface IGetSelectionInfo extends Types.IRangeStatic {
  anchor: number;
  head: number;
  node?: ProsemirrorNode;
}
```

### InsertOption

```typescript
{
  index?: number; // 插入位置
  scrollIntoView?: boolean; // 滚动到选中位置，默认为true
  replaceEmpty: boolean // 替换空行，默认为true
  focus?: boolean; // 聚焦，默认为true
  inheritMarks?: boolean; // 插入行内节点时是否继承当前样式，默认为true
}
```

### IUpdateOption

```typescript
{
  index: number;
  addToHistory?: boolean; // 是否可以被单独撤销，默认为true
  scrollIntoView?: boolean; // 滚动到选中位置，默认为false
  focus?: boolean; // 聚焦，默认为false,
  merge?: boolean; // 是否合并对象属性（注意数组内容的合并），默认为true
}
```

### IReplaceOption

```typescript
{

  index: number;
  length?: number; // 替换的长度，默认为1
  scrollIntoView?: boolean; // 滚动到选中位置，默认为true
  focus?: boolean; // 聚焦，默认为true
}
```

### IDeleteOption

```
{
    scrollIntoView?: boolean; // 滚动到选中位置，默认为true
    focus?: boolean; // 聚焦，默认为true
}
```

### IMappingNode

```typescript
{
  node: ProsemirrorNode, // 节点信息
  pos: number, // 卡片位置
  mark?: Mark // 获取mark时存在，表示mark信息
}
```

## Event

```typescript
EventChannel: {
  LocalEvent: {
    EDITOR_CREATED: 'editor-created', // 编辑器实例化完成
    TEXT_CHANGE: 'text-change', // 内容发生变化
    SELECTION_CHANGED: 'selection-change', // 编辑器选区变化
    ON_BLUR: 'blur', // 失去焦点
    ON_FOCUS: 'focus', // 获得焦点
    EDITOR_WILL_UNMOUNT: 'editor-will-unmount', // 编辑器开始卸载
    LOCALE_CHANGE: 'locale-change' // 语言配置改变
  }
}
```

## Mention

若`SylApi`不能满足需求，可以通过以下途径：

- 通过 [Issues](https://github.com/bytedance/syllepsis/issues)，提供需求及应用场景，确认支持后由我们排期开发或者由需求方通过`Pull Request`的方式来满足。
- 可以通过挂载在编辑器实例上的`view`属性拿到原生`EditorView`对象，进行更底层的操作，具体参考[Prosemirror](https://prosemirror.net/docs/ref/)。
