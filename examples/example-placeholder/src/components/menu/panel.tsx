import './panel.less';
import 'antd/dist/antd.css';

import { Dropdown, Menu } from 'antd';
import cs from 'classnames';
import lodash from 'lodash';
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
    isTable
  };
}

const isScrolling = false;
let currParaNode: Element | null = null;
let menuVisible = false;

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

  // 允许通过事件往该方法添加按钮
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
    }
  }, []);

  // 鼠标移动
  useEffect(() => {
    const throttleMousemove = lodash.throttle((event: any) => {
      if (isScrolling) {
        return false;
      }
      if (menuVisible) {
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
    window.addEventListener('mousemove', throttleMousemove);
    return () => {
      window.removeEventListener('mousemove', throttleMousemove);
    }
  }, []);

  // 选区变化
  useEffect(() => {
    // 光标变更时触发方式
    const debounceSelectionChanged = lodash.debounce(() => {
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
    })

    window.addEventListener('resize', hideMenu);
    editor.on('selection-change', debounceSelectionChanged);
    return () => {
      window.removeEventListener('resize', hideMenu);
      editor.off('selection-change', debounceSelectionChanged);
    }
  }, []);

  // 根据文本位置更新按钮位置和状态
  function setMenuPosition(pos: number) {
    if (!Number.isInteger(pos)) {
      return false;
    }
    // 获取最外层的位置（一般为段落）
    const { node } = editor.view.domAtPos(pos);
    const result = getValidParaNode(node);
    let paraNode = result.node;
    const isTable = result.isTable;

    // 点击在Card上时，通过nodeDOM才可以拿到Card的DOM
    if (!paraNode) {
      paraNode = editor.view.nodeDOM(pos);
    }

    if (!paraNode) {
      return false;
    }

    // 获取选区的索引、长度
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

    // 判断是显示+还是其它图标
    const isEmpty = isEmptyNode(paraNode);
    setEmpty(isEmpty);

    const { left, top: currTop } = paraNode.getBoundingClientRect();
    // 位置无变化时，无需更新
    if (top === currTop) {
      return false;
    }

    setLeft(left - 32);
    const firstRect = paraNode.getClientRects()[0];
    // 尽可能出现在当前段落中部的位置
    const isCard = paraNode.getAttribute('__syl_tag') === 'true'
    if (firstRect.height && !isCard) {
      setTop(currTop + (firstRect.height - 24) / 2);
    } else {
      setTop(currTop);
    }
    setVisible(true);
    currParaNode = paraNode;
  }

  // 点击按钮
  function handleCLick(eachMenu: any) {
    const { onClick } = eachMenu;
    onClick && onClick(editor, index, length);
  }

  // 下方插入
  function handleInsert(eachMenu: any) {
    const { onClick } = eachMenu;
    const realIndex = empty ? index + length - 1 : index + length
    onClick && onClick(editor, realIndex);
    editor.setSelection({ index: realIndex + 1 });
  }

  function isEmptyNode(node: HTMLElement) {
    if (editor.dynamicPlugins.isCard(node) || isTableNode(node)) {
      return false;
    } else {
      // editor是空的时候，会有placeholder，textContent不为空
      return editor.isEmpty || node.textContent === '';
    }
  }

  function handleMenuVisibleChange(visible: boolean) {
    // 此处更新不走React
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

  const content = (
    <Menu className={cs('hover-menu')}
          // onMouseMove={(e: Event) => e.stopPropagation()}
          onClick={() => handleMenuVisibleChange(false)}>
      {/* 基本按钮 */}
      {
        !empty && <Menu.ItemGroup title="基本操作">
          {
            baseMenu.map((eachMenu: any) => {
              const { icon, content } = eachMenu;
              return <Menu.Item key={'base' + content}
                                icon={icon}
                                onClick={() => handleCLick(eachMenu)}>{content}</Menu.Item>
            })
          }
        </Menu.ItemGroup>
      }
      {/* 插入 */}
      {
        empty ? <>
            {
              customMenu.map((eachMenu: any) => {
                const { icon, content } = eachMenu;
                return <Menu.Item key={'custom' + content} icon={icon}
                                  onClick={() => handleInsert(eachMenu)}>{content}</Menu.Item>
              })
            }
          </>
          : customMenu.length > 0 && <Menu.ItemGroup title={'下方插入'}>
          {
            customMenu.map((eachMenu: any) => {
              const { icon, content } = eachMenu;
              return <Menu.Item key={'custom' + content} icon={icon}
                                onClick={() => handleInsert(eachMenu)}>{content}</Menu.Item>
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
            empty ? <AddIcon/> : <ModifyIcon/>
          }
        </div>
      </Dropdown>
      <div className="hover-style" ref={refHoverDiv}/>
    </>
  );
};

async function init(editor: any) {
  return new Promise((resolve) => {
    // 注册工具栏
    editor.dynamicPlugins.ready('editor.init', () => {
      let wrapper = document.querySelector('.hover-menu-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'hover-menu-wrapper');
        const root = document.querySelector('#editor') as HTMLElement;
        root.appendChild(wrapper);
      }
      ReactDOM.render(<HoverMenu editor={editor} ready={() => {resolve('')}}/>, wrapper);
    });
  })
}

export {
  getValidParaNode,
  init,
  isRoot
}