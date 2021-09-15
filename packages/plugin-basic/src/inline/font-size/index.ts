import { getPx, IG_TAG, Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node } from 'prosemirror-model';

import { formatMenuValues, getFixSize, getFormatAttrsByValue, TAllowedValuesConfig, TValuesConfig } from '../../utils';

interface IFontSizeProps {
  allowedValues?: TAllowedValuesConfig;
  values?: TValuesConfig;
  defaultFontSize?: number;
  unit?: 'em' | 'px'; // default is em
}

interface IFontSizeAttrs {
  size: string | number;
}

const PLUGIN_NAME = 'font_size';

class FontSize extends Inline<IFontSizeAttrs> {
  public name = PLUGIN_NAME;
  public tagName = () => 'span';
  public allowedValues: number[] = [];
  public formatAttrs: ReturnType<typeof getFormatAttrsByValue>['formatAttrs'] = v => v;
  public defaultFontSize = 16;

  constructor(editor: SylApi, props: IFontSizeProps) {
    super(editor, props);
    this.constructParseDOM(props);
  }

  public constructParseDOM(config?: IFontSizeProps) {
    if (!config) return;
    if (!config.allowedValues) return;

    const { formatAttrs, values, defaultValue } = getFormatAttrsByValue(config.allowedValues, 'size');

    if (defaultValue !== undefined) {
      this.defaultFontSize = +defaultValue;
    }
    if (values) this.allowedValues = values as number[];
    this.formatAttrs = formatAttrs;
  }

  public attrs = {
    size: {
      default: '',
    },
  };

  public parseDOM = [
    {
      style: 'font-size',
      getAttrs: (_style: string) => {
        let size: number | string = _style;

        if (size === 'medium') {
          return false;
        } else if (size === 'small' && this.allowedValues.length) {
          size = this.allowedValues[0];
        } else if (size === 'large' && this.allowedValues.length) {
          size = this.allowedValues[this.allowedValues.length - 1];
        } else if (!Number.isNaN(getPx(size, this.defaultFontSize))) {
          size = getPx(size, this.defaultFontSize);
        }
        if (!size) return false;

        return this.formatAttrs({
          size,
        });
      },
    },
  ];

  public toDOM = (node: Node) => {
    const size = node.attrs.size;
    const attrs: { style?: string; [IG_TAG]?: string } = {};

    if (size) {
      if (Number.isNaN(parseInt(size, 10))) {
        attrs.style = `font-size: ${size};`;
      } else if (this.props.unit === 'px') {
        attrs.style = `font-size: ${getFixSize(size)}px;`;
      } else {
        attrs.style = `font-size: ${getFixSize(size / this.defaultFontSize)}em;`;
      }
    } else {
      attrs[IG_TAG] = 'true';
    }

    return ['span', attrs, 0] as DOMOutputSpec;
  };
}

class FontSizeController extends SylController<IFontSizeProps> {
  public name = PLUGIN_NAME;
  public fontSize = 16;

  constructor(editor: SylApi, props: IFontSizeProps) {
    super(editor, props);
    this.constructValue(props);

    if (props.allowedValues) {
      let allowedValues = props.allowedValues;
      if (!Array.isArray(allowedValues)) allowedValues = [allowedValues];
      allowedValues.some(val => {
        if (typeof val === 'object' && val.default) {
          this.fontSize = val.value;
          return true;
        }
        return false;
      });
    }
  }

  public constructValue = (props: any) => {
    if (props.values) {
      this.toolbar.value = formatMenuValues('size', props.values);
    }
  };

  public toolbar = {
    className: PLUGIN_NAME,
    tooltip: PLUGIN_NAME,
    type: 'select',
    icon: (editor: SylApi, attrs: { size: number }) => {
      if (attrs.size) return attrs.size;
      else return this.fontSize;
    },
    value: [
      {
        text: '12',
        attrs: {
          size: 12,
        },
      },
      {
        text: '16',
        attrs: false,
      },
      {
        text: '20',
        attrs: {
          size: 20,
        },
      },
    ],
  };
}

class FontSizePlugin extends SylPlugin<IFontSizeProps> {
  public name = PLUGIN_NAME;
  public Controller = FontSizeController;
  public Schema = FontSize;
}

export { FontSize, FontSizeController, FontSizePlugin };
