import { DOMOutputSpec, Node as ProseMirrorNode } from 'prosemirror-model';

import { getTypesetDOMStyle, parseTypesetStyle, Types } from '../libs';
import { FORMAT_TYPE } from './const';
import { updateSchema } from './normalize';
import { Block, Formattable, SchemaMeta, SylSchema } from './schema';

interface IParagraphAttrs {
  align: string;
  class: string;
  lineIndent: string | number;
  spaceBefore: string | number;
  spaceBoth: string | number;
  lineHeight: string | number;
}

// a root type of editor
class Doc extends SylSchema<never> {
  public name = 'doc';
  public content = 'block+';
}

class Paragraph extends Block<IParagraphAttrs> {
  public name = 'paragraph';
  public defining = false;

  public defaultFontSize = 16;
  public canMatch = (dom: HTMLParagraphElement) => true;
  public formatAttrs = (v: Types.StringMap<any>, dom: HTMLElement) => v;

  public attrs = {
    align: {
      default: '',
    },
    class: {
      default: '',
    },
    lineIndent: {
      default: '',
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

  public parseDOM = [
    {
      tag: 'p',
      priority: 20,
      getAttrs: (dom: HTMLParagraphElement): any => {
        if (!this.canMatch(dom)) return false;

        const style = dom.getAttribute('style') || '';
        return this.formatAttrs(
          {
            ...parseTypesetStyle(style, undefined, this.defaultFontSize),
            class: dom.className,
          },
          dom,
        );
      },
    },
  ];

  public toDOM = (node: ProseMirrorNode) => {
    const attrs: { style?: string; class?: string } = {};
    const style = getTypesetDOMStyle(node.attrs, this.attrs);
    if (style) attrs.style = style;
    if (node.attrs.class) attrs.class = node.attrs.class;
    return ['p', attrs, 0] as DOMOutputSpec;
  };
}

class Text extends SylSchema<never> {
  public name = 'text';
  public group = 'inline';
}

class Break extends Formattable<never> {
  public group = 'inline';
  public inline = true;
  public name = 'break';
  public selectable = false;
  public content = undefined;
  public parseDOM = [{ tag: 'br' }];
  public toDOM = () => ['br'] as DOMOutputSpec;
}

const basicSchema = updateSchema(
  {
    nodes: {},
    marks: {},
  },
  [
    new SchemaMeta(FORMAT_TYPE.BLOCK, 'doc', new Doc()),
    new SchemaMeta(FORMAT_TYPE.BLOCK, 'paragraph', new Paragraph()),
    new SchemaMeta(FORMAT_TYPE.ATOM, 'text', new Text()),
    new SchemaMeta(FORMAT_TYPE.ATOM, 'break', new Break()),
  ],
);

export { basicSchema, Break, Doc, Paragraph, Text };
