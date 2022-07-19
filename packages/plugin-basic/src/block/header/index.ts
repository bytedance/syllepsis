import { Block, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { Node as ProseMirrorNode } from 'prosemirror-model';

import { addAttrsByConfig, getFromDOMByConfig, IUserAttrsConfig, setDOMAttrByConfig } from '../../utils';

interface IHeaderProps {
  addAttributes?: IUserAttrsConfig;
}
interface IHeaderStructure {
  level: number;
}

const NAME = 'header';

class Header extends Block<IHeaderStructure> {
  public name = NAME;

  public tagName = (node: any) => `h${(node && node.attrs.level) || 1}`;

  public parseFromDOM = (dom: HTMLElement) => {
    const level = dom.tagName.match(/\d/);
    if (!level) return false;
    const attrs = { level: +level[0] };
    getFromDOMByConfig(this.props.addAttributes, dom, attrs);
    return attrs;
  };

  constructor(editor: SylApi, props: IHeaderProps) {
    super(editor, props);
    if (props.addAttributes) {
      addAttrsByConfig(props.addAttributes, this);
    }
  }

  public textMatcher = [
    {
      matcher: /^(#{1,6})\s$/,
      handler(match: RegExpExecArray) {
        return {
          level: match[1].length,
        };
      },
    },
  ];

  public attrs = {
    level: {
      default: 1,
    },
  };

  public parseDOM = [
    { tag: 'h1', getAttrs: this.parseFromDOM },
    { tag: 'h2', getAttrs: this.parseFromDOM },
    { tag: 'h3', getAttrs: this.parseFromDOM },
    { tag: 'h4', getAttrs: this.parseFromDOM },
    { tag: 'h5', getAttrs: this.parseFromDOM },
    { tag: 'h6', getAttrs: this.parseFromDOM },
  ];

  public toDOM = (node: ProseMirrorNode) => {
    const attrs = { ...node.attrs };
    setDOMAttrByConfig(this.props.addAttributes, node, attrs);
    return [`h${attrs.level}`, attrs, 0] as const;
  };
}

class HeaderController extends SylController {
  public name = NAME;
  public toolbar = {
    className: 'header',
    tooltip: 'header',
    type: 'select',
    value: [
      {
        attrs: false,
      },
      {
        attrs: { level: 1 },
      },
      {
        attrs: { level: 2 },
      },
      {
        attrs: { level: 3 },
      },
    ],
  };
}

class HeaderPlugin extends SylPlugin<IHeaderProps> {
  public name = NAME;
  public Controller = HeaderController;
  public Schema = Header;
}

export { Header, HeaderController, HeaderPlugin };
