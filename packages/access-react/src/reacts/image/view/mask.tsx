import { LoadingOne } from '@icon-park/react';
import { EventChannel } from '@syllepsis/adapter';
import { IViewMapProps } from '@syllepsis/editor';
import { ImageAttrs } from '@syllepsis/plugin-basic';
import cls from 'classnames';
import debounce from 'lodash.debounce';
import React, { ChangeEventHandler } from 'react';

import { Icons } from '../../../component/icons';
import { ImageResizeBox } from './image-resize-box';

enum DEFAULT_IMG_SIZE {
  width = 375,
  height = 300,
}

class ImageMask extends React.Component<IViewMapProps<ImageAttrs>, any> {
  public imageWrapDom: any;
  public MAX_WIDTH: number;
  private isInline = false;
  private imageMount = false;
  private inputting = false;

  constructor(props: any) {
    super(props);
    const { editor, attrs, state } = props;
    this.updateImageUrl(props);

    this.state = {
      caption: attrs.alt || '',
      active: false,
      isUploading: Boolean(state.uploading),
    };

    const { schema } = editor.view.state;
    this.isInline = schema.nodes.image.isInline;
    this.MAX_WIDTH = editor.view.dom.scrollWidth - 40;
  }

  componentDidUpdate(prevProps: IViewMapProps<ImageAttrs>) {
    if (!this.inputting && this.props.attrs.alt !== this.state.caption) {
      this.setState({
        caption: this.props.attrs.alt || '',
      });
    }
    if (this.props.attrs.src !== prevProps.attrs.src) {
      this.props.state.uploading = false;
      this.updateImageUrl(this.props);
    }
  }

  componentDidMount() {
    document.addEventListener('click', this._handleCheckStatus);
    this.props.editor.on(EventChannel.LocalEvent.LOCALE_CHANGE, this.localeUpdate);
    this.imageMount = true;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this._handleCheckStatus);
    this.props.editor.off(EventChannel.LocalEvent.LOCALE_CHANGE, this.localeUpdate);
    this.imageMount = false;
  }

  localeUpdate = debounce(() => this.imageMount && this.forceUpdate(), 300, {
    leading: true,
  });

  _handleCheckStatus: EventListener = e => {
    if (
      e.target &&
      this.imageWrapDom &&
      (e.target as HTMLElement).tagName.toLowerCase() !== 'input' &&
      this.imageWrapDom.contains(e.target) &&
      !this.state.active
    ) {
      this.setState({ active: true });
    } else if (this.state.active) {
      this.setState({ active: false });
    }
  };

  public focusCaption = () => {
    this.props.editor.disable();
    this.inputting = true;
  };

  public updateCaptionValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { caption } = this.state;
    const { editor, attrs } = this.props;
    editor.enable();
    if (caption !== attrs.alt) this.dispatchUpdate({ alt: caption });
    this.inputting = false;
  };

  public dispatchUpdate = (attrs: Partial<ImageAttrs>) => {
    const pos = this.props.getPos();
    if (pos === undefined) return;
    this.props.editor.updateCardAttrs(pos, attrs);
  };

  private async updateImageUrl(props: IViewMapProps<ImageAttrs>) {
    const uploadPromise = props.editor.command.image!.updateImageUrl(props, this.props.dispatchUpdate!);
    if (this.state && this.state.isUploading !== this.props.state.uploading) {
      this.setState({
        isUploading: Boolean(this.props.state.uploading),
      });
    }
    await uploadPromise;
    this.setState({
      isUploading: false,
    });
  }

  _onResizeEnd = (width: number, height: number): void =>
    this.dispatchUpdate({
      width,
      height,
    });

  _changeAlt: ChangeEventHandler<HTMLInputElement> = e => {
    this.setState({
      caption: e.target.value,
    });
  };
  get width() {
    return Math.min(this.props.attrs.width || 0, this.MAX_WIDTH) || DEFAULT_IMG_SIZE.width;
  }

  public renderImage = () => {
    const { attrs, editor } = this.props;
    const { src, height, alt, width = DEFAULT_IMG_SIZE.width } = attrs;
    const config = editor.command.image!.getConfiguration();
    const { active, isUploading } = this.state;
    return (
      <span className="syl-image-atom-wrapper" ref={ref => this.isInline && (this.imageWrapDom = ref)}>
        <img src={src} {...(alt ? { alt } : {})} {...(width ? { width } : {})} {...(height ? { height } : {})} />
        {editor.editable && !config.disableResize && active ? (
          <ImageResizeBox
            height={height}
            onResizeEnd={this._onResizeEnd}
            editorDOM={editor.view.dom as HTMLElement}
            src={src}
            width={width}
            targetDOM={this.imageWrapDom}
          />
        ) : null}
        {isUploading &&
          (config.renderLoading ? (
            config.renderLoading(this.props)
          ) : (
            <div className="syl-image-loading">
              <LoadingOne theme="outline" size="20" fill="#fff" />
            </div>
          ))}
      </span>
    );
  };

  public renderBlockImage = () => {
    const { attrs, editor } = this.props;
    const { align } = attrs;
    const locale = editor.configurator.getLocaleValue('image');

    const { active } = this.state;
    const config = editor.command.image!.getConfiguration();
    return (
      <div ref={ref => (this.imageWrapDom = ref)} className={cls('syl-image-wrapper')} style={{ textAlign: align }}>
        <div className="syl-image-fixer">
          {active && editor.isFocused && !config.disableAlign && (
            <span className="align-menu">
              <span
                className={cls('align-icon', { active: align === 'left' })}
                onClick={() => this.dispatchUpdate({ align: 'left' })}
              >
                {Icons.align_left}
              </span>
              <span
                className={cls('align-icon', { active: align === 'center' })}
                onClick={() => this.dispatchUpdate({ align: 'center' })}
              >
                {Icons.align_center}
              </span>
              <span
                className={cls('align-icon', { active: align === 'right' })}
                onClick={() => this.dispatchUpdate({ align: 'right' })}
              >
                {Icons.align_right}
              </span>
            </span>
          )}
          {this.renderImage()}
          {config.disableCaption !== true && (
            <div className="syl-image-caption">
              <input
                type="text"
                maxLength={config.maxLength || 20}
                placeholder={config.placeholder || locale.placeholder || `图片描述(${config.maxLength}字内)`}
                className="syl-image-caption-input"
                draggable={true}
                onDragStart={e => {
                  e.preventDefault();
                  e.nativeEvent.stopImmediatePropagation();
                }}
                onCopy={e => {
                  const selection = window.getSelection();
                  if (selection) {
                    e.clipboardData.setData('text/html', selection.toString());
                  }
                }}
                onFocus={this.focusCaption}
                onChange={this._changeAlt}
                onMouseUp={e => e.nativeEvent.stopImmediatePropagation()}
                onBlur={this.updateCaptionValue}
                value={this.state.caption}
                onClick={e => {
                  e.stopPropagation();
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    return this.isInline ? this.renderImage() : this.renderBlockImage();
  }
}

export { ImageMask };
