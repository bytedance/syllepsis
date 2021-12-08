import { IconWrapper, IIconProps } from '@icon-park/react/es/runtime';
import React from 'react';

const AimIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" fill="white" fillOpacity="0.01"/>
    <circle cx="24" cy="24" r="20" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24 37V44V37Z" fill="none"/>
    <path d="M24 37V44" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M36 24H44H36Z" fill="none"/>
    <path d="M36 24H44" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M4 24H11H4Z" fill="none"/>
    <path d="M4 24H11" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24 11V4V11Z" fill="none"/>
    <path d="M24 11V4" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

const DownloadIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" fill="white" fillOpacity="0.01"/>
    <path d="M6 24.0083V42H42V24" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M33 23L24 32L15 23" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23.9917 6V32" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

const EditIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" fill="white" fillOpacity="0.01"/>
    <path d="M7 42H43" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 26.7199V34H18.3172L39 13.3081L31.6951 6L11 26.7199Z" fill="none" stroke="#333" strokeWidth="4"
          strokeLinejoin="round"/>
  </svg>
));

const FlowIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" fill="white" fillOpacity="0.01"/>
    <rect x="17" y="6" width="14" height="9" fill="none" stroke="#333" strokeWidth="4" strokeLinejoin="round"/>
    <rect x="6" y="33" width="14" height="9" fill="none" stroke="#333" strokeWidth="4" strokeLinejoin="round"/>
    <rect x="28" y="33" width="14" height="9" fill="none" stroke="#333" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M24 16V24" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 33V24H35V33" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

export {
  AimIcon,
  DownloadIcon,
  EditIcon,
  FlowIcon
}