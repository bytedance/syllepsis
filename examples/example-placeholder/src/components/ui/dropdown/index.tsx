import './index.less';

import React, { useRef, useState } from 'react';

interface IMenuProps {
  onVisibleChange: (boolean) => void,
  children: React.ReactElement,
  content: React.ReactElement,
}


const Dropdown = (props: IMenuProps) => {

  const [visible, setVisible] = useState(false);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const { onVisibleChange, children, content } = props;
  const childRef = useRef(null);
  const dropdownRef = useRef(null);
  let timeoutKey = null;

  const handleMouseEnter = () => {
    setVisible(true);
    onVisibleChange(true);
    timeoutKey && clearTimeout(timeoutKey);
    if (childRef.current) {
      const { left, top, width, height } = childRef.current.getBoundingClientRect();
      setLeft(left + width + 20);
      setTop(top + height);
    }
  }
  const handleMouseOut = (event: React.MouseEvent) => {
    console.log(event.target);
    if (!dropdownRef.current.contains(event.target)) {
      timeoutKey && clearTimeout(timeoutKey);
      timeoutKey = setTimeout(() => {
        setVisible(false);
        onVisibleChange(false);
      }, 100);
    }
  }
  const handleClick = () => {
    setVisible(false);
    onVisibleChange(false);
  }

  const child = React.Children.only(children);
  const copyChildren = React.cloneElement(child, {
    ref: childRef,
  });

  return <div className={`dropdown ${visible ? 'visible' : ''}`} style={{ left, top }} ref={dropdownRef}
              onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseOut={handleMouseOut}>
    { copyChildren }
    {
      visible &&
      <div className="dropdown-content">
        { content }
      </div>
    }
  </div>
}

export {
  Dropdown
}