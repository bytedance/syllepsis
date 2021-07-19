import { Inline, SylPlugin } from '../../../packages/adapter/dist/es';
import { DOMOutputSpec } from 'prosemirror-model';

class IgnoreTag extends Inline<any> {
  public name = 'ignore_tag';

  public tagName = () => 'span';

  public parseDOM = [{ tag: 'span.ignoreTag', attrs: { ignoretag: true } }];

  public toDOM = () => ['span', { ignoretag: 'true' }, 0] as DOMOutputSpec;
}
class IgnoreTagPlugin extends SylPlugin<any> {
  public name = 'ignore_tag';
  public Schema = IgnoreTag;
}

export { IgnoreTagPlugin };
