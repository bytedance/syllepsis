import { Card, SylController, SylPlugin, SylApi } from '../../../packages/adapter/dist/es';
import { TestBlockCardView } from '../card-view';

interface IProps {
  id?: string;
}

const CardView = (props: IProps = {}) => {
  if (props.id) {
    return `<div id="${props.id}">Card</div>`;
  }
  return '<div>Card</div>';
};

const test = () => 'card';

class CardSchema extends Card<any> {
  public NodeView = TestBlockCardView;
  public tagName = () => 'div';
  public name = 'card';
  public attrs = {
    id: {
      default: '',
    },
  };
  public textMatcher = [
    {
      matcher: /{-- Card --}/,
      handler() {
        return { id: '' };
      },
    },
    {
      matcher: /{-- CardSkip --}/,
      handler() {
        return null;
      },
    },
  ];
  public parseDOM = [];
  public props = {
    handleClickOn: (editor: SylApi) => false,
    transformPastedHTML: (editor: SylApi, html: string) => html,
  };
  public ViewMap = {
    template: ({ attrs }: any) => CardView(attrs),
  };
}

class CardController extends SylController<any> {
  public name = 'card';

  public command = {
    test,
  };

  public keymap = {
    'Ctrl-i': (editor: any) => {
      editor.setHTML('keymap');
      return true;
    },
  };

  public eventHandler = {
    handleTripleClick: (editor: any) => {
      editor.setHTML('handleTripleClickOn');
      return true;
    },

    handleDOMEvents: {
      mouseup: () => false,
    },

    transformPastedHTML: (editor: SylApi, html: string) => html,
  };

  public transformGetHTML = (html: string) => html.replace(/transformGetHTML/g, '');

  public appendTransaction = (tr: any) => {
    if (tr.doc.textContent === 'appendTransaction') {
      return tr.insertText('appendedTransaction', 0, 18);
    }
  };
}

class CardPlugin extends SylPlugin<any> {
  public name = 'card';

  public Controller = CardController;

  public Schema = CardSchema;
}

export { CardPlugin };
