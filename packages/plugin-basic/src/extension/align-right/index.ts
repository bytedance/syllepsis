import { SylPlugin } from '@syllepsis/adapter';

import { AlignController } from '../common';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    align_right?: {
      setStyle: () => void;
    };
  }
}

class AlignRightController extends AlignController {
  public value = 'right' as const;
}

class AlignRightPlugin extends SylPlugin {
  public name = 'align_right';
  public Controller = AlignRightController;
}

export { AlignRightPlugin };
