import { SylApi, Types } from '@syllepsis/adapter';

import { Icons } from '../../../component';
import { ToolbarType } from '../utils';
import { SelectBase } from './base';

interface IMoreButtonProps {
  renderMenu: () => JSX.Element | JSX.Element[];
  icon:
    | JSX.Element
    | ((editor: SylApi, state: Types.StringMap<any>, data: { toolbarType: ToolbarType }) => JSX.Element);
}

class MoreForToolbar extends SelectBase<IMoreButtonProps> {
  get isActive() {
    return Boolean(this.menuRef.current && this.menuRef.current.querySelector('.active'));
  }

  closeCallBack = () => this.props.editor.configurator.emit(`${this.props.groupKey}-close`);

  renderIcon = () => {
    const { icon, editor, toolbarType = 'static' } = this.props;
    let showIcon: any = icon;
    if (typeof icon === 'function') {
      showIcon = icon(editor, {}, { toolbarType });
    }
    return showIcon || Icons.more;
  };

  renderMenu = () => this.props.renderMenu();
}

export { MoreForToolbar };
