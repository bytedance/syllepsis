import { Block, SylController, SylPlugin } from '@syllepsis/adapter';

interface IHeaderStructure {
  level: number;
}

const NAME = 'header';

class Header extends Block<IHeaderStructure> {
  public name = NAME;

  public tagName = (node: any) => `h${(node && node.attrs.level) || 1}`;

  public textMatcher = [
    {
      matcher: /^(#{1,6})\s$/,
      handler(match: RegExpExecArray) {
        return {
          level: match[1].length
        };
      }
    }
  ];

  public attrs = {
    level: {
      default: 1
    }
  };

  public parseDOM = [
    { tag: 'h1', attrs: { level: 1 } },
    { tag: 'h2', attrs: { level: 2 } },
    { tag: 'h3', attrs: { level: 3 } },
    { tag: 'h4', attrs: { level: 4 } },
    { tag: 'h5', attrs: { level: 5 } },
    { tag: 'h6', attrs: { level: 6 } }
  ];
}

class HeaderController extends SylController {
  public name = NAME;
  public toolbar = {
    className: 'header',
    tooltip: 'header',
    type: 'select',
    value: [
      {
        attrs: false
      },
      {
        attrs: { level: 1 }
      },
      {
        attrs: { level: 2 }
      },
      {
        attrs: { level: 3 }
      }
    ]
  };
}

class HeaderPlugin extends SylPlugin {
  public name = NAME;
  public Controller = HeaderController;
  public Schema = Header;
}

export { Header, HeaderController, HeaderPlugin };
