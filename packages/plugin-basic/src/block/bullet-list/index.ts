import { Block, SylPlugin } from '@syllepsis/adapter';

import { LIST_ITEM_NAME } from '../list-item';

const NAME = 'bullet_list';

class BulletList extends Block<any> {
  public name = NAME;

  public content = `(${LIST_ITEM_NAME}|${NAME})+`;

  public role = 'list';

  public tagName = () => 'ul';

  public parseDOM = [
    {
      tag: 'ul',
    },
  ];

  public textMatcher = [
    {
      matcher: [/^-\s$/, /^\*\s$/],
    },
  ];
}

class BulletListPlugin extends SylPlugin {
  public name = NAME;
  public Schema = BulletList;
}

export { BulletList, BulletListPlugin };
