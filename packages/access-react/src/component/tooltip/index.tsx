import classnames from 'classnames';
import React from 'react';
import RTooltip, { TooltipProps } from 'react-tooltip-lite';

interface ITooltipProps extends TooltipProps {
  children: any;
  getRef?: (node: any) => any;
}

const TOOLTIP_CLS = 'syl-tooltip';

const Tooltip = ({ children, content, getRef, tipContentClassName = '', ...rest }: ITooltipProps) => (
  <RTooltip
    content={content}
    arrowSize={6}
    useDefaultStyles={false}
    tipContentClassName={classnames(TOOLTIP_CLS, {
      [tipContentClassName]: tipContentClassName,
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

export { ITooltipProps, Tooltip, TOOLTIP_CLS };
