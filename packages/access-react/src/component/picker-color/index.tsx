import { SylApi, Types } from '@syllepsis/adapter';
import React from 'react';
import { ChromePicker } from 'react-color';

interface IColorPickerState {
  open: boolean;
  color: string;
}

interface IColorProps {
  name: string;
  getValue: any;
  editor: SylApi;
  getAttrs: any;
  defaultColor: string;
  mountDOM: HTMLElement;
  handler: (attrs: Types.StringMap<any>) => any;
}

const PICKER_WIDTH = 225;

class ColorPicker extends React.Component<IColorProps, IColorPickerState> {
  picker?: HTMLDivElement;
  $btn: HTMLElement | null;
  sel = '';

  state = {
    open: false,
    color: '',
  };

  constructor(props: IColorProps) {
    super(props);
    const color = this.getColor();
    this.state = {
      color,
      open: false,
    };
    this.$btn = this.props.mountDOM.querySelector('.syl-toolbar-button');
  }

  private fixPos() {
    const { mountDOM } = this.props;
    if (!mountDOM || !this.picker || !this.picker.parentElement) return;
    const rect = this.props.mountDOM.getBoundingClientRect();
    const avWidth = window.innerWidth;
    if (avWidth - rect.left < PICKER_WIDTH) {
      this.picker.parentElement.setAttribute('style', `margin-left: -${PICKER_WIDTH - (rect.right - rect.left)}px`);
    } else {
      this.picker.parentElement.setAttribute('style', '');
    }
  }

  private getColor = () => {
    const { editor, name, getValue, defaultColor } = this.props;
    const attrs = editor.getFormat()[name];
    return Boolean(attrs) && attrs && attrs.color ? getValue(attrs) : defaultColor;
  };

  public updateColor = () => {
    const selection = this.props.editor.getSelection();
    if (selection && this.sel !== JSON.stringify(selection)) {
      this.sel = JSON.stringify(selection);
      const color = this.getColor();
      if (color === this.props.defaultColor) return;
      this.setState({ color });
      this.setIconColor(color);
    }
  };

  public componentDidMount() {
    this.updateColor();
    this.$btn && this.$btn.addEventListener('click', this.toggleVisible);
  }
  public componentWillUnmount() {
    this.$btn && this.$btn.removeEventListener('click', this.toggleVisible);
  }

  public listenClose = () => document.addEventListener('mousedown', this.judge);
  public unListenClose = (): void => document.removeEventListener('mousedown', this.judge);

  public judge = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (this.$btn && this.$btn.contains(target)) return;
    if (!this.picker) return this.hide();
    if (!this.picker.contains(target)) {
      this.hide();
    } else if (this.picker.contains(target) && !target.closest('input')) {
      requestAnimationFrame(() => this.props.editor.focus());
    }
  };

  changeColor = (_color: any) => {
    const isInput = document.activeElement ? document.activeElement.tagName === 'INPUT' : false;
    const { editor, getAttrs, name } = this.props;
    const attrs = getAttrs(_color.rgb);
    editor.setFormat({ [name]: attrs }, { focus: !isInput });
    this.setState({ color: attrs.color }, () => this.setIconColor(attrs.color));
  };

  setIconColor = (color: string) => {
    const { mountDOM } = this.props;
    if (mountDOM && mountDOM.querySelector('svg')) {
      const paths = mountDOM.querySelectorAll('path');
      ([].slice.call(paths) as SVGClipPathElement[]).forEach(path => {
        if (path.getAttribute('color-line')) {
          path.setAttribute('stroke', color);
        }
      });
    }
  };

  public hide = () => this.setState({ open: false }, this.unListenClose);
  public open = () => {
    this.fixPos();
    this.updateColor();
    this.setState({ open: true }, this.listenClose);
  };
  public toggleVisible = () => (this.state.open ? this.hide() : this.open());

  render() {
    const { open, color } = this.state;
    if (!open) return null;
    return (
      <div
        className="color-picker-container"
        style={{ userSelect: 'none', width: `${PICKER_WIDTH}px`, position: 'absolute', zIndex: 99 }}
        data-syl-toolbar="true"
        ref={el => el && (this.picker = el)}
      >
        <ChromePicker color={color as any} onChange={this.changeColor} />
      </div>
    );
  }
}

export { ColorPicker };
