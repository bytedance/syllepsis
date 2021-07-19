import { InlineCard, SylPlugin, SylApi } from '../../../packages/adapter/dist/es';
import { TestInlineCardView } from '../card-view';

const InlineCardView = '<a>inline_card</a>';

class CardSchema extends InlineCard<any> {
  public NodeView = TestInlineCardView;

  public tagName = () => 'a';
  public name = 'inline_card';
  public fixCursor = true;
  public attrs = {
    text: {
      default: ''
    }
  };
  public excludeMarks = 'bold';
  public textMatcher = [
    {
      matcher: /{ inline_card }\s/,
      inputOnly: false,
      handler() {
        return {
          text: ''
        };
      }
    }
  ];
  public parseDOM = [
    {
      tag: 'a.inline-card',
      getAttrs(dom: HTMLElement) {
        return {
          text: dom.innerText
        };
      }
    }
  ];
  public props = {
    transformPastedHTML: (editor: SylApi, html: string) => html
  };

  public ViewMap = {
    template: () => InlineCardView
  };
}

class InlineCardPlugin extends SylPlugin<any> {
  public name = 'inline_card';
  public Schema = CardSchema;
}

export { InlineCardPlugin };
