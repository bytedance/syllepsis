import { SylController, SylPlugin } from '../../../packages/adapter/dist/es';

class PasteController extends SylController<any> {
  public name = 'header';

  public eventHandler: SylController['eventHandler'] = {
    transformPastedText: (editor, text) => text.replace('test_paste_text', 'match_paste_text'),
    transformPastedHTML: (editor, html) => html.replace('test_paste_html', 'match_paste_html'),
  };
}

class PastePlugin extends SylPlugin<any> {
  public name = 'paste';
  public Controller = PasteController;
}

export { PastePlugin };
