import { Block, SylPlugin } from '../../../packages/adapter/dist/es';

class IsolatingBlock extends Block<any> {
  public name = 'isolating_block';

  public tagName = () => 'div';

  public attrs = {
    class: {
      default: 'isolating'
    }
  };

  public content = 'block+';

  public isolating = true;

  public parseDOM = [{ tag: 'div.isolating' }, { tag: 'bi' }];
}

class IsolatingPlugin extends SylPlugin<any> {
  public name = 'isolating_block';
  public Schema = IsolatingBlock;
}

export { IsolatingPlugin };
