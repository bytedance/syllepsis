import { Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node } from 'prosemirror-model';

import { checkMarkDisable, toRgba } from '../../utils';

interface IBackgroundAttrs {
  color: string | null;
}

const colorReg = /^\s*(rgba\([^)]+\)|rgb\([^)]+\)|#[\d|a-f]{3,6})|\w*/i;
const NAME = 'background';

const getBgAttrs = (style: string) => {
  const colorMatch = style.match(colorReg);
  if (!colorMatch) return false;
  const background = toRgba(colorMatch[0]);
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

  public attrs = {
    color: {
      default: null,
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

  public toDOM = (node: Node) => ['span', { style: `background-color: ${node.attrs.color}` }, 0] as DOMOutputSpec;
}

class BackgroundController extends SylController {
  public name = 'background';
  public defaultColor = 'rgba(0, 0, 0, 1)';
  public getAttrs = (color: { r: number; g: number; b: number; a: number }) => {
    const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    return {
      color: rgba,
    };
  };
  public getValue = (attrs: any) => attrs.color;
  public toolbar: SylController['toolbar'] = {
    className: 'background',
    tooltip: 'background-color',
  };
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, NAME);
}

class BackgroundPlugin extends SylPlugin {
  public name = NAME;
  public Controller = BackgroundController;
  public Schema = Background;
}

export { Background, BackgroundController, BackgroundPlugin };
