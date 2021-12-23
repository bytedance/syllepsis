import { EventChannel, LocalEvent } from '@syllepsis/adapter';
import cs from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ResizeBox } from '../comp/resizeable';
import { ToolWrapper } from '../comp/toolWrapper';
import { deepCopy } from '../helper';
import { TRetry } from '../helper/register';
import { IDynamicSylApi } from './schema';
import { getData, setData } from './store';
import { IPlaceholderCompProps, IPlaceholderData, loadOrRenderType, unmountType } from './types';

const DEFAULT_HEIGHT = 200;

const Placeholder = (props: IPlaceholderCompProps, ref: any) => {
  const { selected, text, isError, onClick } = props;
  const { width, height } = props;

  return (
    <div className={cs('placeholder', { selected, 'is-error': isError })}
         style={{ width, height }} onClick={onClick}>
      <div className="placeholder-text">{text}</div>
    </div>
  )
};

function trans2Number(number: string | number | undefined) {
  if (typeof number === 'string') {
    return parseInt(number);
  } else if (!number) {
    return 0
  }
  return number;
}

const useUpdate = () => {
  const [, setState] = useState(0);
  return useCallback(() => {
    setState((num: number): number => num + 1);
  }, []);
};

function Loading() {
  return <span className="loading"/>
}

function getInnerWidth() {
  const container = document.querySelector('.ProseMirror') as HTMLElement;
  const style = window.getComputedStyle(container);
  const paddingLeft = parseInt(style.paddingLeft);
  const paddingRight = parseInt(style.paddingRight);
  const borderWidth = 1;
  const width = container.getBoundingClientRect().width - paddingLeft - paddingRight - borderWidth * 2;
  return width;
}

function PlaceholderMask(props: {
  editor: IDynamicSylApi;
  attrs: IPlaceholderData;
  getPos: () => number;
}) {
  const { editor, attrs, getPos } = props;
  const { id, name, typo, able, cycle = {} } = attrs.meta;
  const width = trans2Number(typo?.width);
  const height = trans2Number(typo?.height);
  const ratio = trans2Number(typo?.ratio);
  const cardData = deepCopy(attrs);
  const { data } = cardData;
  const [selected, setSelected] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [realWidth, setRealWidth] = useState(0);
  const [realHeight, setRealHeight] = useState(0);
  const [maxWidth, setMaxWidth] = useState(10000);
  const [render, setRender] = useState(false);
  const [wrapRef, setWrapRef] = useState<Element>();
  const tlRef = useRef<any>();
  const contentRef = useRef();
  const container = document.querySelector('.ProseMirror');
  const forceUpdate = useUpdate();
  const realCycle = {
    load: cycle.load || loadOrRenderType.INIT,
    render: cycle.render || loadOrRenderType.INIT,
    unmount: cycle.unmount || unmountType.NEVER
  }

  if (realCycle.load > realCycle.render) {
    realCycle.render = realCycle.load;
    console.warn(`plugin ${name} load error，load should exec early than render`);
  }

  useEffect(() => {
    if (tlRef.current) {
      setWrapRef(tlRef.current);
    }
  }, [tlRef, container]);

  function nextCycle(time: loadOrRenderType) {
    if (realCycle.load === time) {
      editor.dynamicPlugins.register.register(name, editor).then(() => {
        if (realCycle.render === time) {
          setRender(true);
        }
      }).catch(() => {
        console.error('do not support', name);
      });
    }
  }

  // view port
  function isCompVisible() {
    if (wrapRef && container) {
      const rect = wrapRef.getBoundingClientRect();
      if (rect) {
        const { top, bottom } = rect;
        const { top: wrapperTop, bottom: wrapperBottom } = container.getBoundingClientRect();
        const offsetTop = wrapperTop;
        const offsetBottom = wrapperBottom;
        // just depend on scroll-y
        return (top > offsetTop && top < offsetBottom) || (bottom > offsetTop && bottom < offsetBottom);
      }
    }
  }

  const throttleIsCompVisible = isCompVisible;

  // scroll when visible
  function toggleVisible() {
    const visible = throttleIsCompVisible();
    if (visible === true) {
      nextCycle(loadOrRenderType.VISIBLE);
    } else if (visible === false) {
      // 不可见时，及时注销
      if (render && realCycle?.unmount === unmountType.INVISIBLE) {
        setRender(false);
      }
    }
  }

  useEffect(() => {
    nextCycle(loadOrRenderType.INIT);
    toggleVisible();
    // only listen event after render
    if (realCycle?.load === loadOrRenderType.VISIBLE ||
      realCycle?.render === loadOrRenderType.VISIBLE ||
      realCycle?.unmount === unmountType.INVISIBLE) {
      container?.addEventListener('scroll', toggleVisible);
      return () => {
        container?.removeEventListener('scroll', toggleVisible);
      }
    }
  }, []);

  // init data
  useEffect(() => {
    if (able?.matcher) {
      const matcher = getData('matcher') as any || {};
      matcher[able.matcher] = attrs;
      setData('matcher', matcher)
    }
  }, [able?.matcher, attrs]);

  const update = useCallback((_data: any) => {
    if (_data) {
      const isHistory = able?.history;
      const nextCardData = isHistory ? deepCopy(cardData) : cardData;
      if (typeof _data === 'string') {
        nextCardData.data = _data;
      } else if (Array.isArray(_data)) {
        nextCardData.data = [..._data];
      } else if (typeof _data === 'object') {
        nextCardData.data = deepCopy(_data);
      } else {
        console.error('params error: data should be string or object', _data);
      }
      // update card attrs
      const index = getPos();
      editor?.updateCardAttrs(index, nextCardData, { merge: !isHistory });
      editor?.setSelection({ index, length: 1 });
      if (!isHistory) {
        editor.emit(LocalEvent.TEXT_CHANGED);
      }
    }
  }, [cardData, editor]);

  const handleSelectionChanged = useCallback((event) => {
    const selection = editor.getSelection();
    // render selected border
    const pos = getPos();
    const isSelectCard = selection.anchor === pos;
    setSelected(isSelectCard);
  }, [editor, getPos]);

  useEffect(() => {
    editor.on(EventChannel.LocalEvent.ON_CHANGE, handleSelectionChanged);
    editor.on(
      EventChannel.LocalEvent.SELECTION_CHANGED,
      handleSelectionChanged
    );
    return () => {
      editor.off(EventChannel.LocalEvent.ON_CHANGE, handleSelectionChanged);
      editor.off(
        EventChannel.LocalEvent.SELECTION_CHANGED,
        handleSelectionChanged
      );
    };
  }, [editor, handleSelectionChanged]);

  // update placeholder width size
  useEffect(() => {
    const updateMaxWidth = () => {
      setMaxWidth(getInnerWidth());
    }
    updateMaxWidth();
    window.addEventListener('resize', updateMaxWidth);
    return () => {
      window.removeEventListener('resize', updateMaxWidth);
    }
  }, []);

  // calc init width
  useEffect(() => {
    let initWidth = width;
    let initHeight = height;
    if (!width) {
      // use container width when params width not assign
      initWidth = getInnerWidth();
    }
    if (!initHeight) {
      if (ratio) {
        // use ratio when params height not assign
        initHeight = initWidth * ratio;
      } else {
        initHeight = DEFAULT_HEIGHT;
      }
    }
    setRealWidth(initWidth);
    setRealHeight(initHeight);
  }, []);

  const onResize = useCallback((options: { width?: number, height: number }, updateData?: boolean) => {
    let { width: toWidth, height: toHeight } = options;
    const maxWidth = getInnerWidth();
    toHeight = Math.max(1, toHeight);
    toWidth = toWidth || maxWidth;
    if (width !== toWidth || height !== toHeight) {
      setRealWidth(toWidth);
      setRealHeight(toHeight);
      if (updateData === true) {
        const nextCardData = deepCopy(cardData);
        nextCardData.meta.typo = Object.assign(nextCardData.meta.typo, options);
        const index = getPos();
        editor?.updateCardAttrs(index, nextCardData);
        editor?.setSelection({ index, length: 1 });
      }
    }
  }, [cardData, editor]);

  const onClose = () => {
    const pos = getPos();
    editor.deleteCard(pos);
    editor.setSelection({ index: pos });
  }

  const handlerRef = (handler: any) => {
    if (handler) {
      if (!contentRef.current) {
        contentRef.current = handler;
        forceUpdate();
      } else {
        contentRef.current = handler;
      }
    }
  };

  const lazyCompLoader = editor.dynamicPlugins.register.getLazyComponentLoader(name);

  // render component
  const RenderComponent = useMemo(() =>
      lazyCompLoader ? lazyCompLoader(() =>
          // loading
          (<Placeholder selected={selected} text={<Loading/>}/>)
        , (props: { retry: TRetry }) =>
          // load error
          (<Placeholder isError selected={selected} text="load error" onClick={() => {
            props.retry();
          }}/>)
        , render) : null
    , [editor, render]);

  const content = RenderComponent && render ?
    <RenderComponent ref={handlerRef}
                     selected={selected} fullscreen={fullscreen}
                     style={{ width: realWidth, height: realHeight }}
                     data={data} editor={editor} update={update} resize={onResize}/>
    : <Placeholder selected={selected} text={render ? `unSupport plugin「${name}」` : <Loading/>}
                   onClick={() => nextCycle(loadOrRenderType.CLICK)}/>

  const resizeBox = <ResizeBox width={realWidth} height={realHeight} maxWidth={maxWidth} onResize={onResize}
                               enabled={able?.resize && selected && !fullscreen}/>

  const isAdapt = (!width && !height && !ratio) || !!typo?.adapt;
  const isDependOnRatio = !width && !height && ratio && !typo?.adapt;

  return (
    <ToolWrapper ref={tlRef} id={id} editor={editor} getPos={getPos}
                 className={cs(typo?.align || 'left', name)} selected={selected}
                 width={realWidth} height={realHeight} ratio={isDependOnRatio ? ratio : undefined} adapt={isAdapt}
                 style={{ width: realWidth, height: realHeight }} fullscreen={fullscreen}
                 onResize={onResize} resizeBox={resizeBox} contentRef={contentRef}
                 onFullscreen={setFullscreen} onClose={able && able.close === false ? undefined : onClose}>
      {content}
    </ToolWrapper>
  );
}

export {
  getInnerWidth,
  PlaceholderMask
}
