import { EventChannel, removeMark, SylApi, SylController, SylPlugin, Types } from '@syllepsis/adapter';

const CURSOR_STYLE =
  ';cursor: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAYCAMAAACoeN87AAAAh1BMVEUAAAACAgL39/cICAgFBQUAAAADAwMKCgr6+vrn5+fr6+v6+voEBAT19fXm5ubf39+pqanBwcH8/PzOzs76+vrx8fHz8/P29vbh4eHm5ubT09OXl5f///9ZWVkiIiLIyMjGxsY+Pj5LS0uenp4vLy/V1dXk5OSsrKxnZ2eRkZF1dXXj4+ODg4P4y9kGAAAAHHRSTlMACMUDDQYOCuONi8MSt2tJMCryT9OpqKaRezobrP6h8wAAAR9JREFUKM+dk1lygzAMQOMtxoQlS/dKBrMn7f3PVwEFPND0I+/Dg8RD0mjM7nGEZoIOqfwc+0jTVE+RgcAcTQBvbFFOvM7zJvgcIw2uaKF0DuRS5LW1RBmKMQyhdugyMGJWGMciywrkauobZrY2kgxPQQCcFGIPFvb+sNGkSLUo3iDqEvPzqJz5IVF/KEnTIVak0IG35rJV1OFGr7AEKJHULh7KRKRE86gHLPKZAjnrkwEpgV4U6zEqEugRpL+TmXtVEGaQlO0sfK1sVnds7Pf/yim42q9FccjVai/q5WornKlsm4hVFRGX6NFlT7rPSlPb3GgxNnrmHvF7nxYh5A5dDaEaWzGf4TsGzpXQFsut2yDC37tr1O4eSurhD6CaPzWzJeCQ3tPtAAAAAElFTkSuQmCC) 28 10, text;';

const PLUGIN_NAME = 'format_painter';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    format_painter?: {
      applyFormat: () => void;
      collectFormat: () => void;
    };
  }
}

interface IFormatPainterProps {
  ignoreNodes?: string[];
  ignoreMarks?: string[];
  addNodes?: string[];
  addMarks?: string[];
}

class FormatPainterController extends SylController<IFormatPainterProps> {
  public name = PLUGIN_NAME;

  public editor: SylApi;
  public props: Required<IFormatPainterProps> = {
    ignoreNodes: [],
    ignoreMarks: [],
    addNodes: [],
    addMarks: [],
  };

  public _isApply = false;
  public _isContinuosApply = false;

  public setCursor() {
    const style = this.editor.view.dom.getAttribute('style') || '';
    if (!style.includes(CURSOR_STYLE)) {
      this.editor.view.dom.setAttribute('style', style + CURSOR_STYLE);
    }
  }

  public removeCursor() {
    const style = this.editor.view.dom.getAttribute('style') || '';
    if (style.includes(CURSOR_STYLE)) {
      this.editor.view.dom.setAttribute('style', style.replace(CURSOR_STYLE, ''));
    }
  }

  get isApply() {
    return this._isApply;
  }

  set isApply(val) {
    if (val === this._isApply) return;
    if (!val) {
      document.removeEventListener('mouseup', this.singleApply);
      document.removeEventListener('keyup', this.stopApplyOnEsc);
      this.removeCursor();
    } else {
      document.addEventListener('mouseup', this.singleApply);
      document.addEventListener('keyup', this.stopApplyOnEsc);
      this.setCursor();
    }
    this._isApply = val;
  }

  get isContinuosApply() {
    return this._isContinuosApply;
  }

  set isContinuosApply(val) {
    if (val === this._isContinuosApply) return;
    if (!val) {
      document.removeEventListener('mouseup', this.applyFormat);
      document.removeEventListener('keyup', this.stopApplyOnEsc);
      this.removeCursor();
    } else {
      document.addEventListener('mouseup', this.applyFormat);
      document.addEventListener('keyup', this.stopApplyOnEsc);
      this.setCursor();
    }
    this._isContinuosApply = val;
  }

  public stopApply = () => {
    this.isContinuosApply = false;
    this.isApply = false;
    this.editor.configurator.emit(EventChannel.LocalEvent.ON_CHANGE);
  };

  public stopApplyOnEsc = (e: KeyboardEvent) => {
    const code = e.keyCode || e.which;
    if (code === 27) {
      this.stopApply();
      e.stopPropagation();
    }
  };

  public collectMarks: Types.StringMap<any> = {};

  public collectNodes: Types.StringMap<any> = {};

  public stashFormat: {
    marks: Types.StringMap<any>;
    nodeAttrs: Types.StringMap<any>;
  } = {
    marks: {},
    nodeAttrs: {},
  };

  constructor(editor: SylApi, props: IFormatPainterProps) {
    super(editor, props);
    this.editor = editor;
    Object.assign(this.props, props);
    this.applyFormat = this._applyFormat.bind(this);
    editor.on(EventChannel.LocalEvent.EDITOR_CREATED, this.constructCollectInfo);
  }

  public constructCollectInfo = () => {
    const { editor, props } = this;
    Object.keys(editor.view.state.schema.marks).forEach(markName => {
      const spec = editor.view.state.schema.marks[markName].spec;
      if (props.ignoreMarks.includes(markName) || spec.notStore || spec.notClear) return;
      // `false` because the values not included need to be reset
      this.collectMarks[markName] = false;
    });
    props.addMarks.forEach(markName => (this.collectMarks[markName] = true));
    Object.keys(editor.view.state.schema.nodes).forEach(nodeName => {
      const nodeType = editor.view.state.schema.nodes[nodeName];
      if (props.ignoreNodes.includes(nodeName)) return;
      if (nodeType.isTextblock) this.collectNodes[nodeName] = true;
    });
    props.addNodes.forEach(nodeName => (this.collectNodes[nodeName] = true));
    editor.off(EventChannel.LocalEvent.EDITOR_CREATED, this.constructCollectInfo);
  };

  public active = () => this.isApply || this.isContinuosApply;

  public collectFormat = () => {
    const { doc } = this.editor.view.state;
    const { $from, from } = this.editor.view.state.selection;
    const $end = doc.resolve(from + 1);

    const _marks: any = {};
    const _nodeAttrs: any = {};

    ($from.marksAcross($end) || []).forEach(mark => {
      if (this.collectMarks.hasOwnProperty(mark.type.name)) {
        _marks[mark.type.name] = mark.attrs;
      }
    });
    const parentNode = $from.node();

    if (this.collectNodes[parentNode.type.name]) {
      const parentSpecAttrs = parentNode.type.spec.attrs || {};
      Object.keys(parentSpecAttrs).forEach((key: string) => {
        if (parentSpecAttrs[key].inherit !== false) _nodeAttrs[key] = parentNode.attrs[key];
      });
    }

    this.stashFormat.nodeAttrs = _nodeAttrs;
    this.stashFormat.marks = {
      ...this.collectMarks,
      ..._marks,
    };
  };

  public applyFormat = () => {};

  public _applyFormat() {
    const { state, dispatch } = this.editor.view;
    const { doc } = state;
    const { $from, $to, empty, from, to } = state.selection;

    if (empty) {
      return this.stopApply();
    }

    const parentPos = $from.before();
    let tr = state.tr;

    tr = state.tr.setNodeMarkup(parentPos, undefined, this.stashFormat.nodeAttrs);

    tr = removeMark(doc, tr, from, to);

    Object.keys(this.stashFormat.marks).forEach(markName => {
      if (!state.schema.marks[markName] || !this.stashFormat.marks[markName]) {
        return;
      }
      tr = tr.addMark($from.pos, $to.pos, state.schema.marks[markName].create(this.stashFormat.marks[markName]));
    });
    dispatch(tr);
  }

  public singleApply = () => {
    if (!this.editor.isFocused) return;
    this.applyFormat();
    this.isApply = false;
  };

  public toolbar = {
    handler: () => {
      if (this.isContinuosApply || this.isApply) {
        this.stopApply();
        return;
      }

      if (!this.isApply) {
        this.collectFormat();
        this.isApply = true;
        this.editor.configurator.emit(EventChannel.LocalEvent.ON_CHANGE);
      }
    },
  };

  public buttonProps = {
    onDoubleClick: () => {
      this.collectFormat();
      this.isContinuosApply = true;
    },
  };

  public command = {
    collectFormat: this.collectFormat,
    applyFormat: this.applyFormat,
  };
}

class FormatPainterPlugin extends SylPlugin<IFormatPainterProps> {
  public name = PLUGIN_NAME;
  public Controller = FormatPainterController;
}

export { FormatPainterController, FormatPainterPlugin };
