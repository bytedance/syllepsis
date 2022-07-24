import { IG_TAG, Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node } from 'prosemirror-model';

import { checkMarkDisable, toHex } from '../../utils';

interface IBackgroundProps {
  default?: string;
}
interface IBackgroundAttrs {
  color: string | null;
}

const colorReg = /^\s*(rgba\([^)]+\)|rgb\([^)]+\)|#[\d|a-f]{3,8})|\w*/i;
const NAME = 'background';

const getBgAttrs = (style: string) => {
  const colorMatch = style.match(colorReg);
  if (!colorMatch) return false;
  const background = toHex(colorMatch[0]);
  if (background) {
    return {
      color: background,
    };
  }
  return false;
};

class Background extends Inline<IBackgroundAttrs> {
  public name = NAME;
  public tagName = () => 'span';

  constructor(editor: SylApi, props: IBackgroundProps) {
    super(editor, props);
    if (props.default) {
      this.attrs.color.default = toHex(props.default);
    }
  }

  public attrs = {
    color: {
      default: '#FFFFFF',
    },
  };

  public parseDOM = [
    {
      style: 'background',
      getAttrs: getBgAttrs,
    },
    {
      style: 'background-color',
      getAttrs: getBgAttrs,
    },
  ];

  public toDOM = (node: Node) => {
    const { color } = node.attrs;
    const renderColor = color && toHex(color) !== toHex(this.attrs.color.default) && color;
    return [
      'span',
      renderColor ? { style: `background-color: ${node.attrs.color};` } : { [IG_TAG]: 'true' },
      0,
    ] as DOMOutputSpec;
  };
}

class BackgroundController extends SylController<IBackgroundProps> {
  public name = 'background';
  public defaultColor = '#FFFFFF';

  constructor(editor: SylApi, props: IBackgroundProps) {
    super(editor, props);
    if (props.default) {
      this.defaultColor = toHex(props.default);
    }
  }

  public getAttrs = (color: string) => {
    const result = toHex(color);
    if (!result) return false;
    return {
      color: result,
    };
  };
  public getValue = (attrs: any) => attrs.color;
  public toolbar: SylController['toolbar'] = {
    className: 'background',
    tooltip: 'background-color',
  };
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, NAME);
}

class BackgroundPlugin extends SylPlugin<IBackgroundProps> {
  public name = NAME;
  public Controller = BackgroundController;
  public Schema = Background;
}

export { Background, BackgroundController, BackgroundPlugin };
