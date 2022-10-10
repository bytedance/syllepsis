import { SylPlugin } from '@syllepsis/adapter';

import { AlignController, IAlignProps } from '../common';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    align_left?: {
      setStyle: () => void;
    };
  }
}
class AlignLeftController extends AlignController {
  public checkActive = false;
}

class AlignLeftPlugin extends SylPlugin<IAlignProps> {
  public name = 'align_left';
  public Controller = AlignLeftController;
}

export { AlignLeftPlugin };
