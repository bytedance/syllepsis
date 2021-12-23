import './index.less';

import React, { useEffect, useRef, useState } from 'react';

interface IMenuProps {
  onVisibleChange: (boolean) => void,
  children: React.ReactElement,
  content: React.ReactElement,
}

const Dropdown = (props: IMenuProps) => {

  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const { onVisibleChange, children, content } = props;
  const childRef = useRef(null);
  const dropdownRef = useRef(null);
  let timeoutKey = null;

  useEffect(() => {
    // setTime to effect animate
    setTimeout(() => {
      setActive(visible)
    }, 0)
  }, [visible])

  const handleMouseEnter = () => {
    setVisible(true);
    onVisibleChange(true);
    timeoutKey && clearTimeout(timeoutKey);
    if (childRef.current) {
      const { left, top, height } = childRef.current.getBoundingClientRect();
      setLeft(left);
      setTop(top + height);
    }
  }

  const handleMouseOut = (event: React.MouseEvent) => {
    timeoutKey && clearTimeout(timeoutKey);
    timeoutKey = setTimeout(() => {
      setActive(false);
      // setTimout to effect animate
      setTimeout(() => {
        setVisible(false);
        onVisibleChange(false);
      }, 300);
    }, 100);
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
              onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseOut={handleMouseOut} onMouseOver={handleMouseEnter}>
    { copyChildren }
    <div className={`dropdown-content ${active ? 'active' : ''}`}>
      { content }
    </div>
  </div>
}

export {
  Dropdown
}