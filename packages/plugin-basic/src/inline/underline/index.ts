import { Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';

import { checkMarkDisable } from '../../utils';

const UNDERLINE_PATTERN = /underline/i;
const NAME = 'underline';

const toggleMarkUnderline = (editor: SylApi) => {
  const format = editor.getFormat();
  const status = !Boolean(format.underline);
  editor.setFormat({ underline: status });
  return true;
};
class Underline extends Inline<any> {
  public name = NAME;
  public tagName = () => 'u';

  public textMatcher = [
    {
      matcher: [/\+\+([^+]+)\+\+\s$/, /~([^~]+)~\s$/]
    }
  ];

  public parseDOM = [
    { tag: 'ins' },
    { tag: 'u' },
    {
      tag: 'span',
      getAttrs
    }
  ];

  static keymap = {
    'Mod-u': toggleMarkUnderline,
    'Mod-U': toggleMarkUnderline
  };
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
}

class UnderlinePlugin extends SylPlugin {
  public name = NAME;
  public Controller = UnderlineController;
  public Schema = Underline;
}

export { Underline, UnderlineController, UnderlinePlugin };
