import { SylApi, SylPlugin } from '@syllepsis/adapter';

import { ITypesetCommonProps, TypesetController } from '../common';

const PLUGIN_NAME = 'space_before';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    space_before?: {
      setStyle: (attrs: { spaceBefore: string | number }) => void;
    };
  }
}

class SpaceBeforeController extends TypesetController {
  public name = PLUGIN_NAME;
  constructor(editor: SylApi, props: ITypesetCommonProps) {
    super(editor, props);
    this.constructValue(props);
  }
}

class SpaceBeforePlugin extends SylPlugin<ITypesetCommonProps> {
  public name = PLUGIN_NAME;
  public Controller = SpaceBeforeController;
}

export { SpaceBeforePlugin };
