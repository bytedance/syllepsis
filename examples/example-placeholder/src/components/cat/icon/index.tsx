import { IconWrapper, IIconProps } from '@icon-park/react/es/runtime';
import React from 'react';

const ExperimentIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width='14' height='14' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M12 4H36' stroke='#333' strokeWidth='4' strokeLinecap='round' />
    <path d='M10.7768 30L18.019 15.0386V4H30.0282V15.0386L37.246 30' stroke='#333' strokeWidth='4'
          strokeLinecap='round' strokeLinejoin='round' />
    <path
      d='M7.79426 43.673C6.16736 42.8855 5.4869 40.9282 6.27442 39.3013L10.7768 30C10.7768 30 18 35 24 30C30 25 37.246 30 37.246 30L41.7351 39.3052C41.9491 39.7488 42.0602 40.2348 42.0602 40.7273C42.0602 42.5347 40.595 44 38.7875 44H9.22018C8.72629 44 8.2388 43.8882 7.79426 43.673Z'
      fill='none' stroke='#333' strokeWidth='4' strokeLinejoin='round' />
  </svg>
));

export {
  ExperimentIcon,
};