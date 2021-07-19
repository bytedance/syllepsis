import { InlineCardView, BlockCardView } from '../../../packages/adapter/dist/es';

const render = (node: any, ViewMap: any, { template, mask }: any) => {
  template.innerHTML = ViewMap.template(node);
  if (!ViewMap.mask) ViewMap.mask = ViewMap.template;
  mask.innerHTML = ViewMap.mask(node);
};
class TestBlockCardView extends BlockCardView<any> {
  public ViewMap: any;
  constructor(adapter: any, node: any, view: any, getPos: boolean | (() => number)) {
    super(adapter, node, view, getPos);
    this.mount = ({ ViewMap }) => {
      this.ViewMap = ViewMap;
      this.render(node);
    };
  }

  public render(node: any) {
    render(node, this.ViewMap, { template: this.template, mask: this.mask });
  }
}
class TestInlineCardView extends InlineCardView<any> {
  public ViewMap: any;
  constructor(adapter: any, node: any, view: any, getPos: boolean | (() => number)) {
    super(adapter, node, view, getPos);
    this.mount = ({ ViewMap }) => {
      this.ViewMap = ViewMap;
      this.render(node);
    };
  }

  public render(node: any) {
    render(node, this.ViewMap, { template: this.template, mask: this.mask });
  }
}

export { TestInlineCardView, TestBlockCardView };
