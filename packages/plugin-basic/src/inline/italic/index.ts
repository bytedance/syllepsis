import { Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';

import { checkMarkDisable, keymapToggleMark } from '../../utils';

const NAME = 'italic';

const toggleMarkItalic = keymapToggleMark(NAME);
class Italic extends Inline<any> {
  public name = NAME;
  public tagName = () => 'em';
  public textMatcher = [
    {
      matcher: /\*([^*]+)\*\s$/,
    },
  ];
  public parseDOM = [{ tag: 'em', priority: 25 }, { tag: 'i', priority: 25 }, { style: 'font-style=italic' }];
}

class ItalicController extends SylController {
  public name = NAME;
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, NAME);
  public keymap = {
    'Mod-i': toggleMarkItalic,
    'Mod-I': toggleMarkItalic,
  };
}

class ItalicPlugin extends SylPlugin {
  public name = NAME;
  public Controller = ItalicController;
  public Schema = Italic;
}

export { Italic, ItalicController, ItalicPlugin };
