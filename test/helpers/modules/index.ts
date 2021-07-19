import { BaseModule, SylApi } from '../../../packages/adapter/dist/es';

class ModuleCtor extends BaseModule {
  public dom: HTMLElement;
  constructor(adapter: SylApi, option: any) {
    super(adapter, option);
    const { text } = option;
    this.dom = document.createElement('span');
    this.dom.setAttribute('class', 'module-desc');
    this.dom.innerHTML = text;
    adapter.root.appendChild(this.dom);
  }

  setProps(option: any) {
    this.option = { ...this.option, option };
    this.dom.innerHTML = option.text;
  }
}

export { ModuleCtor };
