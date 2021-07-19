import { SylApi, SylPlugin } from '@syllepsis/adapter';

import { ITypesetCommonProps, TypesetController } from '../common';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    space_after?: {
      setStyle: (attrs: { spaceAfter: string | number }) => void;
    };
  }
}

const PLUGIN_NAME = 'space_after';

class SpaceAfterController extends TypesetController {
  public name = PLUGIN_NAME;
  constructor(editor: SylApi, props: ITypesetCommonProps) {
    super(editor, props);
    this.constructValue(props);
  }
}

class SpaceAfterPlugin extends SylPlugin<ITypesetCommonProps> {
  public name = PLUGIN_NAME;
  public Controller = SpaceAfterController;
}

export { SpaceAfterPlugin };
