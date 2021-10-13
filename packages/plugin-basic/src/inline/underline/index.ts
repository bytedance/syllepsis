import { Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';

import { checkMarkDisable, keymapToggleMark } from '../../utils';

const UNDERLINE_PATTERN = /underline/i;
const NAME = 'underline';

const toggleMarkUnderline = keymapToggleMark(NAME);
class Underline extends Inline<any> {
  public name = NAME;
  public tagName = () => 'u';

  public textMatcher = [
    {
      matcher: [/\+\+([^+]+)\+\+\s$/, /~([^~]+)~\s$/],
    },
  ];

  public parseDOM = [
    { tag: 'ins' },
    { tag: 'u' },
    {
      tag: 'span',
      getAttrs,
    },
  ];
}

function getAttrs(dom: HTMLSpanElement): any {
  const value = dom.style.textDecorationLine || dom.style.textDecoration || '';
  const result = UNDERLINE_PATTERN.exec(value);
  if (result) {
    return true;
  }
  return false;
}

class UnderlineController extends SylController {
  public name = NAME;
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, NAME);
  public keymap = {
    'Mod-u': toggleMarkUnderline,
    'Mod-U': toggleMarkUnderline,
  };
}

class UnderlinePlugin extends SylPlugin {
  public name = NAME;
  public Controller = UnderlineController;
  public Schema = Underline;
}

export { Underline, UnderlineController, UnderlinePlugin };
