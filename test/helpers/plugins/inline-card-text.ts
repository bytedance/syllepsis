import { InlineCard, SylPlugin, SylApi } from '../../../packages/adapter/dist/es';
import { TestInlineCardView } from '../card-view';

const InlineCardView = '<a>inline_card_text</a>';

class CardSchema extends InlineCard<any> {
  public NodeView = TestInlineCardView;

  public tagName = () => 'a';
  public name = 'inline_card_text';
  public attrs = {
    text: {
      default: ''
    }
  };
  // @ts-ignore
  public getText = true;
  public excludeMarks = '_';
  public parseDOM = [
    {
      tag: 'a.inline-card-text',
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

class InlineCardTextPlugin extends SylPlugin<any> {
  public name = 'inline_card_text';

  public Schema = CardSchema;
}

export { InlineCardTextPlugin };
