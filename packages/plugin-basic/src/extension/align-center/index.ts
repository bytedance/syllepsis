import { SylPlugin } from '@syllepsis/adapter';

import { AlignController } from '../common';

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

class AlignCenterPlugin extends SylPlugin {
  public name = 'align_center';
  public Controller = AlignCenterController;
}

export { AlignCenterPlugin };
