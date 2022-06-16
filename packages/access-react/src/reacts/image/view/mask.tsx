import { DamageMap, LoadingOne } from '@icon-park/react';
import { EventChannel, ISylApiCommand } from '@syllepsis/adapter';
import { IViewMapProps } from '@syllepsis/editor';
import { ImageAttrs, ImageProps } from '@syllepsis/plugin-basic';
import cls from 'classnames';
import debounce from 'lodash.debounce';
import React, { ChangeEventHandler } from 'react';

import { Icons } from '../../../component/icons';
import { ImageResizeBox } from './image-resize-box';

enum DEFAULT_IMG_SIZE {
  width = 375,
  height = 300,
}

interface ISylMaskImageFailedProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  attrs: ImageAttrs;
  maxWidth: number;
}

const SylMaskImageFailed = ({ attrs, maxWidth, ...rest }: ISylMaskImageFailedProps) => {
  const { width, align } = attrs;
  const displayWidth = width || Math.min(DEFAULT_IMG_SIZE.width, maxWidth);
  return (
    <div className="syl-image-failed-wrapper" style={{ textAlign: align }} {...rest}>
      <div className="syl-image-failed" style={{ width: `${displayWidth}px`, height: `${(displayWidth * 9) / 16}px` }}>
        <span className="syl-image-icon">
          <DamageMap size={displayWidth / 6} fill="#999" />
        </span>
      </div>
    </div>
  );
};

class ImageMask extends React.Component<IViewMapProps<ImageAttrs>, any> {
  public imageWrapDom: any;
  private isInline = false;
  private imageMount = false;
  private inputting = false;
  private isResizing = false;

  constructor(props: any) {
    super(props);
    const { editor, attrs, state } = props;
    this.updateImageUrl();

    this.state = {
      caption: attrs.alt || '',
      active: false,
      isUploading: Boolean(state.uploading),
      isFailed: false,
    };

    const { schema } = editor.view.state;
    this.isInline = schema.nodes.image.isInline;
  }

  get MAX_WIDTH() {
    const { editor } = this.props;
    const config = (editor.command as ISylApiCommand).image!.getConfiguration();
    if (config.maxWidth !== undefined) return config.maxWidth;
    return editor.view.dom.scrollWidth - 40;
  }

  componentDidUpdate(prevProps: IViewMapProps<ImageAttrs>) {
    if (!this.inputting && this.props.attrs.alt !== undefined && this.props.attrs.alt !== this.state.caption) {
      this.setState({
        caption: this.props.attrs.alt || '',
      });
    }
    if (this.props.attrs.src !== prevProps.attrs.src) {
      this.props.state.uploading = false;
      this.updateImageUrl();
    }

    if (!this.isResizing && this.props.isSelected !== prevProps.isSelected) {
      this.setState({ active: this.props.isSelected });
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
    }
  };

  public focusCaption = () => {
    this.props.editor.disable();
    this.setState({ active: false });
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

  private updateImageUrl = async () => {
    try {
      const uploadPromise = this.props.editor.command.image!.updateImageUrl(this.props, this.props.dispatchUpdate!);
      if (this.state && this.state.isUploading !== this.props.state.uploading) {
        this.setState({
          isFailed: false,
          isUploading: Boolean(this.props.state.uploading),
        });
      }
      await uploadPromise;
      if (!this.imageMount) return;
      this.setState({
        isUploading: false,
        isFailed: false,
      });
    } catch (err) {
      if (!this.imageMount) return;
      this.setState({
        isFailed: true,
        isUploading: false,
      });
      throw err;
    }
  };

  _onResizeStart = () => {
    this.isResizing = true;
  };
  _onResizeEnd = (width: number, height: number): void => {
    this.dispatchUpdate({
      width,
      height,
    });
    this.isResizing = false;
  };

  _changeAlt: ChangeEventHandler<HTMLInputElement> = e => {
    this.setState({
      caption: e.target.value,
    });
  };

  public renderImage = () => {
    const { active, isUploading } = this.state;
    const { attrs, editor } = this.props;
    const { src, alt, width, height } = attrs;
    const config = editor.command.image!.getConfiguration();

    return (
      <span className="syl-image-atom-wrapper" ref={ref => this.isInline && (this.imageWrapDom = ref)}>
        <img
          src={src}
          {...(alt ? { alt } : {})}
          {...(width ? { width } : {})}
          {...(height ? { height } : {})}
          onError={() => {
            this.setState({
              isFailed: true,
            });
          }}
        />
        {editor.editable && !config.disableResize && active ? (
          <ImageResizeBox
            height={height}
            onResizeStart={this._onResizeStart}
            onResizeEnd={this._onResizeEnd}
            editorDOM={editor.view.dom as HTMLElement}
            src={src}
            maxWidth={this.MAX_WIDTH}
            width={width}
            targetDOM={this.imageWrapDom}
          />
        ) : null}
        {isUploading &&
          (config.renderLoading ? (
            config.renderLoading(this.props)
          ) : (
            <span className="syl-image-loading">
              <LoadingOne theme="outline" size="20" fill="#fff" />
            </span>
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
          {active && editor.editable && !config.disableAlign && (
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

  public renderFailedImage = (config: ImageProps) => {
    if (config.renderFailed) return config.renderFailed({ ...this.props, reUpload: this.updateImageUrl });
    return <SylMaskImageFailed attrs={this.props.attrs} maxWidth={config.uploadMaxWidth!} />;
  };

  render() {
    const { isFailed, isUploading } = this.state;
    if (isFailed && !isUploading) {
      const config = this.props.editor.command.image!.getConfiguration() as ImageProps;
      if (config.renderFailed !== false) return this.renderFailedImage(config);
    }
    return this.isInline ? this.renderImage() : this.renderBlockImage();
  }
}

export { ImageMask, SylMaskImageFailed };
