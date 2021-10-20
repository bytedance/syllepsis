import { BaseModule, EventChannel, SylApi } from '@syllepsis/adapter';
import debounce from 'lodash.debounce';

import { IRenderer } from '../../../../renderer';
import { IToolbarOption } from '../../..';
import { ToolbarLib } from '../..';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    toolbar?: {
      getEnable: () => boolean;
      enable: () => void;
      disable: () => void;
    };
  }
}

const DISABLE_CLASS = 'syl-toolbar-disable';

interface IToolbarStaticProps {
  editor: SylApi;
  option: IToolbarOption;
  toolbarLib: ToolbarLib;
}

class ToolbarLoader extends BaseModule<IToolbarOption> {
  public bridge: IRenderer<IToolbarStaticProps>;
  private $dom: HTMLElement;

  // prefer disable state
  private _isDisable = false;

  get isDisable() {
    return this._isDisable;
  }

  set isDisable(val) {
    if (val === this._isDisable) return;
    this._isDisable = val;
    // disable when the editor is not editable
    if (!this.adapter.editable && !this._isDisable) return;
    if (this._isDisable) {
      this.$dom.classList.add(DISABLE_CLASS);
    } else {
      this.$dom.classList.remove(DISABLE_CLASS);
    }
  }

  constructor(adapter: SylApi, originOption: IToolbarOption) {
    super(adapter, Object.assign({}, originOption));
    const option = Object.assign({}, originOption);

    if (!option.mount) {
      const div = document.createElement('div');
      adapter.root.insertBefore(div, adapter.root.childNodes[0]);
      option.mount = div;
    }

    this.$dom = option.mount as HTMLElement;
    if (option.className) this.$dom.classList.add(option.className);

    this.bridge = new option.RenderBridge(adapter, option.Component, option.mount, 'toolbar');

    adapter.addCommand('toolbar', {
      enable: this.enable,
      disable: this.disable,
      getEnable: () => !this.$dom.classList.contains(DISABLE_CLASS),
    });

    adapter.on(EventChannel.LocalEvent.ON_CHANGE, this.traceEditable);

    this.render();
  }

  private traceEditable = debounce(() => {
    if (!this._isDisable) {
      if (this.adapter.editable) {
        this.$dom.classList.remove(DISABLE_CLASS);
      } else {
        this.$dom.classList.add(DISABLE_CLASS);
      }
    }
  }, 300);

  private disable = () => {
    this.isDisable = true;
  };

  private enable = () => {
    this.isDisable = false;
  };

  public setProps(option: IToolbarOption) {
    this.option = { ...this.option, ...option };
    this.render();
  }

  public render() {
    this.bridge.setProps({
      editor: this.adapter,
      option: this.option,
      toolbarLib: new ToolbarLib({ editor: this.adapter, option: this.option }),
    });
  }

  public destructor() {
    if (this.option.mount) {
      this.option.mount = null;
    }
    this.bridge.unmount();
  }
}

export { IToolbarStaticProps, ToolbarLoader };
