import { SylApi, SylPlugin } from '@syllepsis/adapter';

import { ITypesetCommonProps, TypesetController } from '../common';

const PLUGIN_NAME = 'space_both';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    space_both?: {
      setStyle: (attrs: { spaceBoth: string | number }) => void;
    };
  }
}
class SpaceBothController extends TypesetController {
  public name = PLUGIN_NAME;
  constructor(editor: SylApi, props: ITypesetCommonProps) {
    super(editor, props);
    this.constructValue(props);
  }
}

class SpaceBothPlugin extends SylPlugin<ITypesetCommonProps> {
  public name = PLUGIN_NAME;
  public Controller = SpaceBothController;
}

export { SpaceBothPlugin };
