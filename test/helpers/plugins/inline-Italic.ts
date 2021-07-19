import { SylPlugin } from '../../../packages/adapter/dist/es';
import { Italic as BaseItalic } from '../../../packages/plugin-basic/dist/es/inline/italic';

class Italic extends BaseItalic {
  public excludes = '_';

  public notClear = true;
}
class ItalicPlugin extends SylPlugin<any> {
  public Schema = Italic;
}

export { ItalicPlugin };
