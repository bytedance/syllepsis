import classnames from 'classnames';
import React from 'react';
import RTooltip, { TooltipProps } from 'react-tooltip-lite';

interface ITooltipProps extends TooltipProps {
  children: any;
  getRef?: (node: any) => any;
}

const TOOLTIP_CLS = 'syl-tooltip';
const POPPER_CLS = 'syl-popper';

const Tooltip = ({ children, content, getRef, tipContentClassName = '', ...rest }: ITooltipProps) => (
  <RTooltip
    content={content}
    arrowSize={6}
    useDefaultStyles={false}
    tipContentClassName={classnames(TOOLTIP_CLS, {
      [tipContentClassName]: tipContentClassName
    })}
    padding="8px 12px"
    zIndex={1100}
    eventOff={'onClick'}
    ref={t => {
      getRef && getRef(t);
    }}
    {...rest}
  >
    {children}
  </RTooltip>
);

interface IPopperProps extends ITooltipProps {}

const Popper = ({ children, content, tipContentClassName, isOpen, getRef, ...rest }: IPopperProps) => (
  <RTooltip
    content={content}
    arrow={false}
    useDefaultStyles={false}
    useHover={false}
    tipContentClassName={classnames(POPPER_CLS, {
      [tipContentClassName || '']: tipContentClassName,
      visible: isOpen
    })}
    padding="0"
    direction="down-start"
    zIndex={1002}
    isOpen={isOpen}
    ref={t => getRef && getRef(t)}
    {...rest}
  >
    {children}
  </RTooltip>
);

interface IButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  children?: any;
  color?: string;
  buttonRef?: (node: HTMLButtonElement) => any;
}

const IconButton = ({ children, buttonRef, ...rest }: IButtonProps) => (
    <button className="syl-toolbar-button" ref={buttonRef} type="button" {...rest}>
      {children}
    </button>
  );

interface IListItemProps extends React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> {
  children?: any;
  className?: string;
  listRef?: (node: any) => any;
}

const ListItem = ({ children, className, listRef, ...rest }: IListItemProps) => (
  <li
    className={classnames('syl-toolbar-tool-horizon', {
      [className as string]: className
    })}
    ref={listRef}
    {...rest}
  >
    <button className="syl-toolbar-tool-horizon-content" type="button">
      {children}
    </button>
  </li>
);

interface IListProps extends React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement> {
  children: any;
  className?: string;
  getRef?: any;
}

const List = ({ children, className, getRef, ...rest }: IListProps) => (
  <ol
    className={classnames('syl-toolbar-menu', {
      [className as string]: className
    })}
    ref={getRef}
    {...rest}
  >
    {children}
  </ol>
);

export {
  IButtonProps,
  IconButton,
  IListItemProps,
  IPopperProps,
  ITooltipProps,
  List,
  ListItem,
  Popper,
  POPPER_CLS,
  Tooltip,
  TOOLTIP_CLS };
