# All configurations

## Schema

Definition of node type and rendering

```typescript
// Block is Node, Inline corresponds to Mark
// attribute reference: https://prosemirror.net/docs/ref/#model.NodeSpec
import {Block, Inline} from'@syllepsis/adapter';

// One more custom ViewMap property than Inline and Block
// which can be implemented with different rendering libraries
// and cannot contain editable content by default
import {Card, InlineCard} from'@syllepsis/access-react';
```

On the basis of `prosemirror`, we provide some custom `Spec` to define node performance

### Special attributes of inline elements

| Configuration name | Interpretation | Example |
| ------------ | ------------------------------------ -------------------------------------------------- -------------------------------------------- | ----- ---------------- |
| notClear | will not be cleared by SylApi.clearFormat when it is true | notClear = true |
| notStore | When it is true, delete the element content and then enter it will not save the element structure | notStore = true |
| getText | Use inline cards with attrs.text to specify whether to get text when SylApi.getText() | getText = false |
| inclusive | When false, the element structure will not be inherited when inputting behind the element | inclusive = false |
| excludeMarks | Indicates that inline elements/cards cannot contain inline elements | excludeMarks ='bold' |
| fixCursor | When the inline element is non-text or the presence of padding or marin causes the cursor position to be incorrect, the default is false (when it is `true`, the cursor will not be displayed in the `Chrome88` version) | fixCursor = false |

### Block-level element special attributes

| Configuration name | Interpretation | Example |
| ------------ | ------------------------------------ ------------------ | --------------------- |
| excludeMarks | Inline elements that cannot be included in block-level elements/cards | excludeMarks ='bold' |
| notLastLine | Declare that the block-level element cannot be in the last line (a blank line will be automatically inserted at this time) | notLastLine = true |

### Special attributes of inline elements

| Configuration name | Interpretation | Example |
| -------------- | ---------------------------------- -------------------------------------------------- ----- | ---------------------- |
| traceSelection | Used to control whether you need to track the text selection and update props.isSelected (when a large number of nodes are all selected, it will have a significant impact on performance) | traceSelection = false |

### ViewMap

Input parameters of the rendering function in the card `ViewMap`

```typescript
interface IViewMapProps<T = Types.StringMap<any>> {
  attrs: T; // attrs of the current node
  editor: SylApi;
  dispatchUpdate: (attrs: Partial<T>) => any; // update card attrs
  getPos: () => number; // Get card position
  isSelected: boolean; // Whether to select, use with traceSelection
  wrapDOM: HTMLElement; // parent node of the package
}
```

---

---

## Controller

Plug-in operation related control

```typescript
interface IToolbar {
  className?: string; // button class name
  tooltip?: string | ((node: any) => any); // button tooltip
  icon?: any | ((editor: SylApi, attrs: Types.StringMap<any>, extra: any) => any); // button icon
  handler?(editor: SylApi): void; // Click the button callback
  showName?: string | boolean; // The name displayed when in the drop-down list
  getRef? (ref: HTMLElement | null): void; // Get the DOM mounted by the button
}

interface IMatcherConfig<MatcherType = RegExp | RegExp[], HandlerType = TextMatcherHandler> {
  name?: string;
  matcher: RegExp | RegExp[];
  handler?: (match: RegExpMatchArray, offset: number) => boolean | Record<string, any>;
}

// Mounted in the editor instance, called by editor.command[name]
interface IControllerCommand {
  [key: string]: (editor: SylApi, ...args: any[]) => any;
}

// https://prosemirror.net/docs/ref/#keymap.keymap, handle shortcut keys
type TKeymapHandler = (
  editor: SylApi,
  state: EditorState,
  dispatch: EditorView['dispatch'],
  view: EditorView,
) => boolean;

// handle events in the editor
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
  public name: string; // Plug-in ID
  public editor: SylApi;
  public toolbar: IToolbar;
  public textMatcher?: Array<IMatcherConfig<RegExp | RegExp[], TextMatcherHandler>>;
  public props: Partial<T> = {};
  public command?: IControllerCommand;
  public disable? (editor: SylApi): boolean; // judge to disable
  public active? (editor: SylApi): boolean; // Determine whether to highlight
  public eventHandler?: IEventHandler;
  public keymap?: Types.StringMap<TKeymapHandler>;
  public transformGetHTML?(html: string): string; // Process the data when getHTML
  // https://prosemirror.net/docs/ref/#state.PluginSpec.appendTransaction, return Transaction only when it needs to be modified
  public appendTransaction?(tr: Transaction, oldState: EditorState, _newState: EditorState): void | Transaction;

  constructor(editor: SylApi, props: Partial<T>) {}

  // will be called when the editor is uninstalled
  public editorWillUnmount() {}
}
```