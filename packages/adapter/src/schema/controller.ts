import { Node as ProsemirrorNode, Slice } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { SylApi } from '../api';
import { Types } from '../libs';
import { IMatcherConfig, TextMatcherHandler } from './matchers';

interface IToolbar {
  className?: string;
  tooltip?: string | ((node: any) => any);
  type?: string;
  icon?: any | ((editor: SylApi, attrs: Types.StringMap<any>, extra: any) => any);
  handler?(editor: SylApi, ...args: any[]): void;
  showName?: string | boolean;
  getRef?(ref: HTMLElement | null): void;
  [x: string]: any;
}

interface IControllerCommand {
  [key: string]: (editor: SylApi, ...args: any[]) => any;
}

interface IEventHandler {
  handleKeyDown?: (editor: SylApi, view: EditorView, event: KeyboardEvent) => boolean | void;
  handleKeyPress?: (editor: SylApi, view: EditorView, event: KeyboardEvent) => boolean | void;
  handleTextInput?: (editor: SylApi, view: EditorView, from: number, to: number, text: string) => boolean | void;
  handleClickOn?: (
    editor: SylApi,
    view: EditorView,
    pos: number,
    node: ProsemirrorNode,
    nodePos: number,
    event: MouseEvent,
    direct: boolean,
  ) => boolean | void;
  handleClick?: (editor: SylApi, view: EditorView, pos: number, event: MouseEvent) => boolean | void;
  handleDoubleClickOn?: (
    editor: SylApi,
    view: EditorView,
    pos: number,
    node: ProsemirrorNode,
    nodePos: number,
    event: MouseEvent,
    direct: boolean,
  ) => boolean | void;
  handleDoubleClick?: (editor: SylApi, view: EditorView, pos: number, event: MouseEvent) => boolean | void;
  handleTripleClickOn?: (
    editor: SylApi,
    view: EditorView,
    pos: number,
    node: ProsemirrorNode,
    nodePos: number,
    event: MouseEvent,
    direct: boolean,
  ) => boolean | void;
  handleTripleClick?: (editor: SylApi, view: EditorView, pos: number, event: MouseEvent) => boolean | void;
  handlePaste?: (editor: SylApi, view: EditorView, event: Event, slice: Slice) => boolean | void;
  handleDrop?: (editor: SylApi, view: EditorView, event: Event, slice: Slice, moved: boolean) => boolean | void;
  handleScrollToSelection?: (editor: SylApi, view: EditorView) => boolean | void;
  transformPastedHTML?: (editor: SylApi, html: string) => string;
  transformPastedText?: (editor: SylApi, text: string) => string;
  transformPasted?: (editor: SylApi, p: Slice) => Slice;
  clipboardTextSerializer?: (editor: SylApi, p: Slice) => string;
  handleDOMEvents?: Partial<
    Record<keyof HTMLElementEventMap, (editor: SylApi, view: EditorView, event: any) => boolean | void>
  >;
}

type TKeymapHandler = (
  editor: SylApi,
  state: EditorState,
  dispatch: EditorView['dispatch'] | undefined,
  view: EditorView | undefined,
) => boolean;

class SylController<T extends Types.StringMap<any> = any> {
  public name = ''; // format name
  public editor: SylApi;
  public toolbar: IToolbar = {};
  public textMatcher?: Array<IMatcherConfig<RegExp | RegExp[], TextMatcherHandler>>;
  public props: Partial<T> = {};
  public command?: IControllerCommand;
  public disable?(editor: SylApi): boolean;
  public active?(editor: SylApi): boolean;
  public eventHandler?: IEventHandler;
  public keymap?: Types.StringMap<TKeymapHandler>;
  public transformGetHTML?(html: string): string;
  // return `Transaction` only when the state needs to be processed
  public appendTransaction?(tr: Transaction, oldState: EditorState, newState: EditorState): void | Transaction;
  // return `false` when need to ignore `transaction`
  public filterTransaction?(tr: Transaction, state: EditorState): boolean;

  constructor(editor: SylApi, props: Partial<T>) {
    this.editor = editor;
    this.props = props;
  }

  public editorWillUnmount() {
    // destroy virtual function
  }
}

export { IControllerCommand, IEventHandler, IToolbar, SylController, TKeymapHandler };
