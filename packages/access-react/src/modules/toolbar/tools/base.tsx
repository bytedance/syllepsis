import { SylApi } from '@syllepsis/adapter';
import { IToolbarOption, TMoreContent } from '@syllepsis/editor';
import classnames from 'classnames';
import React from 'react';

import { ToolDisplay } from '../utils';
import { IProp } from '.';
import { ButtonForToolbar, getConfigVal } from './button';
import { IPopperProps, List, Popper } from './utils';

interface ISelectBase extends Partial<IProp> {
  editor: SylApi;
  display: ToolDisplay;
  trigger: TMoreContent['trigger'];
  popperProps?: Partial<IPopperProps>;
  menuDistance?: IToolbarOption['menuDistance'];
  menuDirection?: IToolbarOption['menuDirection'];
  groupKey?: string;
}

// default 'down-start'，but 'right-start' in dropdown menu, auto just when in toolbarInline
const getDropdownDefaultDirection = (isStatic: boolean, isVertical: boolean) => {
  if (isStatic) {
    if (isVertical) return 'down-start';
    return 'right-start';
  }
};

const TOGGLE_DELAY = 150;

/**
 * Basic class of selectButton
 * there is no tooltip and showName in select button, provided by renderIcon
 * - @type {() => JSX.Element} renderIcon
 * - @type {() => JSX.Element} renderMenu
 * - @type {() => boolean} checkActive check if the button needs highlight
 */
class SelectBase<T> extends React.Component<
  ISelectBase & T,
  {
    open: boolean;
    tooltipShow: boolean;
  }
> {
  wrap?: HTMLElement | null;
  menuRef = React.createRef<HTMLDivElement>();
  shouldClose = false; // determine whether the menu should be hidden when the mouse moves

  state = {
    open: false,
    tooltipShow: false,
  };

  get eventType() {
    const { display, trigger, toolbarType } = this.props;
    if (trigger) {
      return trigger === 'click' ? 'click' : 'mousemove';
    }
    if (toolbarType === 'inline') return 'mousemove';
    if (display === ToolDisplay.VERTICAL) return 'click';
    return 'mousemove';
  }

  tendToCloseMenu = (level = 1) => {
    this.shouldClose = true;
    setTimeout(() => {
      this.shouldClose && this.closeMenu();
    }, TOGGLE_DELAY / level);
  };

  getTriggerHandler = () => {
    const triggerHandler: any = {};
    const { toolbar, editor } = this.props;
    if (toolbar && toolbar.disable && toolbar.disable(editor)) {
      return triggerHandler;
    }
    if (this.eventType !== 'click') {
      triggerHandler.onMouseEnter = () => this.openMenu();
      triggerHandler.onMouseLeave = () => this.tendToCloseMenu();
    } else {
      triggerHandler.onClick = (e: MouseEvent) => {
        this.state.open ? this.closeMenu() : this.openMenu();
        e.stopPropagation();
      };
    }
    return triggerHandler;
  };

  checkClose = (e: MouseEvent) => {
    if (!this.wrap || !this.menuRef.current || !e.target) return;
    if (!this.state.open) return;
    if (this.menuRef.current.contains(e.target as Element)) return;
    this.tendToCloseMenu(6);
  };

  openMenu = () => {
    this.shouldClose = false;
    if (this.state.open) return;
    setTimeout(
      () => {
        this.setState({ open: true, tooltipShow: false });
        document.addEventListener('scroll', this.updatePosition);
        document.addEventListener('click', this.checkClose, true);
      },
      this.eventType !== 'click' ? TOGGLE_DELAY / 2 : 0,
    );
  };

  closeCallBack = () => {};

  closeMenu = () => {
    if (!this.state.open) return;
    this.setState({ open: false }, this.closeCallBack);
    document.removeEventListener('scroll', this.updatePosition);
    document.removeEventListener('click', this.checkClose, true);
  };

  updatePosition = () => requestAnimationFrame(() => this.forceUpdate());

  showTooltip = () => {
    if (!this.state.open && !this.state.tooltipShow) {
      this.setState({ tooltipShow: true });
    }
  };

  hideTooltip = () => {
    if (!this.state.open && this.state.tooltipShow) {
      this.setState({ tooltipShow: false });
    }
  };

  checkActive = () => false;

  renderIcon = () => <span></span>;

  renderMenu = () => {};

  renderMenuList = () => {
    const { toolbarType = 'static' } = this.props;
    return (
      <List
        className={classnames({
          [toolbarType]: toolbarType,
        })}
        getRef={this.menuRef}
        onClick={this.closeMenu}
      >
        {this.renderMenu()}
      </List>
    );
  };

  render() {
    const {
      name = '',
      tooltip,
      editor,
      tipDirection,
      tipDistance = 4,
      toolbarType = 'static',
      menuDistance = 4,
      menuDirection,
      toolbar,
      display,
      showName,
    } = this.props;

    const { open, tooltipShow } = this.state;
    const isVertical = display === ToolDisplay.VERTICAL;
    const isStatic = toolbarType === 'static';

    const renderName = !isVertical ? getConfigVal([showName, tooltip, name]) : false;

    return (
      <ButtonForToolbar
        display={display}
        tipDirection={tipDirection}
        tipDistance={tipDistance}
        toolbarType={toolbarType}
        name={name}
        tooltip={isVertical ? tooltip : false}
        toolbar={{
          ...toolbar,
          showName: isVertical ? false : toolbar?.showName,
          icon: () => (
            <Popper
              isOpen={Boolean(open)}
              tipContentClassName={classnames({ [name]: name })}
              content={this.renderMenuList()}
              distance={(toolbar?.menuDistance || menuDistance) + (!isStatic && !isVertical ? -8 : 0)}
              direction={menuDirection || toolbar?.menuDirection || getDropdownDefaultDirection(isStatic, isVertical)}
            >
              <span>{this.renderIcon()}</span>
              {!isVertical && renderName && <span className="tool-name">{renderName}</span>}
            </Popper>
          ),
        }}
        getRef={wrap => {
          this.wrap = wrap;
        }}
        active={this.checkActive()}
        handler={() => (this.state.open ? this.closeMenu() : this.openMenu())}
        editor={editor}
        attrs={false}
        tooltipProps={{ isOpen: open ? false : tooltipShow }}
        buttonProps={{
          onMouseEnter: this.showTooltip,
          onMouseLeave: this.hideTooltip,
          ...this.getTriggerHandler(),
        }}
        className={open ? 'open' : ''}
      />
    );
  }
}

export { SelectBase };
