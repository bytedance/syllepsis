import { Block, SylPlugin } from '../../../packages/adapter/dist/es';
import { DOMOutputSpec } from 'prosemirror-model';

class IgnoreItem extends Block<any> {
  public name = 'ignore';

  public tagName = () => 'div';

  public parseDOM = [{ tag: 'div.ignore', attrs: { ignoreel: 'true' } }];

  public toDOM = () => ['div', { ignoreel: 'true' }, 0] as DOMOutputSpec;
}

class IgnorePlugin extends SylPlugin<any> {
  public name = 'ignore';
  public Schema = IgnoreItem;
}

export { IgnorePlugin };
