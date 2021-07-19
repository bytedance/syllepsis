import { Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';

import { checkMarkDisable } from '../../utils';

const NAME = 'sub';

class Sub extends Inline<any> {
  public name = NAME;
  public tagName = () => 'sub';
  public excludes = 'sup';

  public parseDOM = [{ tag: 'sub', priority: 25 }];
}

class SubController extends SylController {
  public name = NAME;
  public toolbar = {
    className: 'sub',
    tooltip: 'sub'
  };
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, NAME);
}

class SubPlugin extends SylPlugin {
  public name = NAME;
  public Controller = SubController;
  public Schema = Sub;
}

export { Sub, SubController, SubPlugin };
