import { Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node } from 'prosemirror-model';

import { checkMarkDisable, toHex } from '../../utils';

const NAME = 'color';
interface IColorAttrs {
  color: string;
}

interface IColorProps {
  default?: string;
}

const getColorAttrs = (style: string) => {
  const color = toHex(style);
  if (color) {
    return {
      color,
    };
  }
  return false;
};
class Color extends Inline<IColorAttrs> {
  public name = NAME;
  public tagName = () => 'span';

  public props: IColorProps = {};

  constructor(editor: SylApi, props: IColorProps) {
    super(editor, props);
    if (props.default) {
      this.attrs.color.default = toHex(props.default);
    }
  }

  public attrs = {
    color: {
      default: '#000000',
    },
  };

  public parseDOM = [
    {
      style: 'color',
      getAttrs: getColorAttrs,
    },
    {
      tag: '*[color]',
      getAttrs: (dom: HTMLElement) => getColorAttrs(dom.getAttribute('color')!),
    },
  ];

  public toDOM = (node: Node) => {
    const { color } = node.attrs;
    const renderColor = color && toHex(color) !== toHex(this.attrs.color.default) && color;
    return ['span', renderColor ? { style: `color: ${node.attrs.color}` } : {}, 0] as DOMOutputSpec;
  };
}

class ColorController extends SylController<IColorProps> {
  public name = 'color';
  public defaultColor = '#000000';

  constructor(editor: SylApi, props: IColorProps) {
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
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, NAME);
  public toolbar: SylController['toolbar'] = {
    className: 'color',
    tooltip: 'color',
  };
}

class ColorPlugin extends SylPlugin<IColorProps> {
  public name = NAME;
  public Controller = ColorController;
  public Schema = Color;
}

export { Color, ColorController, ColorPlugin };
