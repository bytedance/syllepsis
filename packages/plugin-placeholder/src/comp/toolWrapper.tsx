import './toolWrapper.css';

import { Close } from '@icon-park/react';
import { SylApi } from '@syllepsis/adapter';
import cs from 'classnames';
import debounce from 'lodash.debounce';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { updateKeydown } from '../mvc/controller';
import { getInnerWidth } from '../mvc/mask';

let preWidth = 0;
let preHeight = 0;

interface ToolWrapperProps {
  id: string,
  editor: SylApi,
  contentRef: any,
  resizeBox: any,
  getPos: any,
  className: string,
  width: number,
  height: number,
  selected: boolean,
  style: any,
  fullscreen: boolean | undefined,
  adapt: boolean,
  ratio?: number,
  onFullscreen: (isFullscreen: boolean) => void,
  onResize: (options: { width: number, height: number }, updateData?: boolean) => void,
  onClose?: (event: any) => void,
  children: React.ReactChild
}

interface IToolsConfig {
  content?: string,
  icon?: any,
  onClick: (api: any) => void
}

const cacheContentRefHandler: {
  [key: string]: any
} = {};


function getContentRefHandler(id: string) {
  if (cacheContentRefHandler[id]) {
    return cacheContentRefHandler[id].current;
  }
  return null;
}

const ToolWrapper = React.forwardRef((props: ToolWrapperProps, ref: any) => {

  const {
    id, editor, contentRef, resizeBox, getPos, className,
    width, height, selected, style, children, ratio,
    fullscreen, adapt, onResize, onFullscreen: toggleFullscreen, onClose
  } = props;

  const [isFullscreen, setFullscreen] = useState(false);
  const [hover, setHover] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getBoundingClientRect: () => wrapperRef?.current?.getBoundingClientRect(),
  }));

  // update size
  useEffect(() => {
    const calcSizeByRatio = () => {
      if (ratio) {
        const ratioWidth = getInnerWidth();
        const ratioHeight = ratioWidth * ratio;
        onResize({
          width: ratioWidth,
          height: ratioHeight
        })
      }
    }
    if (ratio) {
      window.addEventListener('resize', calcSizeByRatio);
    }
    return () => {
      if (ratio) {
        window.removeEventListener('resize', calcSizeByRatio);
      }
    }
  })

  const update = debounce(() => {
    if (contentWrapperRef.current) {
      let adaptWidth = 0;
      const rect = contentWrapperRef.current.getBoundingClientRect();
      // adaptWidth = rect.width;
      adaptWidth = getInnerWidth();

      onResize({
        width: adaptWidth + 2,
        height: rect.height + 2
      })
    }
  }, 60);

  // observe size changed
  useEffect(() => {
    if (adapt && contentWrapperRef.current) {
      const resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(contentWrapperRef.current);
      window.addEventListener('resize', update);
      update();
      return () => {
        if (contentWrapperRef.current) {
          resizeObserver.unobserve(contentWrapperRef.current);
          window.removeEventListener('resize', update);
        }
      }
    }
  }, []);

  const onFocus = (event: any) => {
    const pos = getPos();
    const { index, length } = editor.getSelection();
    // only update when selection changed
    if (index !== pos || length !== 1) {
      editor.setSelection({ index: pos, length: 1, scrollIntoView: false });
    }
  }

  const onClick = () => {
    const pos = getPos();
    editor.setSelection({ index: pos, length: 1, scrollIntoView: false });
  }

  const handleCopy = (event: any) => {
    event.stopPropagation();
  }

  const handleClose = (event: any) => {
    if (onClose) {
      onClose(event);
      event.stopPropagation();
      event.preventDefault();
    }
  }

  const handleKeyDown = (event: any) => {
    updateKeydown(event.target);
    event.stopPropagation();
  }

  const handleKeyPress = (event: any) => {
    event.stopPropagation();
  }

  function onFullscreen(event?: any) {
    preWidth = width;
    preHeight = height;
    setFullscreen(!isFullscreen);
    onResize({ width: window.innerWidth, height: window.innerHeight });
    editor.disable();
    toggleFullscreen(true);
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  let timeout: NodeJS.Timeout | null = null;

  function handleMouseEnter() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    setHover(true);
  }

  function handleMouseLeave() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      setHover(false);
    }, 300);
  }

  function onOffscreen(event?: any) {
    setFullscreen(false);
    onResize({ width: preWidth, height: preHeight });
    editor.enable();
    toggleFullscreen(false);
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  let toolsConfig = [];

  if (contentRef) {
    cacheContentRefHandler[id] = contentRef;
  }

  if (contentRef && contentRef.current) {
    if (contentRef.current.getActiveTools) {
      toolsConfig = contentRef.current.getActiveTools();
    }
  }

  const api = {
    fullscreen: (active: boolean) => {
      if (active) {
        onFullscreen();
      } else {
        onOffscreen();
      }
    }
  }

  // inject props
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { api });
    }
  });

  return (
    <>
      <div id={id} className={cs('placeholder-wrapper', className, { 'fullscreen': isFullscreen, 'selected': selected })}
           ref={wrapperRef} style={style} onFocus={onFocus} onClick={onClick}
           onMouseEnter={handleMouseEnter}
           onMouseLeave={handleMouseLeave}
           onCopy={handleCopy} onKeyDown={handleKeyDown} onKeyPress={handleKeyPress}>
        {/* close btn */}
        {
          onClose && !isFullscreen &&
          <button className="close" onClick={handleClose} data-ignore-adapt={true}>
            <Close theme="outline" size="12" fill="#fff"/>
          </button>
        }
        {/* normal btn */}
        {
          (isFullscreen || hover) && !!fullscreen && toolsConfig.length > 0 &&
          <div className="btn-wrapper" data-ignore-adapt={true}
               onMouseEnter={handleMouseEnter}
               onMouseLeave={handleMouseLeave}>
            {
              toolsConfig.map((eachConfig: IToolsConfig, index: number) => {
                const { content, icon, onClick } = eachConfig;
                return <button key={index} onClick={(event: any) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onClick(event);
                }}>
                  {icon && <span className="icon">{icon}</span>}
                  {content && <label className="text">{content}</label>}
                </button>
              })
            }
          </div>
        }
        {/* fullscreen btn */}
        {
          fullscreen && isFullscreen &&
          <div className="btn-fullscreen-wrapper" data-ignore-adapt={true}>
            <button className="placeholder-offscreen" onClick={onOffscreen}>
              <Close theme="outline" size="24" fill="#333"/>
            </button>
          </div>
        }
        <div className={cs('content', { 'full': !adapt })} ref={contentWrapperRef}>
          {childrenWithProps}
          {resizeBox}
        </div>
      </div>
      {/* fullscreen placeholder */}
      {isFullscreen && <div style={{ width: preWidth, height: preHeight }}/>}
    </>
  );
})

export {
  getContentRefHandler,
  ToolWrapper
};
