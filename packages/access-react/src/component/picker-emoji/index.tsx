import 'emoji-mart/css/emoji-mart.css';

import { SylApi } from '@syllepsis/adapter';
import { BaseEmoji, Picker } from 'emoji-mart';
import React from 'react';

import { calculateShowLeft } from '../utils';

interface IEmojiPickerState {
  open: boolean;
  marginLeft: number;
}

interface IEmojiPickerProps {
  editor: SylApi;
  mountDOM: HTMLElement;
  backgroundImageFn?: () => string;
}

const PICKER_WIDTH = 340;

class EmojiPicker extends React.Component<IEmojiPickerProps, IEmojiPickerState> {
  picker: HTMLElement | null = null;
  $btn: HTMLElement | null = null;
  state = {
    open: false,
    marginLeft: 0,
  };

  constructor(props: IEmojiPickerProps) {
    super(props);
    this.$btn = props.mountDOM.querySelector('.syl-toolbar-button');
  }

  componentDidMount() {
    this.$btn && this.$btn.addEventListener('click', this.toggleVisible);
  }

  componentWillMount() {
    this.$btn && this.$btn.removeEventListener('click', this.toggleVisible);
  }

  private fixPos() {
    const { mountDOM } = this.props;
    if (!mountDOM || !this.picker || !this.picker.parentElement) return;
    this.setState({
      marginLeft: calculateShowLeft(this.picker, mountDOM),
    });
  }

  private bindEvent = () => document.addEventListener('click', this.listenClickEvent, true);
  private unBindEvent = () => document.removeEventListener('click', this.listenClickEvent, true);

  private selectEmoji = (emoji: BaseEmoji) => {
    this.props.editor.insertText(emoji.native);
    this.hide();
  };

  private listenClickEvent = (e: MouseEvent) => {
    if (this.$btn && this.$btn.contains(e.target as Node)) return;
    if (this.state.open && this.picker && !this.picker.contains(e.target as Node)) {
      requestAnimationFrame(() => this.hide());
    }
  };

  private open = () => {
    this.fixPos();
    this.setState({
      open: true,
    });
    this.bindEvent();
  };

  private hide = () => {
    this.setState({
      open: false,
    });
    this.unBindEvent();
  };

  public toggleVisible = () => (this.state.open ? this.hide() : this.open());

  public render() {
    const { open, marginLeft } = this.state;
    const { backgroundImageFn } = this.props;

    return (
      <div
        className="syl-emoji-picker-container"
        ref={el => {
          if (el) {
            this.picker = el;
          }
        }}
        style={{
          position: 'absolute',
          visibility: open ? 'visible' : 'hidden',
          zIndex: 2,
          ...(marginLeft ? { marginLeft } : {}),
        }}
      >
        <Picker
          set="messenger"
          backgroundImageFn={backgroundImageFn ? backgroundImageFn : undefined}
          onSelect={this.selectEmoji}
          style={{ width: PICKER_WIDTH }}
        />
      </div>
    );
  }
}

export { EmojiPicker };
