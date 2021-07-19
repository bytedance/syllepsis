import 'codemirror/lib/codemirror.css';

import CodeMirror from 'codemirror';
import { NodeType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

const createSylCardDOM = () => {
  const div = document.createElement('div');
  div.setAttribute('__syl_tag', 'true');
  div.setAttribute('contenteditable', 'false');
  div.setAttribute('draggable', 'true');
  div.innerHTML = '<templ style="display: none"></templ><mask></mask>';
  return div;
};

const fixCodeString = (code: string) =>
  code
    .replace(/&nbsp;/g, ' ')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const DEFAULT_LANGUAGE = 'javascript';

const transformToShow = (iLanguage: string) => {
  let language = iLanguage
    .split(/[-,]/)
    .filter(Boolean)
    .join('');

  if (language === 'js') {
    language = 'javascript';
  }

  return language;
};

const removeEmptyCodeBlock = (view: EditorView, code: CodeMirror.Editor) => {
  const { state, dispatch } = view;
  const selection = state.selection;

  if (code.getValue().trim() || !selection.empty || selection.$from !== selection.$to) {
    return false;
  }

  const $pos = selection.$from;
  const parent = $pos.node();

  // confirm that pos is at the start of code_block
  if ($pos.start() !== $pos.pos || !parent.type.spec.code) {
    return false;
  }

  const type: NodeType =
    !$pos.node(-1) && $pos.node(-1) !== state.schema.nodes.doc ? $pos.node(-1).type : state.schema.nodes.paragraph;

  const tr = state.tr.setNodeMarkup($pos.before(), type);
  dispatch(tr);
  return true;
};

export { createSylCardDOM, DEFAULT_LANGUAGE, fixCodeString, removeEmptyCodeBlock, transformToShow };
