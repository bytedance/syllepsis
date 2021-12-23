import './panel.less';
import 'antd/dist/antd.css';

import { Dropdown, Menu } from 'antd';
import cs from 'classnames';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { baseMenu } from './base-btn';
import { AddIcon, ModifyIcon } from './icon';

interface IHoverMenuProps {
  editor: any;
  ready: any;
}

function isRoot(node: HTMLElement) {
  return node && node.nodeType === 1
    && node.classList && node.classList.contains('ProseMirror');
}

function isTableNode(node: HTMLElement) {
  return node && node.nodeType === 1 && node.tagName === 'TABLE';
}

function getValidParaNode(node: Element) {
  let aimNode: any = node;
  let nextNode: any = node.parentElement;
  let isEnd = false;
  let isTable = false;
  if (isRoot(aimNode)) {
    return { node: null, isTable };
  }
  while (nextNode && !isEnd) {
    isTable = isTableNode(aimNode);
    if (isRoot(nextNode) || isTable) {
      isEnd = true;
    } else {
      aimNode = nextNode;
      nextNode = nextNode.parentElement;
    }
  }
  return {
    node: aimNode,
    isTable,
  };
}

const isScrolling = false;
let currParaNode: Element | null = null;
let menuVisible = false;
let mouseDown = false;

const HoverMenu = (props: IHoverMenuProps) => {
  const { editor, ready } = props;
  const [left, setLeft] = useState(-1);
  const [top, setTop] = useState(-1);
  const [visible, setVisible] = useState(true);
  const [customMenu, setCustomMenu] = useState<any>([]);
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [empty, setEmpty] = useState(true);
  const refHoverDiv = useRef(null);

  function isEmptyNode(node: HTMLElement) {
    if (editor.dynamicPlugins.isCard(node) || isTableNode(node)) {
      return false;
    } else {
      // fix: when editor is empty, node.textContent is Not empty (because placeholder is fake)
      return editor.isEmpty || node.textContent === '';
    }
  }

  // update menu position
  function setMenuPosition(pos: number) {
    if (!Number.isInteger(pos)) {
      return false;
    }

    const { node } = editor.view.domAtPos(pos);
    const result = getValidParaNode(node);
    let paraNode = result.node;
    const isTable = result.isTable;

    // get card root
    if (!paraNode) {
      paraNode = editor.view.nodeDOM(pos);
    }

    if (!paraNode) {
      return false;
    }

    // get index & length
    const currIndex = editor.view.posAtDOM(paraNode);
    let $pos = editor.view.state.doc.resolve(currIndex);
    if ($pos.depth === 0) {
      $pos = $pos.nodeAfter;
      setIndex(currIndex);
      setLength($pos.nodeSize);
    } else {
      setIndex(isTable ? currIndex - 1 : currIndex);
      setLength($pos.parent.nodeSize - 1);
    }

    // render '+' or '=' icon
    const isEmpty = isEmptyNode(paraNode);
    setEmpty(isEmpty);

    const { left, top: currTop } = paraNode.getBoundingClientRect();
    // shouldn't update when pos is same
    if (top === currTop) {
      return false;
    }

    setLeft(left - 32);
    const firstRect = paraNode.getClientRects()[0];
    // appear middle position
    const isCard = paraNode.getAttribute('__syl_tag') === 'true';
    if (firstRect.height && !isCard) {
      setTop(currTop + (firstRect.height - 24) / 2);
    } else {
      setTop(currTop);
    }
    setVisible(true);
    currParaNode = paraNode;
  }

  function handleCLick(eachMenu: any) {
    const { onClick } = eachMenu;
    onClick && onClick(editor, index, length);
  }

  // insert behind
  function handleInsert(eachMenu: any) {
    const { onClick } = eachMenu;
    const realIndex = empty ? index + length - 1 : index + length;
    onClick && onClick(editor, realIndex);
    editor.setSelection({ index: realIndex + 1 });
  }

  function handleMenuVisibleChange(visible: boolean) {
    // update without react
    if (visible && currParaNode && !empty) {
      const hoverDiv = refHoverDiv.current as unknown as HTMLElement;
      const { left, top, width, height } = currParaNode.getBoundingClientRect();
      if (hoverDiv) {
        hoverDiv.style.setProperty('left', left - 4 + 'px');
        hoverDiv.style.setProperty('top', top - 2 + 'px');
        hoverDiv.style.setProperty('width', width + 8 + 'px');
        hoverDiv.style.setProperty('height', height + 4 + 'px');
        hoverDiv.classList.add('active');
      }
    } else {
      const hoverDiv = refHoverDiv.current as unknown as HTMLElement;
      if (hoverDiv && hoverDiv.classList.contains('active')) {
        hoverDiv.classList.remove('active');
      }
    }
    menuVisible = visible;
  }

  // allow append buttons
  useEffect(() => {
    function addHoverMenu(menuInfo: any) {
      customMenu.push(menuInfo);
      customMenu.sort((before: any, after: any) => before.content < after.content ? 1 : -1);
      console.log(customMenu);
      setCustomMenu([...customMenu]);
    }

    editor.on('menu.custom-item', addHoverMenu);
    ready();
    editor.dynamicPlugins.ready('menu.init');
    return () => {
      editor.off('menu.custom-item', addHoverMenu);
    };
  }, []);


  useEffect(() => {
    const handleMouseDown = () => {
      mouseDown = true;
    };
    const handleMouseUp = () => {
      mouseDown = false;
    };
    const throttleMousemove = throttle((event: any) => {
      if (isScrolling || mouseDown || menuVisible) {
        return false;
      }
      const { length } = editor.getSelection();
      if (length > 1) {
        return false;
      }
      const { clientX, clientY } = event;
      const result = editor.view.posAtCoords({ left: clientX, top: clientY });
      if (!result) {
        return false;
      }
      setMenuPosition(result.pos);
    }, 64);
    window.addEventListener('mousedown', handleMouseDown, { capture: true });
    window.addEventListener('mouseup', handleMouseUp, { capture: true });
    window.addEventListener('mousemove', throttleMousemove);
    return () => {
      window.removeEventListener('mousemove', throttleMousemove);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
    };
  }, []);


  useEffect(() => {

    const debounceSelectionChanged = debounce(() => {
      if (isScrolling) {
        return false;
      }
      const { index, length } = editor.getSelection();
      if (length > 1) {
        setVisible(false);
      } else {
        setVisible(true);
        setMenuPosition(index);
      }
    }, 100);

    const hideMenu = (() => {
      setVisible(false);
    });

    window.addEventListener('resize', hideMenu);
    editor.on('selection-change', debounceSelectionChanged);
    return () => {
      window.removeEventListener('resize', hideMenu);
      editor.off('selection-change', debounceSelectionChanged);
    };
  }, []);

  const content = (
    <Menu className={cs('hover-menu')}
      // onMouseMove={(e: Event) => e.stopPropagation()}
          onClick={() => handleMenuVisibleChange(false)}>
      {/* base btn */}
      {
        !empty && <Menu.ItemGroup title='operation'>
          {
            baseMenu.map((eachMenu: any) => {
              const { icon, content } = eachMenu;
              return <Menu.Item key={'base' + content}
                                icon={icon}
                                onClick={() => handleCLick(eachMenu)}>{content}</Menu.Item>;
            })
          }
        </Menu.ItemGroup>
      }
      {/* insert */}
      {
        empty ? <>
            {
              customMenu.map((eachMenu: any) => {
                const { icon, content } = eachMenu;
                return <Menu.Item key={'custom' + content} icon={icon}
                                  onClick={() => handleInsert(eachMenu)}>{content}</Menu.Item>;
              })
            }
          </>
          : customMenu.length > 0 && <Menu.ItemGroup title={'insert below'}>
          {
            customMenu.map((eachMenu: any) => {
              const { icon, content } = eachMenu;
              return <Menu.Item key={'custom' + content} icon={icon}
                                onClick={() => handleInsert(eachMenu)}>{content}</Menu.Item>;
            })
          }
        </Menu.ItemGroup>
      }
    </Menu>
  );

  if (left <= 0 && top <= 0) {
    return null;
  }

  return (
    <>
      <Dropdown overlay={content} trigger={['hover']} onVisibleChange={handleMenuVisibleChange}>
        <div className={cs('hover-menu-btn', { visible })} style={{ left, top }}>
          {
            empty ? <AddIcon /> : <ModifyIcon />
          }
        </div>
      </Dropdown>
      <div className='hover-style' ref={refHoverDiv} />
    </>
  );
};

async function init(editor: any) {
  return new Promise((resolve) => {
    // register tools
    editor.dynamicPlugins.ready('editor.init', () => {
      let wrapper = document.querySelector('.hover-menu-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'hover-menu-wrapper');
        const root = document.querySelector('#editor') as HTMLElement;
        root.appendChild(wrapper);
      }
      ReactDOM.render(<HoverMenu editor={editor} ready={() => {
        resolve('');
      }} />, wrapper);
    });
  });
}

export {
  getValidParaNode,
  init,
  isRoot,
};