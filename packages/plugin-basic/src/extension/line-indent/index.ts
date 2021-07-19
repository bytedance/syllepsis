import { SylApi, SylController, SylPlugin, Types } from '@syllepsis/adapter';
import { AllSelection } from 'prosemirror-state';

import { checkParentSupportAttr } from '../../utils';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    line_indent?: {
      setStyle: (attrs: { lineIndent: string | number }) => void;
    };
  }
}

const PLUGIN_NAME = 'line_indent';

interface ILineIndentProps {
  value: number;
}

class LineIndentController extends SylController<ILineIndentProps> {
  public attrName = 'lineIndent';

  public toolbar = {
    handler: (editor: SylApi) => {
      this.command.setTypeset(editor, { [this.attrName]: this.active(editor) ? '' : this.props.value || 2 });
    },
  };

  public command = {
    setTypeset: (editor: SylApi, attrs: Types.StringMap<any>) => {
      editor.nodesBetween((node, nodePos) => {
        if (node.isTextblock) {
          editor.update(attrs, nodePos);
          return false;
        }
      });
      editor.focus();
    },
  };

  public active = (editor: SylApi) => {
    let isActive = false;
    editor.nodesBetween(node => {
      if (isActive) return false;
      if (node.isTextblock) {
        isActive = Boolean(node.attrs[this.attrName]);
        return false;
      }
    });
    return isActive;
  };

  public disable = (editor: SylApi) => {
    const { selection } = editor.view.state;
    return !(selection instanceof AllSelection) && !checkParentSupportAttr(editor.view, this.attrName);
  };
}

class LineIndentPlugin extends SylPlugin<ILineIndentProps> {
  public name = PLUGIN_NAME;
  public Controller = LineIndentController;
}

export { LineIndentController, LineIndentPlugin };
