import { IconWrapper, IIconProps } from '@icon-park/react/es/runtime';
import React from 'react';

const CodeIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width='14' height='14' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M16 13L4 25.4322L16 37' stroke='#333' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M32 13L44 25.4322L32 37' stroke='#333' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M28 4L21 44' stroke='#333' strokeWidth='4' strokeLinecap='round' />
  </svg>
));

export {
  CodeIcon,
};