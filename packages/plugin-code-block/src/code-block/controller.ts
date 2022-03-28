import { SylApi, SylController } from '@syllepsis/adapter';
import { EditorConfiguration } from 'codemirror';
import { Node } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';

import { ICodeBlockProps, PLUGIN_NAME, setConfig } from './config';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    code_block?: {
      setCodeBlock: (mode?: string) => void;
      clearCodeBlock: () => void;
    };
  }
}

const WRAP = String.fromCharCode(10);

const setCodeBlock = (editor: SylApi, language?: EditorConfiguration['mode']) => {
  const { state, dispatch } = editor.view;
  const { schema, selection, doc } = state;
  const { from, to, $from } = selection;
  const selectTextLen = doc.textBetween(from, to, WRAP).length;

  let tr = state.tr;
  let codeText = '';
  let start: number | undefined;
  let end: number | undefined;

  doc.nodesBetween(from, to, (node, pos) => {
    if (node.isTextblock) {
      if (start === undefined) {
        start = pos;
      }
      end = pos + node.nodeSize;
      node.content.forEach(child => {
        if (child.isText) codeText += child.textContent;
        if (child.type.name === 'break') codeText += WRAP;
      });
      codeText += WRAP;
      return false;
    }
  });

  codeText = codeText.substring(0, codeText.length - 1);
  if (start === undefined || end === undefined) return;

  const newCode = schema.nodes.code_block.create(
    language ? { language } : undefined,
    codeText ? schema.text(codeText) : undefined,
  );

  const $start = editor.view.state.doc.resolve(start);
  const $end = editor.view.state.doc.resolve(end);

  let newFrom = from;
  // if neither at top nor first node, fix from
  if ($start.depth && $start.indexAfter()) {
    newFrom += $start.depth;
  } else {
    newFrom -= $from.depth - 1;
  }

  // nested node needs to contain it's parent
  if ($start.depth && !$start.indexAfter()) {
    start = $start.pos - $start.depth;
  }
  if ($end.depth && $end.indexAfter() === $end.parent.childCount) {
    end = $end.pos + $end.depth;
  }

  tr = tr.replaceRangeWith(start, end, newCode);
  dispatch(tr.setSelection(TextSelection.create(tr.doc, newFrom, newFrom + selectTextLen)));
  editor.focus();
};

const clearCodeBlock = (editor: SylApi) => {
  const { dispatch, state } = editor.view;
  const { schema, tr, selection } = state;
  const { $from, $to } = selection;
  const node = $from.node();
  const nodePos = $from.before();
  const textContents = node.textContent.split(WRAP);
  const fragments = textContents.reduce((res, text) => {
    if (text) {
      res.push(schema.text(text));
    }
    res.push(schema.nodes.break.create());
    return res;
  }, [] as Node[]);
  fragments.pop();
  dispatch(
    tr
      .replaceRangeWith(nodePos, nodePos + node.nodeSize, schema.nodes.paragraph.create(undefined, fragments))
      .setSelection(TextSelection.create(tr.doc, $from.pos, $to.pos)),
  );
  editor.focus();
};

class CodeBlockController extends SylController<ICodeBlockProps> {
  public name = PLUGIN_NAME;
  public toolbar = {
    className: PLUGIN_NAME,
    tooltip: PLUGIN_NAME,
    handler: (editor: SylApi) => {
      const { $from } = editor.view.state.selection;
      if ($from.parent.type.name === PLUGIN_NAME) {
        this.command.clearCodeBlock(editor);
      } else {
        this.command.setCodeBlock(editor, this.props.mode);
      }
    },
  };

  public command = {
    setCodeBlock: (editor: SylApi, mode?: EditorConfiguration['mode']) => {
      setCodeBlock(editor, mode || this.props.mode);
      this.props.afterInsert && this.props.afterInsert(editor);
    },
    clearCodeBlock: (editor: SylApi) => {
      clearCodeBlock(editor);
    },
  };

  public keymap = {
    Backspace: (editor: SylApi, state: SylApi['view']['state'], dispatch: SylApi['view']['dispatch']) => {
      const { $from, empty } = state.selection;
      if (!empty || $from.nodeBefore) return false;
      const beforePos = $from.before();
      const prevNode = state.doc.resolve(beforePos).nodeBefore;
      if (!prevNode || prevNode.type.name !== PLUGIN_NAME || prevNode.childCount) return false;
      dispatch(state.tr.join(beforePos));
      return true;
    },
  };

  constructor(editor: SylApi, props: ICodeBlockProps) {
    super(editor, props);
    setConfig(props);
  }
}

export { CodeBlockController };
