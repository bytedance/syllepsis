import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import './style.css';

import { createCardDOM, createMaskDOM, createTemplDOM, EventChannel, SylApi } from '@syllepsis/adapter';
import CodeMirror from 'codemirror';
import debounce from 'lodash.debounce';
import { exitCode } from 'prosemirror-commands';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { Selection, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { config } from './config';
import { DEFAULT_LANGUAGE, removeEmptyCodeBlock } from './utils';

type GetPos = () => number;
// codeblock is special formats witch contains text content, behave like block
// and we need to control all of its behavior, so we treat it as built-in formats to support better user experience
// to achieve it, we use `NodeView` feature ProseMirror supply
// https://prosemirror.net/docs/ref/#view.NodeView
class CodeBlockView {
  public dom: HTMLElement;
  private node: ProseMirrorNode;
  private view: EditorView;
  private getPos: GetPos;
  private incomingChanges: boolean;
  private cm: CodeMirror.Editor;
  private updating: boolean;
  private templ: HTMLElement;
  private editor: SylApi;

  constructor(editor: SylApi, node: ProseMirrorNode, view: EditorView, getPos: boolean | GetPos) {
    // Store for later
    this.node = node;
    this.view = view;
    this.getPos = getPos as GetPos;
    this.editor = editor;
    this.incomingChanges = false;
    // The editor's outer node is our DOM representation
    this.dom = createCardDOM();
    const maskDOM = createMaskDOM();
    this.templ = createTemplDOM();
    this.dom.appendChild(this.templ);
    this.dom.appendChild(maskDOM);
    // Create a CodeMirror instance
    this.cm = CodeMirror(maskDOM, {
      value: this.node.textContent,
      tabSize: 2,
      mode: node.attrs.language || DEFAULT_LANGUAGE,
      extraKeys: this.codeMirrorKeymap(editor),
      ...config,
    });
    this.boundEvent();

    this.updateTemplValue();
    // CodeMirror needs to be in the DOM to properly initialize, so schedule it to update itself
    setTimeout(() => this.cm.refresh(), 20);

    // This flag is used to avoid an update loop between the outer and inner editor
    this.updating = false;

    this.dom.setAttribute('language', node.attrs.language);
    this.dom.setAttribute('code_block', 'true');
  }

  private boundEvent = () => {
    // Track whether changes are have been made but not yet propagated
    this.cm.on('beforeChange', () => (this.incomingChanges = true));

    // Propagate updates from the code editor to ProseMirror
    this.cm.on('cursorActivity', () => {
      if (!this.updating && !this.incomingChanges) this.forwardSelection();
    });

    this.cm.on('changes', () => {
      if (!this.updating) {
        this.valueChanged();
        this.forwardSelection();
      }
      this.incomingChanges = false;
    });

    this.cm.on('focus', this.forwardSelection);

    this.editor.on(EventChannel.LocalEvent.ON_CHANGE, this.checkEditable);
  };

  private checkEditable = debounce(
    () => {
      if (this.editor.editable && this.cm.isReadOnly()) {
        this.cm.setOption('readOnly', false);
      } else if (!this.editor.editable && !this.cm.isReadOnly()) {
        this.cm.setOption('readOnly', 'nocursor');
      }
    },
    300,
    { leading: true },
  );

  private forwardSelection = () => {
    if (!this.cm.hasFocus()) return;
    const state = this.view.state;
    const selection = this.asProseMirrorSelection(state.doc);

    if (!selection.eq(state.selection)) {
      this.view.dispatch(state.tr.setSelection(selection));
    }
  };

  private asProseMirrorSelection(doc: ProseMirrorNode) {
    const offset = this.getPos() + 1;
    const anchor = this.cm.indexFromPos(this.cm.getCursor('from')) + offset;
    const head = this.cm.indexFromPos(this.cm.getCursor('to')) + offset;
    return TextSelection.create(doc, anchor, head);
  }

  public setSelection(anchor: number, head: number) {
    this.updating = true;
    this.cm.setSelection(this.cm.posFromIndex(anchor), this.cm.posFromIndex(head));
    if (!this.cm.hasFocus()) this.cm.focus();
    this.updating = false;
  }

  private valueChanged() {
    const change = computeChange(this.node.textContent, this.cm.getValue());
    if (change) {
      const start = this.getPos() + 1;
      const tr = this.view.state.tr.replaceWith(
        start + change.from,
        start + change.to,
        change.text ? this.view.state.schema.text(change.text) : null,
      );
      this.updateTemplValue();
      this.view.dispatch(tr);
    }
  }

  private codeMirrorKeymap(editor: SylApi) {
    const { view } = editor;
    const cm = () => this.cm;
    const mod = /Mac/.test(navigator.platform) ? 'Cmd' : 'Ctrl';
    const undo = () => {
      editor.undo();
      editor.focus();
    };
    const redo = () => {
      editor.redo();
      editor.focus();
    };

    return CodeMirror.normalizeKeyMap({
      Up: () => this.maybeEscape('line', -1),
      Left: () => this.maybeEscape('char', -1),
      Down: () => this.maybeEscape('line', 1),
      Right: () => this.maybeEscape('char', 1),
      [`${mod}-Z`]: undo,
      [`Shift-${mod}-Z`]: redo,
      [`${mod}-Y`]: redo,
      [`${mod}-Enter`]: () => {
        if (exitCode(view.state, view.dispatch)) view.focus();
      },
      Enter: () => {
        const _cm = cm();
        const lineCount = _cm.lineCount();
        const cursorLine = _cm.getCursor().line;
        if (lineCount > 1 && cursorLine === lineCount - 1) {
          const curLine = _cm.getLine(cursorLine);
          if (curLine === '') {
            const prevLine = _cm.getLine(cursorLine - 1);
            if (prevLine === '') {
              _cm.execCommand('delCharBefore');
              _cm.execCommand('delCharBefore');
              if (_cm.getValue().length === 0) {
                const pos = view.state.selection.$from.before();
                const end = view.state.selection.$from.after();
                view.dispatch(view.state.tr.delete(pos, end));
                view.focus();
              } else if (exitCode(view.state, view.dispatch)) {
                view.focus();
              }
              return;
            }
          }
        }
        _cm.execCommand('newlineAndIndent');
      },
      Backspace: () => {
        const _cm = cm();
        if (removeEmptyCodeBlock(view, _cm)) {
          view.focus();
        } else {
          _cm.execCommand('delCharBefore');
        }
      },
    });
  }

  private maybeEscape(unit: 'line' | 'char', dir: number) {
    const pos = this.cm.getCursor();
    if (
      this.cm.somethingSelected() ||
      pos.line !== (dir < 0 ? this.cm.firstLine() : this.cm.lastLine()) ||
      (unit === 'char' && pos.ch !== (dir < 0 ? 0 : this.cm.getLine(pos.line).length))
    ) {
      return CodeMirror.Pass;
    }
    this.view.focus();
    const targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize);
    const selection = Selection.near(this.view.state.doc.resolve(targetPos), dir);
    this.view.dispatch(this.view.state.tr.setSelection(selection).scrollIntoView());
    this.view.focus();
  }

  public updateTemplValue() {
    let code = this.templ.querySelector('pre>code');
    if (!code) {
      const pre = document.createElement('pre');
      pre.setAttribute('language', this.node.attrs.language);
      code = document.createElement('code');
      pre.appendChild(code);
      this.templ.appendChild(pre);
    }
    // use textContent to escape special chars
    code.textContent = this.cm.getValue();
  }

  public update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) return false;
    this.node = node;
    const change = computeChange(this.cm.getValue(), node.textContent);
    if (change) {
      this.updating = true;
      this.cm.replaceRange(change.text, this.cm.posFromIndex(change.from), this.cm.posFromIndex(change.to));
      this.updating = true;
    }
    return true;
  }

  // Can be used to override the way the node's selected status (as a node selection) is displayed.
  public selectNode() {
    this.cm.focus();
  }

  public stopEvent() {
    return true;
  }

  public destroy() {
    this.editor.off(EventChannel.LocalEvent.ON_CHANGE, this.checkEditable);
  }
}

function computeChange(
  oldVal: string,
  newVal: string,
): {
  from: number;
  to: number;
  text: string;
} | null {
  if (oldVal === newVal) return null;
  let start = 0;
  let oldEnd = oldVal.length;
  let newEnd = newVal.length;

  while (start < oldEnd && oldVal.charCodeAt(start) === newVal.charCodeAt(start)) {
    ++start;
  }
  while (oldEnd > start && newEnd > start && oldVal.charCodeAt(oldEnd - 1) === newVal.charCodeAt(newEnd - 1)) {
    oldEnd--;
    newEnd--;
  }

  return {
    from: start,
    to: oldEnd,
    text: newVal.slice(start, newEnd),
  };
}

export { CodeBlockView };
