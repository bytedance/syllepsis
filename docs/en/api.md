!> This Chapter is translated by machine. please feedback [Issue](https://github.com/bytedance/syllepsis/issues) if expression unclear.

# API

`SylAPi`: Interface to operate itself. Developers can get instance through `getEditor`.

Reference example: [API](/en/chapters/api.md)

## Property

### view

The `EditorView` object in `Prosemirror`. Refer to [document](https://prosemirror.net/docs/ref/#view).

### isEmpty

`boolean`
Whether the editor content is empty.

### text

`string`
The text content of the editor.

### isFocused

`boolean`
Whether the editor is focused.

### undoable

`boolean`
Whether the editor can be **undo**.

### redoable

`boolean`
Whether the editor can **redo**.

### editable

`boolean`
Whether the editor can **edit**.

### shortcutable

`boolean`
Whether the editor has enabled shortcut input. Refer to the `markdown` entry in [plugins](/en/plugins/README).

### isDestroy

`boolean`
Whether the editor is destroyed.

## API

### getHTML

```typescript
// types
(config?: { layerType?: string; mergeEmpty?: boolean }) => string | undefined;
```

Get the content of the editor `html`.

- `layerType` refers to obtaining the content of `layer` configured in `ViewMap` or `controllerProps.layers`, the default is `template`.

- `mergeEmpty` refers to whether to merge continuous empty paragraphs and continuous line breaks, the default is `false`.

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

Set the editor content and pass in the `html` string.

- `allowUndo` refers to whether to allow undo, the default is `false`.
- `silent` refers to whether to trigger the `text-change` event, the default is `true` and does not trigger.
- Note: When `silent` is `true`, `allowUndo` must be `false`.
- `mergeEmpty` refers to whether to merge continuous empty paragraphs and continuous line breaks, the default is `true`.
- Keep white space when `keepWhiteSpace` is `true`, `false` is folded into one, and the default is `false`.

### getContent

`getContent: () => {doc: object, selection: object }`

Get the data content of the `json` structure.

### setContent

`setContent: ({ doc: object, selection: object }) => void`

Set the data content of the `json` structure.

### pasteContent

`pasteContent: (content: string, option?: { plainText?: boolean, scrollIntoView?: boolean }) => boolean`

Used to simulate paste behavior to insert content.Return `true` for success.

`plainText` indicates whether the content is plain text, the default is `false`.
`scrollIntoView` scroll to the selected position, the default is `true`.

### dispatchEvent

`dispatchEvent: (event: Event) => void;`

Trigger events, which can be used for testing or other purposes.

### getExistNodes

`getExistNodes: (nodeName: string) => IMappingNode[]`

Get all the `node` elements whose name is `nodeName` in the current editor. Such as: get all image nodes `editor.getExistedNodes('image')`.

### getExistMarks

`getExistMarks: (markName: string) => IMappingNode[]`

Get all `mark` elements whose name is `markName` in the current editor. Such as: get all bold nodes `editor.getExistedMarks('bold')`.

### enable

`enable: () => void`

Enable editing capabilities.

### disable

`disable: () => void`

Disable editing capabilities.

### enableShortcut

`enableShortcut: () => void`

Enable quick input capability.

### disableShortcut

`disableShortcut: () => void`

Disable quick input capability.

### getSelection

`getSelection: () => IGetSelectionInfo`

Get the current selection, `index` represent the cursor position; `length` represent the selected length, pay attention to the non-text length.
`anchor` represent anchor index of selection, `head` represent head index of selection. Used to distinguish directions.
It will return `node` when selected `node`

### setSelection

`setSelection: (range: IRangeStatic & {scrollIntoView?: boolean, selectNode?: boolean }) => void`

Set the selection, `index` represents the cursor position, `length` represents the length of the selection.
the `scrollIntoView` parameter to control whether to scroll the selection to the window, the default is `true`.
the `selectNode` parameter to indicates whether to select the `node`.

### getText

`getText: (range?: IRangeStatic) => string | undefined`

Get the text content and the content of `attrs.text` where the inline element `spec.getText` is true.

### undo

`undo: () => boolean`

Undo the operation.

### redo

`redo: (run?: boolean) => boolean`

Redo the operation.

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

Used to traverse the document

- The `walker` function is used to traverse the document, returning `true` to perform a deep traversal on the current node, and returning `false` to jump out of the current node, and the default deep traversal. -`range` is the range to be traversed. To traverse the full text, you can pass in `{ index: 0, length: SylApi.length }`, and the default range is the current selection.

### insert

`insert: (nodeInfo: INodeInfo | string, index?: InsertOption | number) => void`

Insert node, can be used to insert nested nodes.

### insertCard

`insertCard: (type: string, attrs: {[key: string]: any }, index?: InsertOption | number) => void`

Used to insert a card. `type` is the card type. The replacement of blank lines will be supported in future versions.

### insertInlineCardWithPara

`insertInlineCardWithPara: (type: string, attrs: {[key: string]: any }, index?: InsertOption | number) => void`

Used to insert cards in a row, which means inserting a card in the next row.

### insertText

`insertText: (text: string, format?: {[key: string]: boolean | object }, index?: number | InsertOption) => void`

Insert text, you can set the format, such as title, bold, etc. `format` can refer to [setFormat](/en/api?id=setFormat)`API`.

### update

`update: (attrs: {[key: string]: any}, updateOption: IUpdateOption | number) => false | undefined`

Update the attribute value of the specified location node.

### updateCardAttrs

`updateCardAttrs: (index: number, attrs: {[key: string]: any }) => void`

Update the data of the card, `index` is the location of the card, `index` can be obtained through the `getPos` parameter passed in `Schema`.

### replace

`replace: (nodeInfo: INodeInfo | string, replaceOption?: IReplaceOption | number) => void`

Replace the contents of the specified range.

### replaceCard

`replaceCard: (type: string, attrs: {[key: string]: any }, index: number | IReplaceOption) => void`

Replace the card at the specified position.

### delete

`delete: (index?: number, length?: number, option?: IDeleteOption) => void`

Delete the contents of the specified area.

### deleteCard

`deleteCard: (index: number) => void`

Delete the card and input the location information of the card.

### setFormat

`setFormat: (format: {[key: string]: boolean | object }, {focus?: boolean, index?: number, length?: number }) => void`

Set the style of the content of the selection area, bold, title, list, etc. `key` is the name of the block nodes or inline marks, `value` is the supported attribute of the style, if not, the application and cancellation can be controlled by `boolean`.

If you set the bold style, the corresponding `name` of the bold is `bold`, and there is no `attr`, you can set the bold style for the selection by executing `editor.setFormat({ bold: true })`. `editor.setFormat({ bold: false })` clears the bold style in the selection.

Supports the selection of the selected area specified by `index` and `length`.

### getFormat

`getFormat: () => {[key: string]: boolean | object }`

Get the text format and format information of the current position. Return input parameters similar to [setFormat](/en/api?id=setFormat).

### clearFormat

`clearFormat: () => boolean`

Clear the text format.

### addCommand

`addCommand: (name: string | null, commandObj: {[key: string]: (...args: any[]) => any; }) => void`

To add an event set mounted on the editor, the event can be called through the command method on the editor instance.

### on

`on: (event: EventChannel.LocalEvent, handler: (...args: any[]) => void) => void`

Monitor events, which can be used to monitor built-in events.

### off

`off: (event: EventChannel.LocalEvent, handler: (...args: Array\<any\>) => void) => void`

Remove event listener.

### blur

`blur: () => void`

The editor is out of focus.

### focus

`focus: () => void`

Editor focus.

### getShadows

`getShadows: (key?: ((spec: Types.StringMap\<any\>) => boolean) | string, index?: number, length?: number) => Decoration[]`

You can get the `shadow` information in a certain document or the entire document range through the key value or any attribute of the matching spec.

### insertShadow

`insertShadow: (data: {pos?: number, editable?: boolean, shadow: (dom: HTMLElement,view: EditorView,getPos: () => number) => HTMLElement, spec: {key: string} }, inline ?: boolean) => void`

Inserting decorative nodes does not affect the document data. For usage, please refer to [ShadowAPI](/zh-cn/others/shadow-api.md).

### removeShadow

`removeShadow: (key: string) => {index: number, length: number, spec: {key: string}} | undefined`

Delete the decorated node based on the key value.

### appendShadow

`appendShadow: (data: {index: number, length: number, attrs?: {class?:string, nodeName: string, style?: string, [key:string]: any}, spec: {key: string}} , inline?: boolean) => void`

Decorate existing nodes.

## Types

### IRangeStatic

```typescript
{
  index: number; // cursor position, starting point of selection
  length: number; // length of selection
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
  index?: number; // Insert position
  scrollIntoView?: boolean; // Scroll to the selected position, the default is true
  replaceEmpty: boolean // replace empty lines, the default is true
  focus?: boolean; // focus, the default is true
  inheritMarks?: boolean; // Whether to inherit the current style when inserting in-line nodes, the default is true
  addToHistory?: boolean; // Can it be revoked individually, the default is true
}
```

### IUpdateOption

```typescript
{
  index: number;
  addToHistory?: boolean; // Can it be revoked individually, the default is true
  scrollIntoView?: boolean; // Scroll to the selected position, the default is false
  focus?: boolean; // focus, default is false,
  merge?: boolean; // Whether to merge object attributes (note the merging of array contents), the default is true
}
```

### IReplaceOption

```typescript
{

  index: number;
  length?: number; // The length of the replacement, the default is 1
  scrollIntoView?: boolean; // Scroll to the selected position, the default is true
  focus?: boolean; // focus, the default is true
  addToHistory?: boolean; // Can it be revoked individually, the default is true
}
```

### IDeleteOption

```
{
  scrollIntoView?: boolean; // Scroll to the selected position, the default is true
  focus?: boolean; // focus, the default is true
  addToHistory?: boolean; // Can it be revoked individually, the default is true
}
```

### IMappingNode

```typescript
{
  node: ProsemirrorNode, // node information
  pos: number, // card position
  mark?: Mark // Exists when the mark is obtained, indicating the mark information
}
```

### TKeymapHandler

```typescript
// https://prosemirror.net/docs/ref/#keymap.keymap，handle keyboard shortcuts
type TKeymapHandler = (
  editor: SylApi,
  state: EditorState,
  dispatch: EditorView['dispatch'],
  view: EditorView,
) => boolean;
```

## Configurator

`Configurator` is a configuration object mounted on `SylApi`, which can be used to configure some capabilities.

### setLocale

`setLocale(locale?: Types.StringMap<any>): boolean | undefined;`

Used to set the `locale` config.

### registerEventHandler

`(eventHandler: IEventHandler) => void;`

Used to add event handlers.

### unregisterEventHandler

`(eventHandler: IEventHandler) => void;`

Used to remove event handlers.

### registerKeymap

`(keymap: Types.StringMap<TKeymapHandler>) => void;`

Used to add keymap handlers.

### unregisterKeymap

`(keymap: Types.StringMap<TKeymapHandler>) => void;`

Used to remove keymap handlers.

### registerController

`(name: string, Controller: typeof SylController, controllerProps?: Types.StringMap<any>) => void;`

Used to register `Controller`。

### unregisterController

`(name: string) => void;`

Used to unregister `Controller`。

## Event

```typescript
EventChannel: {
  LocalEvent: {
    TEXT_CHANGE:'text-change', // The content has changed
    SELECTION_CHANGED:'selection-change', // editor selection change
    ON_BLUR:'blur', // lose focus
    ON_FOCUS:'focus', // get focus
    EDITOR_WILL_UNMOUNT:'editor-will-unmount', // The editor starts to unmount
    LOCALE_CHANGE:'locale-change' // language configuration change
  }
}
```

## Mention

If `SylApi` cannot meet the demand, the following methods can be used:

- Through [Issues](https://github.com/bytedance/syllepsis/issues), provide requirements and application scenarios. After confirming the support, we will schedule development or the demand side will meet it through `Pull Request`.
- You can get the native `EditorView` object through the `view` property mounted on the editor instance to perform lower-level operations. For details, please refer to [Prosemirror](https://prosemirror.net/docs/ref/).
