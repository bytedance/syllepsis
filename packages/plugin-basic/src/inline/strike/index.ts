import { Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';

import { checkMarkDisable, keymapToggleMark } from '../../utils';

const STRIKE_PATTERN = /line-through/i;
const NAME = 'strike';

const toggleStrike = keymapToggleMark(NAME);

const getAttrs = (value: string) => {
  if (STRIKE_PATTERN.test(value)) {
    return true;
  }
  return false;
};
class Strike extends Inline<any> {
  public name = NAME;
  public tagName = () => 's';

  public textMatcher = [
    {
      matcher: /~~([^~]+)~~\s$/,
    },
  ];

  public parseDOM = [
    { tag: 's', priority: 25 },
    { tag: 'strike', priority: 25 },
    { tag: 'del', priority: 25 },
    {
      style: 'text-decoration-line',
      getAttrs,
    },
  ];
}

class StrikeController extends SylController {
  public name = NAME;
  public keymap = {
    'Mod-d': toggleStrike,
    'Mod-D': toggleStrike,
  };
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, NAME);
}

class StrikePlugin extends SylPlugin {
  public name = NAME;
  public Controller = StrikeController;
  public Schema = Strike;
}

export { Strike, StrikeController, StrikePlugin };
