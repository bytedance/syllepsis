import { SylApi, SylController } from '@syllepsis/adapter';
import { AllSelection } from 'prosemirror-state';

import { checkParentHaveAttr, checkParentSupportAttr, setAlign } from '../../../utils';

interface IAlignProps {
  /** includes all related nodes not just the top child node that supports `align` attributes */
  inclusive?: boolean;
}

class AlignController extends SylController<IAlignProps> {
  public checkActive = true;
  public value: 'left' | 'right' | 'center' | 'justify' = 'left';

  public toolbar = {
    handler: (editor: SylApi) => this.command.setStyle(editor),
  };

  public command = {
    setStyle: (editor: SylApi) => {
      setAlign(editor.view, this.value, this.props.inclusive);
      editor.focus();
    },
  };

  public disable = (editor: SylApi) =>
    !(editor.view.state.selection instanceof AllSelection) && !checkParentSupportAttr(editor.view, 'align');
  public active = () => (this.checkActive ? checkParentHaveAttr(this.editor.view, 'align', this.value) : false);
}

export { AlignController, IAlignProps };
