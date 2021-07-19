import { SylApi } from '@syllepsis/adapter';
import { ColorController, ColorPlugin as BasePlugin } from '@syllepsis/plugin-basic';
import React from 'react';
import ReactDOM from 'react-dom';

import { ColorPicker } from '../../component';

class ReactColorController extends ColorController {
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
          name="color"
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

class ColorPlugin extends BasePlugin {
  public Controller = ReactColorController;
}

export { ColorPlugin };
