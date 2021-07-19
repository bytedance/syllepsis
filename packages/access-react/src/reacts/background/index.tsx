import { SylApi } from '@syllepsis/adapter';
import { BackgroundController, BackgroundPlugin as BasePlugin } from '@syllepsis/plugin-basic';
import React from 'react';
import ReactDOM from 'react-dom';

import { ColorPicker } from '../../component';

class ReactBackgroundController extends BackgroundController {
  constructor(editor: SylApi, store: any) {
    super(editor, store);
    this.refactorToolbar();
  }

  public refactorToolbar() {
    this.toolbar!.handler = () => {};

    this.toolbar!.getRef = btnDOM => {
      if (!btnDOM) return;
      const dom = document.createElement('div');
      const extraDom = (
        <ColorPicker
          mountDOM={btnDOM}
          name="background"
          editor={this.editor}
          getValue={this.getValue}
          getAttrs={this.getAttrs}
          defaultColor={this.defaultColor}
          handler={_attrs => {
            this.editor.setFormat({ color: _attrs });
          }}
        />
      );
      btnDOM.appendChild(dom);
      ReactDOM.render(extraDom, dom);
    };
  }
}

class BackgroundPlugin extends BasePlugin {
  public Controller = ReactBackgroundController;
}

export { BackgroundPlugin };
