// actually fork from prosemirror-inputrules
import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { Types } from '../../libs';
import { IMatcherConfig, TextMatcherHandler } from '../../schema/matchers';

interface TextShortcutState {
  name: string;
  transform: Transaction;
  from: number;
  to: number;
  text: string;
}

type ShortCutState = TextShortcutState | boolean | null;

type TextShortCutHandler = (
  view: EditorView,
  state: EditorState,
  match: RegExpExecArray,
  start: number,
  end: number,
  insertText: string,
) => Transaction | null | undefined;

const MAX_MATCH = 500;
const SHORTCUT_KEY = new PluginKey('textShortcut');

// Find out the length of the overlap between `insertText` and `match`
const sameStart = (textBefore: string, match: string) => {
  for (let i = textBefore.length; i >= 0; i--) {
    if (textBefore[i] === match[0]) {
      // ex: textBefore `012` match `12`，result is 2
      const compareText = textBefore.substr(i, match.length);
      if (compareText === match) return i;
    }
  }
  return 0;
};

const stringHandler = (string: string): TextShortcut['handler'] => (view, state, match, start, end) => {
  let insert = string;
  if (match[1]) {
    const offset = match[0].lastIndexOf(match[1]);
    insert += match[0].slice(offset + match[1].length);
    const cutOff = start - end;
    if (cutOff > 0) {
      insert = match[0].slice(offset - cutOff, offset) + insert;
    }
  }
  return state.tr.insertText(insert, start, end);
};

class TextShortcut implements IMatcherConfig<RegExp | RegExp[], any> {
  public readonly name: string;
  public readonly matcher: RegExp;
  public readonly handler: TextShortCutHandler;
  public readonly config: IMatcherConfig<RegExp | RegExp[], any>;

  constructor(
    name: string,
    matcher: TextShortcut['matcher'],
    handler: TextShortcut['handler'] | string,
    config: TextShortcut['config'],
  ) {
    this.name = name;
    this.matcher = matcher;
    this.handler = typeof handler === 'string' ? stringHandler(handler) : handler;
    this.config = config;
    if (!this.config.timing) this.config.timing = 'input';
  }
}

class TextShortcutPlugin extends Plugin {
  private readonly textShortcuts: TextShortcut[];

  private enable = true;

  constructor(textShortcuts: TextShortcut[], _enable = true) {
    super({
      key: SHORTCUT_KEY,

      state: {
        init(): ShortCutState {
          return null;
        },
        apply: (tr, state): ShortCutState => {
          const stored = tr.getMeta(SHORTCUT_KEY);
          if (typeof stored === 'boolean') this.enable = stored;
          if (stored) return stored;
          return tr.selectionSet || tr.docChanged ? null : state;
        },
      },

      props: {
        handleTextInput: (view, from, to, text) => {
          if (!this.enable) return false;
          return this.applyTextShortcuts(view, from, to, text);
        },
        handleKeyDown: (view, event: KeyboardEvent) => {
          if (!this.enable) return false;
          if ((event.key === 'Enter' && event.keyCode === 13) || event.which === 13) {
            return this.applyEnterShortcuts(view);
          }
          return false;
        },
      },
    });
    this.enable = _enable;
    this.textShortcuts = textShortcuts;
  }

  private readonly applyEnterShortcuts = (view: EditorView): boolean => {
    const {
      to,
      from,
      $from: { nodeBefore },
    } = view.state.selection;
    if (nodeBefore && nodeBefore.isText) {
      return this.applyTextShortcuts(view, from, to, '', 'enter');
    }
    return false;
  };

  private readonly applyTextShortcuts = (
    view: EditorView,
    from: number,
    to: number,
    insertText: string,
    timing: TextShortcut['config']['timing'] = 'input',
  ): boolean => {
    const state = view.state;
    const $from = state.doc.resolve(from);
    // this should remind not emit in code_block or code or any
    // using text as content structure
    if ($from.parent.type.spec.code === true) {
      return false;
    }

    const textBefore =
      $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset, undefined, '\uFFFC') +
      insertText;

    for (const textShortcut of this.textShortcuts) {
      if (textShortcut.config.timing !== timing) continue;

      const match = textShortcut.matcher.exec(textBefore);

      let tr: Transaction | null | undefined = null;
      if (match !== null) {
        const realFrom = from + insertText.length - textBefore.length + sameStart(textBefore, match[0]);

        tr = textShortcut.handler(view, state, match, realFrom, Math.min(to, realFrom + match[0].length), insertText);
      }
      if (tr) {
        tr.setMeta(SHORTCUT_KEY, {
          name: textShortcut.config.name || textShortcut.name,
          transform: tr,
          from,
          to,
          text: insertText,
        });
        view.dispatch(tr);
        return true;
      }
    }
    return false;
  };
}

// This is a command that will undo a text shortcut, if applying such a rule was
// the last thing that the user did.
const undoTextShortcut = (state: EditorState, dispatch?: (transaction: Transaction) => void) => {
  const undoAble: ShortCutState = SHORTCUT_KEY.getState(state);

  if (undoAble && typeof undoAble !== 'boolean' && dispatch) {
    const tr = state.tr;
    const toUndo = undoAble.transform;
    for (let j = toUndo.steps.length - 1; j >= 0; j--) {
      tr.step(toUndo.steps[j].invert(toUndo.docs[j]));
    }
    const marks = tr.doc.resolve(undoAble.from).marks();
    dispatch(
      tr.replaceWith(undoAble.from, undoAble.to, undoAble.text ? state.schema.text(undoAble.text, marks) : undefined),
    );
    return true;
  }
  return false;
};

const getShortcutAttrs = (
  getAttrs: TextMatcherHandler | Types.StringMap<string | number> | undefined,
  view: EditorView,
  match: RegExpExecArray,
  start: number,
  end: number,
) => {
  if (!getAttrs) return {};
  if (getAttrs instanceof Function) {
    const res = getAttrs(match, start, {
      getStart: () => view.coordsAtPos(start),
      getEnd: () => view.coordsAtPos(end),
    });
    if (res === true) return {};
    return res;
  }
  return getAttrs;
};

export { getShortcutAttrs, SHORTCUT_KEY, TextShortcut, TextShortCutHandler, TextShortcutPlugin, undoTextShortcut };
