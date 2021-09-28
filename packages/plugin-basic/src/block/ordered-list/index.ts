import { Block, SylController, SylPlugin } from '@syllepsis/adapter';

import { LIST_ITEM_NAME } from '../list-item';

const NAME = 'ordered_list';

interface IOrderedListAttrs {
  start: number;
}

class OrderedList extends Block<IOrderedListAttrs> {
  public name = NAME;

  public role = 'list';

  public content = `(${LIST_ITEM_NAME}|${NAME})+`;

  public tagName = () => 'ol';

  public attrs = {
    start: {
      default: 1,
    },
  };

  public textMatcher = [
    {
      matcher: /^(\d+)\.\s$/,
      handler(match: RegExpExecArray) {
        return {
          start: match[1],
        };
      },
    },
  ];

  public parseDOM = [
    {
      tag: 'ol',
      getAttrs(dom: HTMLOListElement) {
        return {
          start: dom.hasAttribute('start') ? +dom.getAttribute('start')! : 1,
        };
      },
    },
  ];
}

class OrderedListController extends SylController {
  public name = NAME;
  public toolbar = {
    className: 'ordered_list',
    tooltip: 'ordered_list',
  };
}

class OrderedListPlugin extends SylPlugin {
  public name = NAME;
  public Controller = OrderedListController;
  public Schema = OrderedList;
}

export { OrderedList, OrderedListController, OrderedListPlugin };
