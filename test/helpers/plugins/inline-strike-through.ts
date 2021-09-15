import { SylPlugin } from '../../../packages/adapter/dist/es';
import { Strike as BaseStrike } from '../../../packages/plugin-basic/dist/es/inline/strike';

class StrikeThrough extends BaseStrike {
  public excludes = 'bold';

  public notClear = true;
}

class StrikeThroughPlugin extends SylPlugin<any> {
  public name = 'strike';
  public Schema = StrikeThrough;
}

export { StrikeThroughPlugin };
