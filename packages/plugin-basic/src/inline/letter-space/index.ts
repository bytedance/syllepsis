import { getPx, Inline, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node } from 'prosemirror-model';

import {
  checkMarkDisable,
  formatMenuValues,
  getFormatAttrsByValue,
  TAllowedValuesConfig,
  TValuesConfig,
} from '../../utils';

const PLUGIN_NAME = 'letter_space';

interface ILetterSpaceAttrs {
  space: string | number;
}
interface ILetterSpaceProps {
  allowedValues?: TAllowedValuesConfig;
  defaultFontSize?: number;
  values?: TValuesConfig;
}

class LetterSpace extends Inline<ILetterSpaceAttrs> {
  public name = 'letter_space';
  public tagName = () => 'span';
  public formatAttrs: ReturnType<typeof getFormatAttrsByValue>['formatAttrs'] = v => v;
  public defaultFontSize = 16;

  constructor(editor: SylApi, props: ILetterSpaceProps) {
    super(editor, props);
    props && this.constructParseDOM(props);
  }

  public constructParseDOM(config: ILetterSpaceProps) {
    if (!config || !config.allowedValues) return;

    const { formatAttrs } = getFormatAttrsByValue(config.allowedValues, 'space');

    if (config.defaultFontSize) this.defaultFontSize = +config.defaultFontSize;
    this.formatAttrs = formatAttrs;
  }

  public attrs = {
    space: {
      default: '',
    },
  };

  public parseDOM = [
    {
      style: 'letter-spacing',
      getAttrs: (style: string) => {
        const space = getPx(style, this.defaultFontSize);
        if (!space) return false;
        return this.formatAttrs({
          space,
        });
      },
    },
  ];

  public toDOM = (node: Node) => {
    const { space } = node.attrs;
    const attrs: { style?: string } = {};
    if (+space) {
      attrs.style = `letter-spacing: ${space}px;`;
    }
    return [this.tagName(), attrs, 0] as DOMOutputSpec;
  };
}

class LetterSpaceController extends SylController<ILetterSpaceProps> {
  public name = PLUGIN_NAME;
  constructor(editor: SylApi, props: ILetterSpaceProps) {
    super(editor, props);
    this.constructValue(props);
  }

  public constructValue = (props: ILetterSpaceProps) => {
    if (props.values) {
      this.toolbar.value = formatMenuValues('space', props.values);
    }
  };

  public toolbar = {
    className: PLUGIN_NAME,
    tooltip: PLUGIN_NAME,
    type: 'dropdown',
    value: [
      {
        attrs: false,
        text: '0',
      },
      {
        attrs: { space: 0.5 },
        text: '0.5',
      },
      {
        attrs: { space: 1 },
        text: '1',
      },
      {
        attrs: { space: 1.5 },
        text: '1.5',
      },
    ],
  };
  public disable = (editor: SylApi) => checkMarkDisable(editor.view, PLUGIN_NAME);
}

class LetterSpacePlugin extends SylPlugin<ILetterSpaceProps> {
  public name = PLUGIN_NAME;
  public Schema = LetterSpace;
  public Controller = LetterSpaceController;
}

export { LetterSpace, LetterSpaceController, LetterSpacePlugin };
