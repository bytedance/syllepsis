import { Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node } from 'prosemirror-model';

import { checkMarkDisable, toRgba } from '../../utils';

const NAME = 'color';
const black = 'rgba(0, 0, 0, 1)';
interface IColorProps {
  color: string;
}

const getColorAttrs = (style: string) => {
  const color = toRgba(style);
  if (color) {
    return {
      color
    };
  }
  return false;
};
class Color extends Inline<IColorProps> {
  public name = NAME;
  public tagName = () => 'span';

  public attrs = {
    color: {
      default: `${black}`
    }
  };

  public parseDOM = [
    {
      style: 'color',
      getAttrs: getColorAttrs
    },
    {
      tag: '*[color]',
      getAttrs: (dom: HTMLElement) => getColorAttrs(dom.getAttribute('color')!)
    }
  ];

  public toDOM = (node: Node) => ['span', { style: `color: ${node.attrs.color}` }, 0] as DOMOutputSpec;
}

class ColorController extends SylController {
  public name = 'color';
  public defaultColor = black;
  public getAttrs = (color: { r: number; g: number; b: number; a: number }) => {
    const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    return {
      color: `${rgba}`
    };
  };
  public getValue = (attrs: any) => attrs.color;
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, NAME);
  public toolbar: SylController['toolbar'] = {
    className: 'color',
    tooltip: 'color'
  };
}

class ColorPlugin extends SylPlugin {
  public name = NAME;
  public Controller = ColorController;
  public Schema = Color;
}

export { Color, ColorController, ColorPlugin };
