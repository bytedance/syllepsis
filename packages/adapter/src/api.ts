import { redo } from 'prosemirror-history';
import { DOMParser, Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorState, NodeSelection, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { IDecoState } from './basic/decoration';
import { undo } from './basic/keymap/behavior';
import { SHORTCUT_KEY } from './basic/text-shortcut/shortcut-plugin';
import {
  _delete,
  appendShadow,
  checkHasContentBefore,
  clearFormat,
  formatSelection,
  getCursorNode,
  getExistMarks,
  getExistNodes,
  getFormat,
  getShadows,
  IGeneralOption,
  INodeInfo,
  insert,
  InsertOption,
  insertShadow,
  insertText,
  IReplaceOption,
  IUpdateOption,
  removeShadow,
  replace,
  update,
} from './command';
import { SylConfigurator } from './configurator';
import { EventChannel } from './event';
import { formatGetHTML, IG_TAG, parseHTML } from './formatter';
import { getRealSelectionInfo, Types, warpCommand } from './libs';
import { IModuleType } from './module';

interface ISylApiAdapterOptions {
  module?: Types.StringMap<IModuleType>;
  content?: string | Types.StringMap<any>;
}

interface ISetFormatOptions extends Partial<Types.IRangeStatic> {
  focus?: boolean;
}

interface IGetHTMLOptions {
  layerType?: string;
  mergeEmpty?: boolean;
}

interface ISetHTMLOptions {
  allowUndo?: boolean;
  silent?: boolean;
  mergeEmpty?: boolean;
  keepWhiteSpace?: boolean;
}

interface IGetSelectionInfo extends Types.IRangeStatic {
  anchor: number;
  head: number;
  node?: ProsemirrorNode;
}

interface ISetSelectionOptions extends Partial<Types.IRangeStatic> {
  anchor?: number;
  head?: number;
  scrollIntoView?: boolean;
  selectNode?: boolean;
}

type TSylApiCommand = (...args: any[]) => any;
// `undefined` is to avoid misunderstanding caused by code hints, compulsory judgment beforehand
interface ISylApiCommand extends Record<string, Record<string, TSylApiCommand> | undefined> {}

class SylApi {
  public root: HTMLElement;
  public configurator: SylConfigurator;
  public view: EditorView;
  public domParser: DOMParser;
  declare command: ISylApiCommand;

  constructor(configurator: SylConfigurator, { module, content }: ISylApiAdapterOptions) {
    this.configurator = configurator;
    this.root = configurator.mount;
    this.view = configurator.view;
    this.configurator.init(this, module);
    this.domParser = this.configurator.domParser!;

    if (content) {
      if (typeof content === 'string') this.setHTML(content);
      else this.setContent(content);
    }

    this.view.dom.addEventListener('blur', this.listenBlur);
    this.view.dom.addEventListener('focus', this.listenFocus);
    this.emit(EventChannel.LocalEvent.EDITOR_CREATED);
  }

  public addCommand = (name: string | null, commandObj: { [key: string]: (...args: any[]) => any }) => {
    if (!name) return;
    const adapter = this;
    if (!this.command) this.command = {};
    this.command[name] = Object.keys(commandObj).reduce((command, commandName) => {
      command[commandName] = warpCommand(adapter, commandObj[commandName]);
      return command;
    }, {} as { [key: string]: TSylApiCommand });
  };

  private listenBlur = () => {
    this.configurator.emit(EventChannel.LocalEvent.ON_BLUR);
  };

  private listenFocus = () => {
    this.configurator.emit(EventChannel.LocalEvent.ON_FOCUS);
  };

  public get length() {
    return this.view.state.doc.content.size;
  }

  public get isEmpty() {
    return this.length === 2;
  }

  public get text() {
    return this.getText();
  }

  public get isFocused() {
    return this.view.hasFocus();
  }

  public get undoable() {
    const { state } = this.view;
    return undo(state);
  }

  public get redoable() {
    const { state } = this.view;
    return redo(state);
  }

  public get editable() {
    return this.view.editable;
  }

  public get shortcutable() {
    // @ts-ignore
    return this.view.state.config.pluginsByKey[SHORTCUT_KEY.key].enable;
  }

  public get isDestroy() {
    return !this.view.docView;
  }

  public onError(err: Error, args?: any) {
    return this.configurator.onError(err, args);
  }

  // `length` refers to the length of the text
  public getText(range?: Types.IRangeStatic) {
    try {
      const doc = this.view.state.doc;
      let from = 0;
      let to = doc.nodeSize - 2;
      let length;
      if (range) {
        from = range.index;
        to = Math.min(range.index + range.length, to);
        length = range.length;
      }

      let textRes = '';
      doc.nodesBetween(from, to, (node, nodePos) => {
        if (node.inlineContent) {
          let startPos = nodePos + 1;
          node.content.forEach(_node => {
            if (startPos > from || startPos + _node.nodeSize > from) {
              let text: string = _node.isText ? _node.textContent : _node.type.spec.getText ? _node.attrs.text : '';
              if (startPos < from) text = text.substr(from - startPos);
              textRes += text;
            }
            startPos += _node.nodeSize;
          });
        }
      });
      return textRes.substr(0, length);
    } catch (e) {
      console.error(e);
      this.onError(e, arguments);
      return '';
    }
  }

  public setFormat(format: Types.StringMap<any>, option: ISetFormatOptions = {}) {
    try {
      const { state, dispatch } = this.view;
      let range: undefined | { from: number; to: number };
      if (option.index !== undefined && option.length !== undefined) {
        range = { from: option.index, to: option.index + option.length };
      }

      let tr = state.tr;
      Object.keys(format).map(type => {
        tr = formatSelection(type, format[type], range)(state, tr);
      });
      dispatch(tr);

      option.focus !== false && this.focus();
    } catch (err) {
      this.onError(err, arguments);
    }
  }

  public insert(nodeInfo: INodeInfo | string, index?: InsertOption | number) {
    try {
      return insert(this.view, nodeInfo, index);
    } catch (err) {
      this.onError(err, arguments);
    }
  }

  public insertText(text: string, format: Types.StringMap<any> = {}, index?: number | InsertOption) {
    try {
      return insertText(this.view, text, format, index);
    } catch (err) {
      this.onError(err, arguments);
    }
  }

  public insertCard(type: string, attrs?: Types.StringMap<any>, index?: InsertOption | number) {
    return this.insert({ type, attrs }, index);
  }

  public insertInlineCardWithPara(type: string, attrs: Types.StringMap<any>, index?: InsertOption | number) {
    return this.insert({ type: 'paragraph', content: [{ type, attrs }] }, index);
  }

  public replace(nodeInfo: INodeInfo | string, replaceOption?: IReplaceOption | number) {
    try {
      return replace(this.view, nodeInfo, replaceOption);
    } catch (err) {
      this.onError(err, arguments);
    }
  }

  public replaceCard(type: string, attrs: Types.StringMap<any>, index: number | IReplaceOption) {
    return this.replace({ type, attrs }, index);
  }

  public delete(index?: number, length?: number, option: IGeneralOption = {}) {
    try {
      return _delete(this.view, { index, length, ...option });
    } catch (err) {
      this.onError(err, arguments);
    }
  }

  public deleteCard(index: number) {
    this.delete(index, 1);
  }

  public on(event: EventChannel['LocalEvent'], handler: (...args: any[]) => void): void {
    this.configurator.on(event, handler);
  }

  public off(event: EventChannel['LocalEvent'], handler: (...args: Array<any>) => void) {
    this.configurator.off(event, handler);
  }

  public emit(eventName: string) {
    this.configurator.emit(eventName);
  }

  public getSelection = () => {
    const selection = this.view.state.selection;
    const { from, to, anchor, head } = getRealSelectionInfo(selection);
    const selectionInfo: IGetSelectionInfo = {
      index: from,
      length: to - from,
      anchor,
      head,
    };
    if (selection instanceof NodeSelection) selectionInfo.node = selection.node;

    return selectionInfo;
  };

  public setSelection(config: ISetSelectionOptions) {
    const { index, length = 0, scrollIntoView = true, anchor, head, selectNode = false } = config;
    if (index === undefined && anchor === undefined && head === undefined) {
      throw new TypeError('must provide one of these parameters: [index, anchor, head]');
    }
    const { state, dispatch } = this.view;
    const { doc } = state;
    const max = doc.content.size;
    let resultAnchor = 0;
    let resultHead: number | undefined;
    if (index !== undefined) {
      resultAnchor = index;
      resultHead = Math.min(index + length, max);
    } else {
      if (anchor !== undefined) resultAnchor = Math.min(anchor, max);
      if (head !== undefined) {
        resultHead = Math.min(head, max);
        if (anchor === undefined) resultAnchor = resultHead;
      }
    }

    const selection = selectNode
      ? NodeSelection.create(doc, resultAnchor)
      : TextSelection.create(doc, resultAnchor, resultHead);
    const tr = state.tr.setSelection(selection);
    dispatch(scrollIntoView === false ? tr : tr.scrollIntoView());
  }

  public blur() {
    (this.view.dom as HTMLElement).blur();
  }

  public enable() {
    this.configurator.setEditable(true);
  }

  public disable() {
    this.configurator.setEditable(false);
  }

  public enableShortcut() {
    this.configurator.setShortcutAble(true);
  }

  public disableShortcut() {
    this.configurator.setShortcutAble(false);
  }

  public focus() {
    this.view.focus();
  }

  public undo() {
    const { dispatch, state } = this.view;
    const res = undo(state, dispatch);
    // used to update toolbar status
    this.configurator.emit(EventChannel.LocalEvent.SELECTION_CHANGED);
    return res;
  }

  public redo() {
    const { dispatch, state } = this.view;
    const res = redo(state, dispatch);
    // used to update toolbar status
    this.configurator.emit(EventChannel.LocalEvent.SELECTION_CHANGED);
    return res;
  }

  public uninstall() {
    this.view.dom.removeEventListener('blur', this.listenBlur);
    this.view.dom.removeEventListener('focus', this.listenFocus);
    this.configurator.uninstall();
  }

  public getContent() {
    return this.view.state.toJSON();
  }

  public setContent(value: Types.StringMap<any>) {
    try {
      const state: EditorState = EditorState.fromJSON(this.view.state, value);
      this.view.updateState(state);
    } catch (err) {
      this.onError(err, arguments);
    }
  }

  /**
   * set editor content by `HTML`
   * `allowUndo` refers to whether to allow undo, the default is false;
   * `silent` refers to whether to emit the `text-change` event, the default is true;
   * `mergeEmpty` refers to whether to merge continuous empty <p> and continuous <br>. The default is true.
   * Note that allowUndo must be false when silent is true.
   */
  public setHTML(value = '', options: ISetHTMLOptions = {}) {
    try {
      const config = Object.assign(
        {
          allowUndo: false,
          silent: true,
          mergeEmpty: true,
          keepWhiteSpace: undefined,
        },
        options,
      );

      const { view } = this;
      const docNode = parseHTML(value, this, config);

      if (config.allowUndo || config.silent === false) {
        view.dispatch(view.state.tr.replace(0, view.state.doc.content.size, docNode.slice(0)));
      } else {
        const newState = EditorState.create({
          schema: view.state.schema,
          storedMarks: view.state.storedMarks,
          plugins: view.state.plugins,
          doc: docNode,
        });
        view.updateState(newState);
      }
    } catch (err) {
      this.onError(err, arguments);
    }
  }

  /**
   * get `HTML content` of editor
   * `mergeEmpty` refers to whether to merge continuous empty <p> and continuous <br>. The default is false.
   * `layerType` refers to the content configured in `ViewMap` or `layers`, the default is ‘template’
   */
  public getHTML(config: IGetHTMLOptions = { layerType: 'template', mergeEmpty: false }) {
    try {
      if (config.layerType) {
        this.configurator.emit(EventChannel.LocalEvent.SWITCH_LAYER, config.layerType);
      }
      return formatGetHTML(this.view.dom as HTMLElement, config, this.configurator.getSylPlugins());
    } catch (e) {
      this.onError(e, arguments);
    }
  }

  public getExistNodes(nodeName: string) {
    try {
      return getExistNodes(this.view.state.doc, nodeName);
    } catch (err) {
      this.onError(err, arguments);
      return [];
    }
  }

  public getExistMarks(markName: string) {
    try {
      return getExistMarks(this.view.state, markName);
    } catch (err) {
      this.onError(err, arguments);
      return [];
    }
  }

  public checkHasContentBefore(pos: number) {
    try {
      return checkHasContentBefore(this.view.state.doc, pos);
    } catch (err) {
      this.onError(err, arguments);
      return true;
    }
  }

  public update(attrs: Types.StringMap<any>, updateOption: IUpdateOption | number) {
    try {
      return update(this.view, attrs, updateOption);
    } catch (err) {
      this.onError(err, arguments);
    }
  }

  public updateCardAttrs(index: number, attrs: Types.StringMap<any>, updateOption: Partial<IUpdateOption> = {}) {
    return this.update(attrs, { index, ...updateOption });
  }

  public getFormat(range?: Types.IRangeStatic) {
    try {
      return getFormat(this.view, range);
    } catch (err) {
      this.onError(err);
      return {};
    }
  }

  public clearFormat() {
    const result = clearFormat(this.view);
    // used to update toolbar status
    this.configurator.emit(EventChannel.LocalEvent.SELECTION_CHANGED);
    return result;
  }

  public nodesBetween(
    walker: (node: ProsemirrorNode, pos: number, parent: ProsemirrorNode) => boolean | undefined | void,
    range?: Types.IRangeStatic,
  ) {
    const { doc, selection } = this.view.state;
    let { from, to } = getRealSelectionInfo(selection);
    if (range) {
      from = range.index;
      to = range.index + range.length;
    } else if (selection.ranges.length > 1) {
      const ranges = selection.ranges.sort((a, b) => a.$from.pos - b.$from.pos);
      from = ranges[0].$from.pos;
      to = ranges[ranges.length - 1].$from.pos;
    }
    doc.nodesBetween(from, to, walker);
  }

  public getCursorNode() {
    return getCursorNode(this.view);
  }

  public getShadows(key?: ((spec: Types.StringMap<any>) => boolean) | string, index?: number, length?: number) {
    const start = index === undefined ? undefined : index;
    const end = start === undefined || length === undefined ? undefined : start + length;
    return getShadows(this.view.state, key, start, end);
  }

  public insertShadow(
    data: {
      index?: number;
      pos?: number;
      editable?: boolean;
      shadow: IDecoState['data']['shadow'];
      spec: IDecoState['data']['spec'];
    },
    inline = false,
  ) {
    const { state, dispatch } = this.view;
    const index = data.index || data.pos;
    const pos = index === undefined ? this.getSelection().index : index;
    insertShadow(state, dispatch, { ...data, pos }, inline);
  }

  public removeShadow(key: string) {
    const { state, dispatch } = this.view;
    const shadowInfo = removeShadow(state, dispatch, key);
    if (!shadowInfo) return;
    const { from, to, spec } = shadowInfo;
    return { index: from, length: to - from, spec };
  }

  public appendShadow(
    data: {
      index: number;
      length: number;
      attrs?: IDecoState['data']['attrs'];
      spec: IDecoState['data']['spec'];
    },
    inline = false,
  ) {
    const { state, dispatch } = this.view;
    const shadowData = {
      from: data.index,
      to: data.length + data.index,
      attrs: { [IG_TAG]: 'true', ...data.attrs },
      spec: data.spec,
    };
    appendShadow(state, dispatch, shadowData, inline);
  }

  // used to check whether the `format` is contains by current selection
  public isActive(type: string) {
    const format = this.getFormat();
    return !!format[type];
  }
}

export { ISetHTMLOptions, ISylApiAdapterOptions, ISylApiCommand, SylApi, TSylApiCommand };
