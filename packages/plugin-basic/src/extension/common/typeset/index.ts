import { SylApi, SylController, Types } from '@syllepsis/adapter';
import { AllSelection } from 'prosemirror-state';

import { checkParentSupportAttr, formatMenuValues, TValuesConfig } from '../../../utils';

interface ITypesetCommonProps {
  values?: TValuesConfig;
}

class TypesetController extends SylController<ITypesetCommonProps> {
  public name = '';
  public attrName = '';

  public toolbar = {
    type: 'dropdown',
    value: [] as Array<any>,
    handler: (editor: SylApi, name: string, attrs: Types.StringMap<any>) => this.command.setStyle(editor, attrs),
    getAttrs: (editor: SylApi) => {
      const node = editor.view.state.selection.$from.node();
      const attr = node.attrs[this.attrName];
      if (attr === '') return '';
      return { [this.attrName]: +attr };
    }
  };

  public constructValue = (props: Types.StringMap<any>) => {
    const cValues = props.values;
    if (!cValues) return;
    this.toolbar.value = [];
    if (props.values) {
      if (!this.attrName) this.attrName = this.name.replace(/_(.)/, ($0, $1) => $1.toUpperCase());
      this.toolbar.value = formatMenuValues(this.attrName, props.values, { [this.attrName]: '' });
    }
  };

  public command = {
    setStyle: (editor: SylApi, attrs: Types.StringMap<any>) => {
      editor.nodesBetween((node, nodePos) => {
        if (node.isTextblock) {
          editor.update(attrs, nodePos);
          return false;
        }
        return true;
      });
      editor.focus();
    }
  };

  public disable = (editor: SylApi) => {
    const { selection } = editor.view.state;
    return !(selection instanceof AllSelection) && !checkParentSupportAttr(editor.view, this.attrName);
  };
}

export { ITypesetCommonProps, TypesetController };
