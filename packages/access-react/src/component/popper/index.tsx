import classnames from 'classnames';
import React from 'react';
import RTooltip, { TooltipProps } from 'react-tooltip-lite';

interface ITooltipProps extends TooltipProps {
  children: any;
  getRef?: (node: any) => any;
}

const POPPER_CLS = 'syl-popper';

interface IPopperProps extends ITooltipProps {}

const Popper = ({ children, content, tipContentClassName, isOpen, getRef, ...rest }: IPopperProps) => (
  <RTooltip
    content={content}
    arrow={false}
    useDefaultStyles={false}
    useHover={false}
    tipContentClassName={classnames(POPPER_CLS, {
      [tipContentClassName || '']: tipContentClassName,
      visible: isOpen,
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

export { IPopperProps, Popper, POPPER_CLS };
