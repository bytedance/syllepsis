import { SylPlugin } from '../../../packages/adapter/dist/es';
import { Underline as BaseUnderline } from '../../../packages/plugin-basic/dist/es/inline/underline';

class Underline extends BaseUnderline {
  public notStore = true;

  public excludes = 'italic';
}

class UnderlinePlugin extends SylPlugin<any> {
  public name = 'underline';
  public Schema = Underline;
}

export { UnderlinePlugin };
