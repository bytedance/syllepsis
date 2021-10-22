import React from 'react';

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

export { IButtonProps, IconButton };
