import 'emoji-mart/css/emoji-mart.css';

import { SylApi } from '@syllepsis/adapter';
import { BaseEmoji, Picker } from 'emoji-mart';
import React from 'react';

interface IEmojiPickerState {
  open: boolean;
}

interface IEmojiPickerProps {
  editor: SylApi;
  mountDOM: HTMLElement;
  backgroundImageFn?: () => string;
}

const PICKER_WIDTH = 340;

class EmojiPicker extends React.Component<IEmojiPickerProps, IEmojiPickerState> {
  pickElement: Element | null = null;
  $btn: HTMLElement | null = null;
  state = {
    open: false,
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
    if (!mountDOM || !this.pickElement || !this.pickElement.parentElement) return;
    const rect = mountDOM.getBoundingClientRect();
    const avWidth = window.innerWidth;
    if (avWidth - rect.left < PICKER_WIDTH) {
      this.pickElement.parentElement.setAttribute(
        'style',
        `margin-left: -${PICKER_WIDTH - (rect.right - rect.left)}px`,
      );
    } else {
      this.pickElement.parentElement.setAttribute('style', '');
    }
  }

  private bindEvent = () => document.addEventListener('click', this.listenClickEvent, true);
  private unBindEvent = () => document.removeEventListener('click', this.listenClickEvent, true);

  private selectEmoji = (emoji: BaseEmoji) => {
    this.props.editor.insertText(emoji.native);
    this.hide();
  };

  private listenClickEvent = (e: MouseEvent) => {
    if (this.$btn && this.$btn.contains(e.target as Node)) return;
    if (this.state.open && this.pickElement && !this.pickElement.contains(e.target as Node)) {
      requestAnimationFrame(() => this.hide());
    }
  };

  private open = () => {
    this.setState({
      open: true,
    });
    this.bindEvent();
  };

  private hide = () => {
    this.fixPos();
    this.setState({
      open: false,
    });
    this.unBindEvent();
  };

  public toggleVisible = () => (this.state.open ? this.hide() : this.open());

  public render() {
    const { open } = this.state;
    if (!open) return null;
    const { backgroundImageFn } = this.props;

    return (
      <div
        ref={el => {
          if (el) {
            this.pickElement = el;
          }
        }}
      >
        <Picker
          set="messenger"
          backgroundImageFn={backgroundImageFn ? backgroundImageFn : undefined}
          onSelect={this.selectEmoji}
          style={{ width: PICKER_WIDTH, position: 'absolute', zIndex: 2 }}
        />
      </div>
    );
  }
}

export { EmojiPicker };
