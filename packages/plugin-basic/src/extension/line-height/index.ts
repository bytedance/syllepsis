import { SylApi, SylPlugin } from '@syllepsis/adapter';

import { ITypesetCommonProps, TypesetController } from '../common';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    line_height?: {
      setStyle: (attrs: { lineHeight: string | number }) => void;
    };
  }
}

const PLUGIN_NAME = 'line_height';

class LineHeightController extends TypesetController {
  public name = PLUGIN_NAME;
  constructor(editor: SylApi, props: ITypesetCommonProps) {
    super(editor, props);
    this.constructValue(props);
  }
}

class LineHeightPlugin extends SylPlugin<ITypesetCommonProps> {
  public name = PLUGIN_NAME;
  public Controller = LineHeightController;
}

export { LineHeightController, LineHeightPlugin };
