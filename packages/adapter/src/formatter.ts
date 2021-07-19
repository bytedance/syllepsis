import { Node as ProsemirrorNode, Slice } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

import { ISetHTMLOptions, SylApi } from './api';
import { Types } from './libs';
import { FORMAT_TYPE, SYL_TAG, SylPlugin } from './schema';
import { IMatcherConfig } from './schema/matchers';
/**
 * get & setHTML
 */
// check if there is an empty <p> in the last line of html in `setHTML`
const insertEmptyPTagAtTheEndOfHtml = (div: HTMLElement): void => {
  const lastChild = div.lastChild;
  if (!lastChild) return;
  if (lastChild.nodeName.toLocaleLowerCase() !== 'p' || (lastChild as HTMLElement).innerHTML !== '') {
    const blankP = document.createElement('p');
    div.appendChild(blankP);
    return;
  }
};

// remove the last `break`, and operate Node directly will cause the size to be incorrect and need to be corrected manually
const removeBrInEnd = (doc: ProsemirrorNode | Slice) => {
  const matchNodes: Array<{
    parent: ProsemirrorNode;
    topPos: number;
    topNode: ProsemirrorNode;
    pos: number;
    index: number;
    newNode: ProsemirrorNode;
  }> = [];

  let topNode: ProsemirrorNode;
  let topPos = 0;
  doc.content.nodesBetween(
    0,
    doc.content.size,
    (node: ProsemirrorNode, pos: number, _parent: ProsemirrorNode, index: number) => {
      // set the new top Node
      if (!_parent) {
        topNode = node;
        topPos = pos;
      }

      if (node.isTextblock && node.lastChild && node.lastChild.type === node.type.schema.nodes.break) {
        const parent = _parent || doc;
        const newNode = node.copy(node.content.cut(0, node.content.size - 1));
        // reverse to avoid incorrect position after modification
        matchNodes.unshift({ parent, topNode, topPos, newNode, pos, index });
        return false;
      }
    },
  );

  matchNodes.forEach(({ parent, topNode: _topNode, topPos: _topPos, newNode, pos, index }) => {
    const $pos = _topNode.resolve(pos - _topPos); // border
    parent.content = parent.content.replaceChild(index, newNode);

    parent !== doc && doc.content.size--;
    let depth = $pos.depth - 2;
    while (depth >= 0) {
      $pos.node(depth).content.size--;
      depth--;
    }
  });

  return doc;
};

// `getHTML` remove the <br> at the end
const removeEmptyTagAtEndOfHtml = (div: HTMLElement) => {
  const MARK = '<br>';
  let lastChild: ChildNode | null;
  do {
    lastChild = div.lastChild;
    if (!lastChild || (lastChild as HTMLElement).innerHTML !== MARK) break;
    lastChild.parentElement && lastChild.parentElement.removeChild(lastChild);
  } while ((lastChild as HTMLElement).innerHTML === MARK);
};

const IG_TAG = 'ignoretag';
const IG_EL = 'ignoreel';

const removeTag = (el: Element) => {
  if (el.parentNode) {
    Array.from(el.childNodes).forEach(cNode => el.parentNode!.insertBefore(cNode, el));
    el.parentNode.removeChild(el);
  }
};

const removeIgnoreTag = (div: HTMLElement) => {
  const ignoreTags = div.querySelectorAll(`*[${IG_TAG}=true]`);
  Array.from(ignoreTags)
    .reverse()
    .forEach(removeTag);
};

const removeIgnoreContent = (div: HTMLElement) => {
  const ignoreEls = div.querySelectorAll(`*[${IG_EL}=true]`);
  Array.from(ignoreEls)
    .reverse()
    .forEach(el => {
      el.parentElement!.removeChild(el);
    });
};

// when <br> after `inlineCard` is the last node, delete it
const removeBrAfterInlineCard = (div: HTMLElement) => {
  Array.from(div.querySelectorAll('syl-inline')).forEach(a => {
    if (
      a.nextElementSibling &&
      a.parentElement &&
      a.parentElement.lastChild === a.nextElementSibling &&
      a.nextElementSibling.tagName === 'BR' &&
      a.nextElementSibling.parentElement
    ) {
      a.parentElement.removeChild(a.nextElementSibling);
    }
  });
};

// merge continues <br>,<p><br></p>
const mergeContinuesEmptyLine = (node: HTMLElement) => {
  const domRemoves = [];
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_ALL, {
    acceptNode(cNode) {
      if (cNode.nodeType === 1 || cNode.nodeType === 3) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_REJECT;
    },
  });
  let prevTag = '';

  const isEmptyParagraph = (p: Element | null) => p && p.nodeName === 'P' && /^<br>+$/.test(p.innerHTML);

  const judgeMerge = (judgeNode: Node) => {
    let res = false;
    if (judgeNode.nodeName === 'BR' && prevTag === 'BR') {
      res = true;
    } else if (
      judgeNode.nodeType === 1 &&
      isEmptyParagraph(judgeNode as Element) &&
      isEmptyParagraph((judgeNode as Element).previousElementSibling)
    ) {
      res = true;
    }
    prevTag = judgeNode.nodeName;
    return res;
  };

  while (walker.nextNode()) {
    const curNode = walker.currentNode;
    if (judgeMerge(curNode)) {
      domRemoves.push(curNode);
    }
  }

  domRemoves.forEach(dom => dom.parentNode && dom.parentNode.removeChild(dom));
};

// use the content of `<templ>` to replace `SYL_TAG`
const removeShell = (root: HTMLElement) => {
  const cards = root!.querySelectorAll(`[${SYL_TAG}]`);
  [].slice.call(cards).forEach((card: HTMLElement) => {
    card.childNodes.forEach((child: any) => {
      if (child.tagName === 'TEMPL' && card.parentElement) {
        card.parentElement.replaceChild(child, card);
        removeTag(child);
      }
    });
  });

  return root.innerHTML;
};

const transformGetHTML = (html: string, sylPlugins: SylPlugin<any>[]) => {
  let res = html;
  sylPlugins.forEach(({ $controller }) => {
    if ($controller && $controller.transformGetHTML) {
      res = $controller.transformGetHTML(res);
    }
  });
  return res;
};

interface IFormatHTMLConfig {
  mergeEmpty?: boolean;
  keepLastLine?: boolean;
}

const handleDOMSpec = (dom: HTMLElement) => {
  removeIgnoreTag(dom);
  removeIgnoreContent(dom);
  return dom;
};

const formatGetHTML = (root: HTMLElement, config: IFormatHTMLConfig, sylPlugins: SylPlugin<any>[]) => {
  const div = document.createElement('div');
  const salt = String(Math.random()).substring(2, 8);
  div.hidden = true;
  div.innerHTML = root.innerHTML
    .replace(/(<[^>]*)(src=)/g, `$1data${salt}src=`)
    .replace(/(<[^>]*)(draggable=[^\s|/|>]*\s?)/g, '$1')
    .replace(/(<[^>]*)(contenteditable=[^\s|/|>]*\s?)/g, '$1');

  handleDOMSpec(div);
  removeBrAfterInlineCard(div);
  config && config.mergeEmpty && mergeContinuesEmptyLine(div);
  removeEmptyTagAtEndOfHtml(div);

  const pureHTML = (html: string) => html.replace(new RegExp(`data${salt}src=`, 'g'), 'src=');

  const resHTML = pureHTML(removeShell(div));

  return transformGetHTML(resHTML, sylPlugins);
};

const formatSetHTML = (html: string, config: IFormatHTMLConfig) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  // this replace break element with \n in codeblock
  handleDOMSpec(div);
  // used to avoid when `keepLastLine` is true, click after `setHTML` will cause emit confuse `text-change` event
  config.keepLastLine && insertEmptyPTagAtTheEndOfHtml(div);
  config.mergeEmpty && mergeContinuesEmptyLine(div);
  return div;
};

type matchRules = {
  name: string;
  matchRule: IMatcherConfig<any, any>;
}[];

interface INodeContent {
  type: string;
  attrs?: Types.StringMap<any>;
  content?: INodeContent[];
  text?: string;
  marks?: { type: string; attrs?: Types.StringMap<any> };
}

const getSplicedNode = (node: INodeContent, start: number, end: number, newNode: INodeContent) => {
  let plus = 0;
  const originText = node.text!;
  const prevText = originText.substring(0, start);
  const nextText = originText.substring(end);
  const nodes = [];
  if (prevText) {
    nodes.push({ ...node, text: prevText });
    plus++;
  }
  nodes.push(newNode);
  nextText && nodes.push({ ...node, text: nextText });
  return { nodes, plus };
};

const getMatchRules = (sylPlugins: SylPlugin<any>[]) => {
  const inlineMatchers: matchRules = [];
  const blockMatchers: matchRules = [];

  sylPlugins.forEach(({ $schemaMeta }) => {
    if ($schemaMeta && $schemaMeta.config.textMatcher) {
      if ($schemaMeta.formatType === FORMAT_TYPE.INLINE_CARD) {
        $schemaMeta.config.textMatcher
          .filter((r: IMatcherConfig) => r.inputOnly === false)
          .forEach((r: IMatcherConfig) => {
            inlineMatchers.push({ name: $schemaMeta.name, matchRule: r });
          });
      } else if ($schemaMeta.formatType === FORMAT_TYPE.BLOCK_CARD) {
        $schemaMeta.config.textMatcher
          .filter((r: IMatcherConfig) => r.inputOnly !== true)
          .forEach((r: IMatcherConfig) => {
            blockMatchers.push({ name: $schemaMeta.name, matchRule: r });
          });
      }
    }
  });

  const matchNode = (node: INodeContent, type: 'block' | 'inline' = 'block') => {
    const curMatchRules = type === 'block' ? blockMatchers : inlineMatchers;

    for (let i = 0; i < curMatchRules.length; i++) {
      const { matcher, handler } = curMatchRules[i].matchRule;
      if (!handler) continue;
      const newMatchers = new RegExp(matcher.source, matcher.flags);
      const matched = newMatchers.exec(node.text!);
      if (!matched) continue;
      const attrs = handler(matched);
      if (!attrs) continue;
      return {
        node: {
          type: curMatchRules[i].name,
          marks: node.marks,
          attrs,
        },
        matchInfo: {
          start: matched.index,
          end: matched.index + matched[0].length,
        },
      };
    }
  };

  return { matchNode, blockMatchers, inlineMatchers };
};

// special HTML is transformed into `Node` through `textMatcher` config of `Schema`
const transformCard = (docNode: ProsemirrorNode<any>, view: EditorView, sylPlugins: SylPlugin<any>[]) => {
  let doc = docNode.toJSON();

  const { matchNode, blockMatchers, inlineMatchers } = getMatchRules(sylPlugins);

  doc = {
    type: 'doc',
    content: doc.content.map((node: INodeContent) => {
      if (
        blockMatchers.length &&
        node.type === 'paragraph' &&
        node.content &&
        node.content.length === 1 &&
        node.content[0].type === 'text'
      ) {
        const res = matchNode(node.content[0]);
        if (res) return res.node;
      }

      if (inlineMatchers.length && node.content) {
        const loopContent = (_content: INodeContent[]) => {
          for (let i = 0; i < _content.length; i++) {
            const curNode = _content[i];
            if (curNode && curNode.content) {
              loopContent(curNode.content!);
            } else if (curNode.text) {
              const res = matchNode(curNode, 'inline');
              if (res) {
                const spliceNodeInfo = getSplicedNode(curNode, res.matchInfo.start, res.matchInfo.end, res.node);
                _content.splice(i, 1, ...spliceNodeInfo.nodes);
                i += spliceNodeInfo.plus;
              }
            }
          }
        };

        loopContent(node.content);
      }

      return node;
    }),
  };

  return ProsemirrorNode.fromJSON(view.state.schema, doc);
};

const parseHTML = (html: string, adapter: SylApi, config: ISetHTMLOptions) => {
  const { view, basicConfiguration } = adapter.configurator;

  const htmlNode = formatSetHTML(html, {
    ...basicConfiguration,
    ...config,
  });

  const docNode = transformCard(
    // TODO：use parseSlice instead
    adapter.domParser.parse(htmlNode, {
      preserveWhitespace:
        config.keepWhiteSpace === undefined ? basicConfiguration.keepWhiteSpace : config.keepWhiteSpace,
    }),
    view,
    adapter.configurator.getSylPlugins(),
  );

  removeBrInEnd(docNode);

  return docNode;
};

export {
  formatGetHTML,
  formatSetHTML,
  handleDOMSpec,
  IG_EL,
  IG_TAG,
  insertEmptyPTagAtTheEndOfHtml,
  parseHTML,
  removeBrInEnd,
  transformCard,
};
