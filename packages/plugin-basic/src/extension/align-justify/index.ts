import { SylPlugin } from '@syllepsis/adapter';

import { AlignController } from '../common';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    align_justify?: {
      setStyle: () => void;
    };
  }
}

class AlignJustifyController extends AlignController {
  public value = 'justify' as const;
}

class AlignJustifyPlugin extends SylPlugin {
  public name = 'align_justify';
  public Controller = AlignJustifyController;
}

export { AlignJustifyPlugin };
