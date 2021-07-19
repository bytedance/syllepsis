import { Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';

import { checkMarkDisable } from '../../utils';

const NAME = 'sup';
class Sup extends Inline<any> {
  public name = NAME;
  public tagName = () => 'sup';
  public excludes = 'sub';

  public parseDOM = [{ tag: 'sup', priority: 25 }];
}

class SupController extends SylController {
  public name = NAME;
  public toolbar = {
    className: 'sup',
    tooltip: 'sup'
  };
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, NAME);
}

class SupPlugin extends SylPlugin {
  public name = NAME;
  public Controller = SupController;
  public Schema = Sup;
}

export { Sup, SupController, SupPlugin };
