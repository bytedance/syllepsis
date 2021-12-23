import { IconWrapper, IIconProps } from '@icon-park/react/es/runtime';
import React from 'react';

const ColumnIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width='18' height='18' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M39.3 6H8.7C7.20883 6 6 7.20883 6 8.7V39.3C6 40.7912 7.20883 42 8.7 42H39.3C40.7912 42 42 40.7912 42 39.3V8.7C42 7.20883 40.7912 6 39.3 6Z'
      stroke='#333' strokeWidth='4' />
    <path d='M24 6L24 42' stroke='#333' strokeWidth='4' strokeLinecap='square' />
  </svg>
));

const DeleteIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width='18' height='18' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='24' cy='24' r='20' fill='none' stroke='#333' strokeWidth='4' />
    <path d='M17 31L31 17' stroke='#333' strokeWidth='4' strokeLinecap='square' strokeLinejoin='round' />
    <path d='M19 19L17 17' stroke='#333' strokeWidth='4' strokeLinecap='square' strokeLinejoin='round' />
    <path d='M31 31L29 29' stroke='#333' strokeWidth='4' strokeLinecap='square' strokeLinejoin='round' />
  </svg>
));

const GridIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width='18' height='18' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect x='5' y='5' width='38' height='38' rx='2' stroke='#333' strokeWidth='4' strokeLinecap='square'
          strokeLinejoin='round' />
    <path d='M24 5V43' stroke='#333' strokeWidth='4' strokeLinecap='square' strokeLinejoin='round' />
    <path d='M5 24H43' stroke='#333' strokeWidth='4' strokeLinecap='square' strokeLinejoin='round' />
  </svg>
));

const TodoIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width='14' height='14' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='48' height='48' fill='white' fillOpacity='0.01' />
    <path d='M20 10H44' stroke='#333' strokeWidth='4' strokeLinecap='square' strokeLinejoin='round' />
    <path d='M20 24H44' stroke='#333' strokeWidth='4' strokeLinecap='square' strokeLinejoin='round' />
    <path d='M20 38H44' stroke='#333' strokeWidth='4' strokeLinecap='square' strokeLinejoin='round' />
    <circle cx='8' cy='24' r='4' fill='none' stroke='#333' strokeWidth='4' strokeLinecap='square'
            strokeLinejoin='round' />
    <circle cx='8' cy='38' r='4' fill='none' stroke='#333' strokeWidth='4' strokeLinecap='square'
            strokeLinejoin='round' />
    <path d='M4 10L7 13L13 7' stroke='#333' strokeWidth='4' strokeLinecap='square' strokeLinejoin='round' />
  </svg>
));


export {
  ColumnIcon,
  DeleteIcon,
  GridIcon,
  TodoIcon,
};