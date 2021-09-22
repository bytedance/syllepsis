import { Block, getTypesetDOMStyle, parseTypesetStyle, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpecArray, Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import {
  addAttrsByConfig,
  constructTypesetParseDOM,
  getFromDOMByConfig,
  ITypesetProps,
  IUserAttrsConfig,
  setDOMAttrByConfig,
} from '../../utils';
import {
  checkAndMergeList,
  checkOutMaxNestedLevel,
  filterKeymap,
  liftListItem,
  liftListItemAtHead,
  sinkListItem,
  splitListItemKeepMarks,
} from './utils';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    list_item?: {
      getMaxNestedLevel: () => number;
      setMaxNestedLevel: (level: number) => void;
      liftItem: () => void;
      sinkItem: () => void;
    };
  }
}

interface IListItemProps extends Omit<ITypesetProps, 'allowedLineIndents'> {
  matchInnerTags?: string[];
  addAttributes?: IUserAttrsConfig;
  maxNestedLevel?: number;
}

interface IListItemAttrs {
  align: string;
  spaceBefore: number | string;
  spaceAfter: number | string;
  spaceBoth: number | string;
  lineHeight: number | string;
}

const NAME = 'list_item';

class ListItem extends Block<IListItemAttrs> {
  public formatAttrs: ReturnType<typeof constructTypesetParseDOM>['formatAttrs'] = v => v;
  public defaultFontSize = 16;
  public toDOMAttrs = {};

  constructor(editor: SylApi, props: IListItemProps) {
    super(editor, props);
    if (props) {
      addAttrsByConfig(props.addAttributes, this);
      this.constructParseDOM(props);
    }
  }

  public constructParseDOM(config: IListItemProps) {
    const { defaultFontSize, formatAttrs, defaultAttrs } = constructTypesetParseDOM(config);
    this.toDOMAttrs = { ...this.attrs, ...defaultAttrs };

    const parseRule = this.parseDOM[0];
    this.defaultFontSize = +defaultFontSize || 16;
    this.formatAttrs = (attrs, dom) => {
      const formattedAttrs = formatAttrs(attrs, dom);
      dom && getFromDOMByConfig(config.addAttributes, dom, formattedAttrs);
      return formattedAttrs;
    };

    if (config.matchInnerTags) {
      config.matchInnerTags.forEach(tagName => {
        this.parseDOM.push({
          ...parseRule,
          tag: tagName,
          priority: 30,
          getAttrs: (dom: HTMLElement) => {
            let parentElement = dom.parentElement;
            let style = dom.getAttribute('style') || '';
            let matchList = false;

            while (parentElement) {
              style = parentElement.getAttribute('style') || '' + style;
              if (parentElement.tagName.toUpperCase() === 'LI') {
                matchList = true;
                break;
              }
              parentElement = parentElement.parentElement;
            }

            if (!matchList) return false;
            dom.setAttribute('style', style);

            return parseRule.getAttrs(dom);
          },
        });
      });
    }
  }

  public name = NAME;

  public tagName = () => 'li';

  public attrs = {
    align: {
      default: 'left',
    },
    spaceBefore: {
      default: '',
    },
    spaceAfter: {
      default: '',
    },
    spaceBoth: {
      default: '',
    },
    lineHeight: {
      default: '',
    },
  };

  public inline = false;

  public defining = true;

  public parseDOM = [
    {
      tag: 'li',
      priority: 25,
      getAttrs: (dom: HTMLElement) => {
        if (dom.tagName.toUpperCase() === 'LI' && this.props.matchInnerTags && this.props.matchInnerTags.length) {
          const childNode = dom.querySelector(this.props.matchInnerTags.join(','));
          if (childNode) return false;
        }
        const style = dom.getAttribute('style') || '';
        return this.formatAttrs(parseTypesetStyle(style, undefined, this.defaultFontSize), dom);
      },
    },
  ];

  public toDOM = (node: ProseMirrorNode) => {
    const attrs: { style?: string } = {};
    const nodeAttrs = { ...node.attrs };
    const style = getTypesetDOMStyle(this.formatAttrs(nodeAttrs), this.toDOMAttrs);
    style && (attrs.style = style);
    const { align } = nodeAttrs;
    if (align && !'left justify'.includes(align)) {
      attrs.style = `${style}list-style-position: inside;`;
    }
    setDOMAttrByConfig(this.props.addAttributes, node, attrs);

    return ['li', attrs, 0] as DOMOutputSpecArray;
  };
}

class ListItemController extends SylController<IListItemProps> {
  public name = NAME;

  public command = {
    getMaxNestedLevel: () => this.props.maxNestedLevel,
    setMaxNestedLevel: (editor: SylApi, level: number) => (this.props.maxNestedLevel = level),
    liftItem: (editor: SylApi) => liftListItem(editor.view.state, editor.view.dispatch),
    sinkItem: (editor: SylApi) => sinkListItem(editor.view.state, editor.view.dispatch),
  };

  public keymap = {
    Enter: filterKeymap(splitListItemKeepMarks),
    'Shift-Tab': filterKeymap(liftListItem),
    Tab: (editor: SylApi, state: EditorState, dispatch: EditorView['dispatch']) =>
      sinkListItem(state, dispatch, () => checkOutMaxNestedLevel(state, this.props.maxNestedLevel)),
    Backspace: filterKeymap(liftListItemAtHead),
  };

  public appendTransaction = (tr: Transaction) => {
    const isMerged = checkAndMergeList(tr, tr.selection.$from.after(1));
    if (isMerged) return tr;
  };
}

class ListItemPlugin extends SylPlugin<IListItemProps> {
  public name = NAME;
  public Controller = ListItemController;
  public Schema = ListItem;
}

export { NAME as LIST_ITEM_NAME, ListItem, ListItemController, ListItemPlugin };
