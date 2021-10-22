import classnames from 'classnames';
import React from 'react';

interface IListItemProps extends React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> {
  children?: any;
  className?: string;
  listRef?: (node: any) => any;
}

const ListItem = ({ children, className, listRef, ...rest }: IListItemProps) => (
  <li
    className={classnames('syl-toolbar-tool-horizon', {
      [className as string]: className,
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
      [className as string]: className,
    })}
    ref={getRef}
    {...rest}
  >
    {children}
  </ol>
);

export { IListItemProps, List, ListItem };
