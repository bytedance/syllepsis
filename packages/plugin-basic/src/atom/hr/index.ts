import { BlockAtom, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';

const NAME = 'hr';

class Hr extends BlockAtom<any> {
  public name = NAME;
  public tagName = () => 'hr';
  public parseDOM = [{ tag: 'hr', getAttrs: () => true }];
  public textMatcher = [{ matcher: [/^---\s$/, /^\*\*\*\s$/] }];
}

class HrController extends SylController {
  public name = NAME;
  public toolbar = {
    className: 'hr',
    tooltip: 'hr',
    handler: (editor: SylApi) => editor.insertCard('hr'),
  };
}

class HrPlugin extends SylPlugin {
  public name = NAME;
  public Controller = HrController;
  public Schema = Hr;
}

export { Hr, HrController, HrPlugin };
