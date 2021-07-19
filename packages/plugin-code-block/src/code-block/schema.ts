import { Block, SylApi } from '@syllepsis/adapter';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { DEFAULT_LANGUAGE, transformToShow } from './utils';
import { CodeBlockView } from './view';

type Dir = 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward';

// insert break after <code>
const formatCodeDOMStructure = (dom: HTMLElement) => {
  const codeTags = Array.prototype.slice.call(dom.querySelectorAll('code'));
  const spans = Array.prototype.slice.call(dom.querySelectorAll('span'));
  codeTags.forEach((code: HTMLElement, idx: number) => {
    if (idx === codeTags.length - 1) return;
    code.appendChild(document.createElement('br'));
  });
  spans.forEach((span: HTMLSpanElement) => {
    if (/\u200B/.test(span.innerText)) {
      span.innerText = span.innerText.replace(/\u200B/g, '');
    }
  });
};

const arrowHandler = (dir: Dir) => (
  editor: SylApi,
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  view: EditorView,
) => {
  if (state.selection.empty && view.endOfTextblock(dir)) {
    const side = dir === 'left' || dir === 'up' ? -1 : 1;
    const $head = state.selection.$head;
    const nextPos = Selection.near(state.doc.resolve(side > 0 ? $head.after() : $head.before()), side);
    if (nextPos.$head && nextPos.$head.parent.type.name === 'code_block') {
      dispatch(state.tr.setSelection(nextPos));
      return true;
    }
  }
  return false;
};

class CodeBlock extends Block<any> {
  public name = 'code_block';
  public tagName = () => 'pre';
  public code = true;
  public notLastLine = true;
  public marks = '';
  public attrs = {
    language: {
      default: DEFAULT_LANGUAGE,
    },
  };

  public textMatcher = [
    {
      matcher: /^```([^\s]*)\s$/,
      handler(match: RegExpExecArray) {
        return {
          language: transformToShow(match[1]),
        };
      },
    },
    {
      matcher: /^```([^\s]*)$/,
      timing: 'enter',
      handler(match: RegExpExecArray) {
        return {
          language: transformToShow(match[1]),
        };
      },
    },
  ];

  public content = 'text*';

  public parseDOM = [
    {
      tag: 'pre',
      preserveWhitespace: 'full' as const,
      getAttrs: (dom: HTMLPreElement) => {
        const parentElement = dom.parentElement;
        if (!parentElement || !parentElement.classList.contains('code-snippet__js')) {
          formatCodeDOMStructure(dom);
        }
        if (dom.querySelector('.ace-line')) {
          // docs(ace-editor) remove the useless last <br>
          const lastBr = Array.prototype.slice.call(dom.querySelectorAll('br')).pop();
          if (lastBr && lastBr.parentElement) {
            lastBr.parentElement.removeChild(lastBr);
          }
        }
        // jianshu remove the useless last line
        const lineDOM = dom.querySelector('.line-numbers-rows');
        if (
          lineDOM &&
          lineDOM.previousSibling &&
          lineDOM.previousSibling.textContent === '\n' &&
          lineDOM.parentElement
        ) {
          lineDOM.parentElement.removeChild(lineDOM.previousSibling);
        }
        return getAttrs(dom);
      },
    },
    {
      tag: 'div.CodeMirror',
      preserveWhitespace: 'full' as const,
      getAttrs: (dom: HTMLElement) => {
        // CodeMirror structure <div><pre></pre></div>, .CodeMirror-linenumber for line number，pre for single line
        const preTags = Array.prototype.slice.call(dom.querySelectorAll('pre'));
        const orderDOMs = Array.prototype.slice.call(dom.querySelectorAll('.CodeMirror-linenumber'));
        preTags.forEach((pre: HTMLPreElement, idx) => {
          if (idx === preTags.length - 1) return;
          pre.appendChild(document.createTextNode('br'));
        });
        orderDOMs.forEach((_dom: HTMLElement) => {
          if (_dom.parentElement) {
            _dom.parentElement.removeChild(_dom);
          }
        });
        return getAttrs(dom);
      },
    },
    {
      tag: 'p[code_block]',
      preserveWhitespace: 'full' as const,
      getAttrs,
    },
    {
      tag: 'section.code-snippet__js',
      preserveWhitespace: 'full' as const,
      getAttrs: (dom: HTMLElement) => {
        // wechat code_block structure <section><ul></ul><pre><code></code></pre></section>, <ul> for line number，<code> for single row
        const preDOM = dom.querySelector('pre');
        if (!preDOM) return false;
        const orderDOM = dom.querySelector('ul');
        if (orderDOM) dom.removeChild(orderDOM);
        formatCodeDOMStructure(dom);
        return getAttrs(preDOM);
      },
    },
  ];

  public defining = true;

  static keymap = {
    ArrowLeft: arrowHandler('left'),
    ArrowRight: arrowHandler('right'),
    ArrowUp: arrowHandler('up'),
    ArrowDown: arrowHandler('down'),
  };

  public NodeView = CodeBlockView;

  public toDOM = (node: ProseMirrorNode) =>
    ['pre', { language: node.attrs.language, code_block: true }, ['code', 0]] as any;
}

function getAttrs(dom: HTMLElement) {
  let language = dom.getAttribute('language');

  if (!language) {
    const wrapper = dom.querySelector('[language]') as HTMLElement;
    language = (wrapper && wrapper.getAttribute('language')) || DEFAULT_LANGUAGE;
  }

  return {
    language: transformToShow(language),
  };
}

export { CodeBlock };
