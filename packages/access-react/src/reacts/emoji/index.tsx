import 'emoji-mart/css/emoji-mart.css';

import { SylController, SylPlugin } from '@syllepsis/adapter';
import React from 'react';
import ReactDOM from 'react-dom';

import { EmojiPicker } from '../../component';

interface IEmojiProps {
  backgroundImageFn?: () => string;
}

class EmojiController extends SylController<IEmojiProps> {
  public toolbar = {
    getRef: (btnDOM: HTMLElement | null) => {
      if (!btnDOM) return;
      const dom = document.createElement('div');
      const extraDom = (
        <EmojiPicker mountDOM={btnDOM} editor={this.editor} backgroundImageFn={this.props.backgroundImageFn} />
      );
      btnDOM.appendChild(dom);
      ReactDOM.render(extraDom, dom);
    },
    handler: () => {},
  };
}

class EmojiPlugin extends SylPlugin<IEmojiProps> {
  public name = 'emoji';
  public Controller = EmojiController;
}

export { EmojiController, EmojiPlugin };
