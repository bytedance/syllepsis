import { SylPlugin } from '@syllepsis/adapter';

import { AlignController, IAlignProps } from '../common';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    align_center?: {
      setStyle: () => void;
    };
  }
}

class AlignCenterController extends AlignController {
  public value = 'center' as const;
}

class AlignCenterPlugin extends SylPlugin<IAlignProps> {
  public name = 'align_center';
  public Controller = AlignCenterController;
}

export { AlignCenterPlugin };
