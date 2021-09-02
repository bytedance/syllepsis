import { Types } from '@syllepsis/adapter';
import { TOOL_TYPE } from '@syllepsis/editor';
import { isMatchObject } from '@syllepsis/plugin-basic';
import cls from 'classnames';
import React from 'react';

import { Icons } from '../../../component';
import { ToolDisplay } from '../utils';
import { IProp } from '.';
import { SelectBase } from './base';
import { getConfigVal } from './button';
import { ListItem } from './utils';

class SelectForToolbar extends SelectBase<{
  name: IProp['name'];
  toolbar: IProp['toolbar'];
  type: string;
  handler: IProp['handler'];
}> {
  isActive = false;
  activeIdx = -1;

  componentDidMount() {
    this.props.editor.configurator.on(`${this.props.groupKey}-close` as any, this.closeMenu);
  }

  componentWillUnmount() {
    this.props.editor.configurator.off(`${this.props.groupKey}-close` as any, this.closeMenu);
  }

  checkActive = () => {
    const {
      toolbar: { value },
    } = this.props;

    this.activeIdx = value.findIndex(({ attrs }: any) => isMatchObject(attrs, this.attrs));

    const needActive = value[this.activeIdx] && value[this.activeIdx].needActive;

    if (!this.attrs) {
      // needs highlight even the `attrs` is false
      if (needActive) return true;
      else {
        this.activeIdx = -1;
        return false;
      }
    }

    // by default, the first value of values is the default value
    if (!this.activeIdx && (needActive || this.props.type === TOOL_TYPE.DROPDOWN)) {
      return true;
    } else if (this.activeIdx > 0) {
      return true;
    }

    return false;
  };

  get attrs() {
    const {
      toolbar: { getAttrs },
      attrs,
      editor,
    } = this.props;
    return getAttrs ? getAttrs(editor) : attrs;
  }

  get defaultIcon() {
    const {
      toolbar: { icon },
      name,
      type,
      editor,
    } = this.props;
    if (icon) {
      if (typeof icon === 'function') return icon(editor, this.attrs);
      return icon;
    }

    const Icon = Icons[name as keyof typeof Icons];
    if (type === TOOL_TYPE.SELECT) {
      return Icon && (Icon as JSX.Element[])[0];
    }
    return Icon;
  }

  get showName() {
    return getConfigVal([this.props.showName, this.props.toolbar.showName]);
  }

  renderIcon = () => {
    const { type, display, toolbar } = this.props;
    const icon = type === TOOL_TYPE.SELECT ? this.renderSelectIcon() : this.renderDropDownIcon();
    if (display === ToolDisplay.HORIZON && toolbar.showName) {
      return (
        <>
          {icon}
          <span className="tool-value">{toolbar.showName}</span>
        </>
      );
    }
    return icon;
  };

  renderSelectIcon = () => {
    const { toolbar, editor, toolbarType } = this.props;
    const index = Math.max(0, this.activeIdx);
    const value = toolbar.value[index];

    if (typeof toolbar.icon === 'function') {
      return toolbar.icon(editor, this.attrs, { toolbarType });
    }
    return this.renderMenuItem(value, this.activeIdx) || this.defaultIcon;
  };

  renderDropDownIcon = () => this.defaultIcon;

  renderMenuItem = (value: any, idx = 0) => {
    const name = this.props.name as keyof typeof Icons;
    if (value.render) {
      return value.render({ toolbarType: this.props.toolbarType });
    } else if (value.icon !== undefined) {
      return (
        <>
          {value.icon}
          <span className="tool-value">{value.text}</span>
        </>
      );
    } else if (value.text !== undefined) {
      return <span className="tool-value">{value.text}</span>;
    } else if (Icons[name] && (Icons[name] as JSX.Element[])[idx]) {
      return (Icons[name] as JSX.Element[])[idx];
    }
  };

  menuItemClick = (attrs: Types.StringMap<any>) => {
    this.closeMenu();
    this.props.handler(this.props.editor, this.props.name, attrs);
  };

  renderMenu = () => {
    const {
      toolbar: { value },
      toolbarType = 'static',
    } = this.props;

    return value.map((v: any, index: number) => (
      <ListItem
        className={cls({
          active: index === this.activeIdx,
          [toolbarType]: toolbarType,
        })}
        key={JSON.stringify(v.attrs)}
        onClick={() => this.menuItemClick(v.attrs)}
      >
        {this.renderMenuItem(v, index)}
      </ListItem>
    ));
  };
}

export { SelectForToolbar };
