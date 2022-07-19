import { SylController, SylPlugin } from '../../../packages/adapter/dist/es';
import { DOMOutputSpec } from 'prosemirror-model';
import { Header as BaseHeader } from '../../../packages/plugin-basic/dist/es/block/header';

class Header extends BaseHeader {
  public excludeMarks = 'bold italic';
  public marks = 'underline';

  public attrs = {
    level: {
      default: 1,
    },
    class: {
      default: '',
    },
  };

  public toDOM = (node: any) => {
    const attrs: any = {};
    if (node.attrs.class) attrs.class = node.attrs.class;
    return [this.tagName(node), attrs, 0] as any;
  };
}

class HeaderController extends SylController<any> {
  public name = 'header';

  public eventHandler = {
    handleDOMEvents: {
      mouseup: () => false,
    },
  };
}

class HeaderPlugin extends SylPlugin<any> {
  public name = 'header';
  public Controller = HeaderController;
  public Schema = Header;
}

export { HeaderPlugin };
