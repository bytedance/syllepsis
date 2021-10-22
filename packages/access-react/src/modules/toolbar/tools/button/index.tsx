import './style.css';

import classnames from 'classnames';
import React, { useState } from 'react';

import { IconButton, Icons, ITooltipProps, ListItem, Tooltip } from '../../../../component';
import { ToolDisplay } from '../../utils';
import { IProp } from '../index';

const noop = () => {};

const getConfigVal = (val: Array<string | boolean | any>) => {
  let res;
  val.some(t => {
    if (t) {
      res = t;
      return true;
    } else if (t === false) {
      res = false;
      return true;
    }
    return false;
  });
  return res;
};

interface IToolbarVerticalButtonExtraProps {
  buttonProps?: Partial<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>>;
}

interface IToolbarHorizonButtonExtraProps {
  buttonProps?: Partial<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLLIElement>, HTMLLIElement>>;
}

interface IButtonForToolbarProps extends IProp {
  getRef?: (node: HTMLElement | null) => any;
  className?: string;
  tooltipProps?: Partial<ITooltipProps>;
  buttonProps?: any;
}

interface IButtonProps extends IButtonForToolbarProps {
  disable: boolean;
  icon: any;
  tooltipVisible: boolean;
}

// Vertical buttons are usually displayed directly on the toolbar
const renderVertical = ({
  name,
  disable,
  active,
  tooltip: propTooltip,
  handler,
  editor,
  icon,
  tipDirection,
  tipDistance,
  tooltipVisible,
  className = '',
  buttonProps = {},
  tooltipProps = {},
  toolbarType,
  getRef,
}: IButtonProps & IToolbarVerticalButtonExtraProps) => {
  let tooltip = propTooltip;
  const renderContent = () => {
    const content = (
      <IconButton
        onClick={() => {
          if (disable) return;
          handler(editor, name, !active);
        }}
        {...buttonProps}
      >
        {icon}
      </IconButton>
    );

    if (tooltipVisible && tooltip) {
      if (typeof tooltip === 'function') {
        const tipNode = tooltip(content);
        if (typeof tipNode === 'string' && tipNode) {
          tooltip = tipNode;
        } else {
          return tipNode;
        }
      }
      return (
        <Tooltip content={tooltip} direction={tipDirection} distance={tipDistance} {...tooltipProps}>
          {content}
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <div
      className={classnames('syl-toolbar-tool', {
        [name]: name,
        [toolbarType]: toolbarType,
        [className]: className,
        active,
        disable,
      })}
      key={name}
      ref={getRef}
    >
      {renderContent()}
    </div>
  );
};

// Horizon buttons are usually displayed in the dropdown menu of the toolbar
const renderHorizon = ({
  name,
  disable,
  active,
  tooltip: propTooltip,
  handler,
  editor,
  icon,
  tipDirection,
  tipDistance,
  tooltipVisible,
  showName,
  className = '',
  toolbarType = 'static',
  buttonProps,
  getRef,
}: IButtonProps & IToolbarHorizonButtonExtraProps) => {
  let tooltip = propTooltip;
  if (toolbarType === 'static' && typeof tooltip !== 'function' && showName === tooltip) {
    tooltip = '';
  }
  const renderContent = () => {
    const content = (
      <>
        {icon}
        {showName !== false && <span className="tool-name">{showName || tooltip}</span>}
      </>
    );

    if (tooltipVisible && tooltip) {
      if (typeof tooltip === 'function') {
        const tipNode = tooltip(content);
        if (typeof tipNode === 'string' && tipNode) {
          if (tipNode === showName) return content;
          tooltip = tipNode;
        } else {
          return tipNode;
        }
      }
      return (
        <Tooltip
          content={tooltip}
          direction={tipDirection || (toolbarType === 'static' ? 'left' : 'up')}
          distance={tipDistance}
        >
          {content}
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <ListItem
      className={classnames({
        [name]: name,
        [className]: className,
        active,
        disable,
        [toolbarType]: toolbarType,
      })}
      onClick={() => {
        if (disable) return;
        handler(editor, name, !active);
      }}
      key={name}
      listRef={getRef}
      {...buttonProps}
    >
      {renderContent()}
    </ListItem>
  );
};

const ButtonForToolbar = (props: IButtonForToolbarProps) => {
  const {
    name,
    attrs,
    toolbar,
    active,
    showName: configShowName,
    tooltip: configTooltip,
    editor,
    display,
    toolbarType = 'static',
  } = props;

  const {
    disable = noop,
    active: activeHandler = noop,
    tooltip: defaultTooltip,
    showName: defaultShowName,
    buttonProps = {},
    tooltipProps = {},
    getRef = noop,
  } = toolbar;

  const [tooltipVisible, setTooltipVisible] = useState(true);
  const locale = editor.configurator.getLocaleValue(name);

  const tooltip = getConfigVal([configTooltip, locale.tooltip, defaultTooltip, name]);

  const showName = getConfigVal([configShowName, locale.showName, defaultShowName, tooltip]);

  const isDisable = disable(editor);
  const isActive = activeHandler(editor) || active;

  let icon = toolbar.icon || Icons[name as keyof typeof Icons];
  if (typeof icon === 'function') {
    // TODO: animation is difficult to achieve while using function
    icon = icon(editor, attrs, {
      setTooltipVisible,
      display,
      tooltip,
      toolbarType,
    });
  }

  const generalProps = {
    buttonProps,
    tooltipProps,
    getRef,
    ...props,
    disable: isDisable,
    active: isActive,
    tooltip,
    icon,
    showName,
    toolbarType,
    tooltipVisible,
  };

  return props.display === ToolDisplay.VERTICAL ? renderVertical(generalProps) : renderHorizon(generalProps);
};

export { ButtonForToolbar, getConfigVal };
