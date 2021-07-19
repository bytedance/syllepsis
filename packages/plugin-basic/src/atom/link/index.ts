import { InlineAtom, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node } from 'prosemirror-model';

const NAME = 'link';
interface ILinkProps {
  validateHref: (value: string) => { error: boolean; text?: string; href?: string };
}
interface ILinkAttrs {
  text: string;
  href: string;
}

class LinkController extends SylController<ILinkProps> {
  public name = NAME;

  public validateHref = (value: string) => ({ error: false });

  public toolbar = {
    handler: (editor: SylApi) => {},
  };
  public insert = (attrs: any) => {
    this.editor.insertCard(NAME, attrs);
  };

  constructor(editor: SylApi, props: ILinkProps) {
    super(editor, props);
    this.validateHref = props.validateHref;
  }
}

class Link extends InlineAtom<ILinkAttrs> {
  public name = NAME;
  public tagName = () => 'a';
  public attrs = {
    href: {
      default: '',
    },
    text: {
      default: '',
    },
  };
  public getText = true;
  public textMatcher = [
    {
      matcher: /\[(.*)\]\((.*)\)\s/,
      handler(match: string[]) {
        return {
          text: match[1],
          href: match[2],
        };
      },
    },
  ];
  public parseDOM = [
    {
      tag: 'a[href]',
      getAttrs(dom: HTMLAnchorElement): any {
        if (!dom.textContent && !dom.getAttribute('text')) {
          return false;
        }
        // solve the problem of copying itself
        const text = dom.textContent || dom.getAttribute('text') || '';
        return {
          href: dom.getAttribute('href'),
          text,
        };
      },
    },
  ];
  toDOM = (node: Node) => ['a', { href: node.attrs.href }, node.attrs.text] as DOMOutputSpec;
}

class LinkPlugin extends SylPlugin<ILinkProps> {
  public name = NAME;
  public Controller = LinkController;
  public Schema = Link;
}

export { ILinkProps, Link, LinkController, LinkPlugin };
