import { IconWrapper, IIconProps } from '@icon-park/react/es/runtime';
import React from 'react';

const AddIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zm.45 4.25c.17 0 .3.13.3.3V11h2.95c.17 0 .3.13.3.3v.9a.3.3 0 01-.3.3h-2.95v2.95a.3.3 0 01-.3.3h-.9a.3.3 0 01-.3-.3V12.5H8.3a.3.3 0 01-.3-.3v-.9c0-.17.13-.3.3-.3h2.95V8.05c0-.17.13-.3.3-.3h.9z"
  fillRule="evenodd"/>
  </svg>
));

const CodeIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 13L4 25.4322L16 37" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 13L44 25.4322L32 37" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28 4L21 44" stroke="#333" strokeWidth="4" strokeLinecap="round"/>
  </svg>
));

const CopyIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13 12.4316V7.8125C13 6.2592 14.2592 5 15.8125 5H40.1875C41.7408 5 43 6.2592 43 7.8125V32.1875C43 33.7408 41.7408 35 40.1875 35H35.5163"
      stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path
      d="M32.1875 13H7.8125C6.2592 13 5 14.2592 5 15.8125V40.1875C5 41.7408 6.2592 43 7.8125 43H32.1875C33.7408 43 35 41.7408 35 40.1875V15.8125C35 14.2592 33.7408 13 32.1875 13Z"
      fill="none" stroke="#333" strokeWidth="4" strokeLinejoin="round"/>
  </svg>
));

const CutIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width="14" height="14" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <g>
      <g>
        <rect fillOpacity="0.01" fill="#FFFFFF" x="0" y="0" width="48" height="48" strokeWidth="4" stroke="none"
              fillRule="evenodd"/>
        <circle stroke="#333" strokeWidth="4" fill="none" fillRule="nonzero" strokeLinejoin="round" cx="11"
                cy="37" r="5"/>
        <circle stroke="#333" strokeWidth="4" fill="none" fillRule="nonzero" strokeLinejoin="round" cx="37"
                cy="37" r="5"/>
        <polyline stroke="#333" strokeWidth="4" strokeLinecap="round"
                  transform="translate(24.938660, 22.892210) rotate(-150.000000) translate(-24.938660, -22.892210) "
                  points="24.9585851 3.80404093 24.9187342 7.98037837 24.9187342 41.9803784" fill="none"
                  fillRule="evenodd"/>
        <polyline stroke="#333" strokeWidth="4" strokeLinecap="round"
                  transform="translate(23.061077, 22.794133) rotate(-30.000000) translate(-23.061077, -22.794133) "
                  points="23.0866842 3.61900443 23.0866842 37.6190044 23.0354696 41.9692624" fill="none"
                  fillRule="evenodd"/>
      </g>
    </g>
  </svg>
));

const DeleteIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" fill="white" fillOpacity="0.01"/>
    <path d="M9 10V44H39V10H9Z" fill="none" stroke="#333" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M20 20V33" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28 20V33" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 10H44" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10L19.289 4H28.7771L32 10H16Z" fill="none" stroke="#333" strokeWidth="4" strokeLinejoin="round"/>
  </svg>
));

const ModifyIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22a10 10 0 100-20 10 10 0 000 20zm0-1.5a8.5 8.5 0 110-17 8.5 8.5 0 010 17zM8.3 9h7.4c.17 0 .3.13.3.3v.9a.3.3 0 01-.3.3H8.3a.3.3 0 01-.3-.3v-.9c0-.17.13-.3.3-.3zm0 4.5h7.4c.17 0 .3.13.3.3v.9a.3.3 0 01-.3.3H8.3a.3.3 0 01-.3-.3v-.9c0-.17.13-.3.3-.3z"
      fillRule="evenodd"/>
  </svg>
));


export {
  AddIcon,
  CodeIcon,
  CopyIcon,
  CutIcon,
  DeleteIcon,
  ModifyIcon
}