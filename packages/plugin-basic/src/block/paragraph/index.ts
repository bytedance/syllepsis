import { getTypesetDOMStyle, Paragraph as BaseParagraph, SylApi, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node as ProseMirrorNode } from 'prosemirror-model';

import {
  addAttrsByConfig,
  constructTypesetParseDOM,
  getFromDOMByConfig,
  ITypesetProps,
  IUserAttrsConfig,
  setDOMAttrByConfig,
} from '../../utils';

interface IParagraphProps extends ITypesetProps {
  addMatchTags?: string[];
  canMatch?: (dom: HTMLElement) => boolean;
  allowedClass?: string[];
  addAttributes?: IUserAttrsConfig;
}

class Paragraph extends BaseParagraph {
  // because the attrs can be set render or not by props, here keep the default toDOMAttrs
  public toDOMAttrs = {};
  public formatAttrs: ReturnType<typeof constructTypesetParseDOM>['formatAttrs'] = v => v;
  public defaultFontSize = 16;
  public editor: SylApi;

  constructor(editor: SylApi, props: IParagraphProps) {
    super(editor, props);
    this.editor = editor;
    if (props) {
      this.constructParseDOM(props);
      addAttrsByConfig(this.props.addAttributes, this);
      this.constructParseDOM(this.props);
    }
  }

  public constructParseDOM = (config: IParagraphProps) => {
    const { defaultFontSize, formatAttrs, defaultAttrs } = constructTypesetParseDOM(config);

    this.toDOMAttrs = { ...this.attrs, ...defaultAttrs };
    // TODO other non-built-in node handling
    let hasInlineImage = false;
    setTimeout(() => (hasInlineImage = this.editor.view.state.schema.nodes.image?.isInline));
    this.canMatch = config.canMatch || ((dom: HTMLElement) => (hasInlineImage ? true : !/<img/.test(dom.innerHTML!)));

    this.defaultFontSize = defaultFontSize;
    this.formatAttrs = (attrs, dom) => {
      const formattedAttrs = formatAttrs(attrs);
      dom && getFromDOMByConfig(this.props.addAttributes, dom, formattedAttrs);
      return formattedAttrs;
    };
    if (config.addMatchTags) {
      const parseRule = this.parseDOM[0];
      config.addMatchTags.forEach(tagName => this.parseDOM.push({ ...parseRule, tag: tagName }));
    }
  };

  public toDOM = (node: ProseMirrorNode) => {
    const attrs: { style?: string; class?: string } = {};
    const nodeAttrs = { ...node.attrs };
    const { addAttributes } = this.props;
    const style = getTypesetDOMStyle(this.formatAttrs(nodeAttrs), this.toDOMAttrs);
    if (style) attrs.style = style;
    const extraAttrs: { class?: string } = {};
    if (nodeAttrs.class) extraAttrs.class = nodeAttrs.class;

    setDOMAttrByConfig(addAttributes, node, Object.assign(attrs, extraAttrs));

    return ['p', attrs, 0] as DOMOutputSpec;
  };
}

class ParagraphPlugin extends SylPlugin<IParagraphProps> {
  public name = 'paragraph';
  public Schema = Paragraph;
}

export { Paragraph, ParagraphPlugin };
