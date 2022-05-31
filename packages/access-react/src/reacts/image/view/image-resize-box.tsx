import cx from 'classnames';
import React from 'react';

const clamp = (min: number, val: number, max: number): number => {
  if (val < min) {
    return min;
  }
  if (val > max) {
    return max;
  }
  return val;
};
interface IProps {
  height: number;
  config?: string;
  onResizeStart: (w: number, height: number) => void;
  onResizeEnd: (w: number, height: number) => void;
  width: number;
  src: string;
  targetDOM: HTMLElement;
  editorDOM: HTMLElement;
}

interface IResizeProps extends IProps {
  direction: string;
}

const MIN_SIZE = 20;

const ResizeDirection = {
  top_right: '',
  bottom_right: '',
  bottom_left: '',
  top_left: '',
};

class ImageResizeBoxControl extends React.PureComponent<IResizeProps, any> {
  active = false;
  height = 0;
  width = 0;
  frameID: number | null = 0;
  maxWidth = 350;
  x1 = 0;
  x2 = 0;
  y1 = 0;
  y2 = 0;
  resultWidth = 0;
  resultHeight = 0;

  componentWillUnmount(): void {
    this.end();
  }

  bindEvent() {
    document.addEventListener('mousemove', this.onMouseMove, true);
    document.addEventListener('mouseup', this.onMouseUp, true);
  }

  unBindEvent() {
    document.removeEventListener('mousemove', this.onMouseMove, true);
    document.removeEventListener('mouseup', this.onMouseUp, true);
  }

  render() {
    const { direction } = this.props;

    const className = cx({
      'syl-image-resize-box-control': true,
      [direction]: true,
    });

    return <span className={className} onMouseDown={e => this.onMouseDown(e.nativeEvent)} />;
  }

  syncSize = (): void => {
    if (!this.active) {
      return;
    }
    const { direction } = this.props;

    const dx = (this.x2 - this.x1) * (/left/.test(direction) ? -1 : 1);

    const aspect = this.width / this.height;
    let ww = clamp(MIN_SIZE, this.width + Math.round(dx), this.maxWidth);

    const hh = Math.max(ww / aspect, MIN_SIZE);
    ww = hh * aspect;

    this.resultWidth = ww;
    this.resultHeight = hh;
  };

  start(e: MouseEvent): void {
    if (this.active) {
      this.end();
    }

    this.active = true;

    this.maxWidth = this.props.editorDOM.scrollWidth - 40;

    this.x1 = e.clientX;
    this.y1 = e.clientY;

    this.x2 = this.x1;
    this.y2 = this.y1;

    this.width = this.props.width;
    this.height = this.props.height;

    this.resultWidth = this.width;
    this.resultHeight = this.height;

    this.bindEvent();
    this.props.onResizeStart(this.resultWidth, this.resultHeight);
  }

  end(): void {
    if (!this.active) {
      return;
    }

    this.active = false;
    this.unBindEvent();

    this.frameID && cancelAnimationFrame(this.frameID);
    this.frameID = null;
  }

  onMouseDown = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this.end();
    this.start(e);
  };

  onMouseMove = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this.x2 = e.clientX;
    this.y2 = e.clientY;
    this.syncSize();
    this.frameID = requestAnimationFrame(() => this.props.onResizeEnd(this.resultWidth, this.resultHeight));
  };

  onMouseUp = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this.x2 = e.clientX;
    this.y2 = e.clientY;

    this.end();
  };
}

class ImageResizeBox extends React.PureComponent<IProps, any> {
  render() {
    const { onResizeEnd, targetDOM, onResizeStart } = this.props;
    let { width, height } = this.props;

    let imgDOM: HTMLElement | null = null;
    if ((!width || !height) && (imgDOM = targetDOM.querySelector('img'))) {
      const rect = imgDOM.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    }

    const controls = (Object.keys(ResizeDirection) as Array<keyof typeof ResizeDirection>).map(key => (
      <ImageResizeBoxControl
        {...this.props}
        config={ResizeDirection[key]}
        direction={key}
        height={height}
        key={key}
        onResizeStart={onResizeStart}
        onResizeEnd={onResizeEnd}
        width={width}
      />
    ));

    return (
      <span className="syl-resizable-container" style={{ width, height }}>
        {controls}
      </span>
    );
  }
}

export { ImageResizeBox };
