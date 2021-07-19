import { EventChannel, SylApi, Types } from '@syllepsis/adapter';

import { IRenderer } from './types';

const noop = () => {};

type ViewCtorMap<ComponentCtor> = {
  template: ComponentCtor;
  mask?: ComponentCtor;
} & Types.StringMap<ComponentCtor>;

type ViewMap<Props> = {
  template: IRenderer<Props>;
  mask?: IRenderer<Props>;
} & {
  [x: string]: IRenderer<Props>;
};

class LayerRenderer<ComponentCtor, Props> {
  public container: HTMLElement;
  public ViewMap: ViewCtorMap<ComponentCtor>;
  public viewMap: ViewMap<Props> = {} as ViewMap<Props>;
  public adapter: SylApi;
  public Renderer: Types.Ctor<IRenderer<Props>>;
  public layerType = 'template';
  public curProps: Partial<Props> = {};
  private viewContainer: { mask: HTMLElement; template: HTMLElement };

  constructor(
    adapter: SylApi,
    container: HTMLElement,
    viewMapProps: ViewCtorMap<ComponentCtor>,
    viewContainer: { mask: HTMLElement; template: HTMLElement },
    Renderer: Types.Ctor<IRenderer<Props>>
  ) {
    this.container = container;
    this.ViewMap = viewMapProps;
    this.adapter = adapter;
    this.Renderer = Renderer;
    this.viewContainer = viewContainer;

    this.viewMap.template = new Renderer(this.adapter, this.ViewMap.template, viewContainer.template);
    if (!this.ViewMap.mask) this.ViewMap.mask = this.ViewMap.template;
    this.viewMap.mask = new Renderer(this.adapter, this.ViewMap.mask, viewContainer.mask);

    adapter.on(EventChannel.LocalEvent.SWITCH_LAYER, this.updateTemplate);
  }

  private iteratorViewMap = (cb: (renderer: IRenderer<Props>) => any) =>
    Object.keys(this.viewMap).forEach(name => cb(this.viewMap[name]));

  public renderLayer() {
    this.iteratorViewMap(renderer => this.container.appendChild(renderer.container));
  }

  public updateTemplate = (layerType = 'template') => {
    if (!this.ViewMap[layerType] || layerType === this.layerType) return;
    this.viewMap.template.unmount();
    this.layerType = layerType;
    this.viewMap.template = new this.Renderer(this.adapter, this.ViewMap[layerType], this.viewContainer.template);
    this.viewMap.template.setProps(this.curProps, noop);
  };

  /**
   * mount card in dom container
   * @param props
   */
  public mount(props: Props) {
    const childNodes = Array.from(this.container.childNodes);
    for (const child of childNodes) {
      child.remove();
    }
    this.update(props);
    this.renderLayer();
  }

  /**
   * update view if props changed, will update all of cached viewMap
   * at the same time
   */
  public update = (props: Partial<Props>) => {
    this.curProps = props;
    this.iteratorViewMap(renderer => {
      renderer.setProps(props, noop);
    });
  };

  /**
   * uninstall all of the Render View
   */
  public uninstall() {
    this.iteratorViewMap(renderer => {
      renderer.unmount();
    });
    this.adapter.off(EventChannel.LocalEvent.SELECTION_CHANGED, this.updateTemplate);
    this.adapter.off(EventChannel.LocalEvent.SWITCH_LAYER, this.updateTemplate);
  }
}

export { LayerRenderer, ViewCtorMap };
