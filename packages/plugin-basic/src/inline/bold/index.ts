import { Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';

import { checkMarkDisable } from '../../utils';

const NAME = 'bold';

const toggleMarkBold = (editor: SylApi) => {
  const format = editor.getFormat();
  const status = !Boolean(format.bold);
  editor.setFormat({ bold: status });
  return true;
};
class Bold extends Inline<any> {
  public name = NAME;
  public tagName = () => 'strong';

  public textMatcher = [
    {
      matcher: /\*\*([^*]+)\*\*\s$/
    }
  ];

  public parseDOM = [
    { tag: 'strong', priority: 25 },
    {
      tag: 'b',
      priority: 25,
      getAttrs(node: HTMLElement) {
        return node.style.fontWeight !== 'normal';
      }
    },
    /**
     * if h1 use font-weight to bolden content, it will marked as bold
     * mark cannot replaced as block when it has block node and marks
     * it will traverse it's content and insert it to paragraph
     * instead of replacing block
     */
    {
      style: 'font-weight',
      getAttrs(value: string) {
        return /^bold(er)?$/.test(value) || +value >= 700;
      }
    }
  ];
}

class BoldController extends SylController {
  public name = NAME;
  public toolbar = {};
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, NAME);

  public keymap = {
    'Mod-b': toggleMarkBold,
    'Mod-B': toggleMarkBold
  };
}

class BoldPlugin extends SylPlugin {
  public name = NAME;
  public Controller = BoldController;
  public Schema = Bold;
}

export { Bold, BoldController, BoldPlugin };
