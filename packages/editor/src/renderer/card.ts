import { BaseCard, BaseCardView, SylApi, Types } from '@syllepsis/adapter';
import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

import { LayerRenderer, ViewCtorMap } from './layer';
import { IRenderer } from './types';

interface IViewMapProps<T = Types.StringMap<any>> {
  attrs: T;
  editor: SylApi;
  dispatchUpdate: (attrs: Partial<T>) => any;
  getBoundingClientRect: () => Types.BoundingStatic;
  getPos: () => number;
  isSelected: boolean;
  wrapDOM: HTMLElement;
  state: Types.StringMap<any>;
}

const AccessLayer = <ComponentCtor>(Card: typeof BaseCard, Renderer: Types.Ctor<IRenderer<any>>) => {
  if (!Card.prototype.NodeView) return Card;
  const BaseNodeView = Card.prototype.NodeView as typeof BaseCardView;
  class AccessNodeView extends BaseNodeView {
    public props: IViewMapProps;
    public renderer: LayerRenderer<ComponentCtor, any> | null = null;

    constructor(editor: SylApi, node: Node, view: EditorView, getPos: boolean | (() => number)) {
      super(editor, node, view, getPos);
      this.props = {
        attrs: node.attrs,
        editor,
        dispatchUpdate: this.dispatchUpdate.bind(this),
        getBoundingClientRect: this.getBoundingClientRect.bind(this),
        getPos: this.getPos,
        isSelected: false,
        wrapDOM: this.dom,
        state: {},
      };
    }

    public mount({ ViewMap, layers }: { ViewMap: ViewCtorMap<any>; layers?: ViewCtorMap<any> }) {
      const renderMap: ViewCtorMap<any> = { ...ViewMap, ...layers };
      const renderer = new LayerRenderer(
        this.adapter,
        this.dom,
        renderMap,
        {
          template: this.template,
          mask: this.mask,
        },
        Renderer,
      );
      renderer.mount(this.props);
      return (this.renderer = renderer);
    }

    // this will update view
    public update({
      attrs,
      isSelected = this.isSelected,
      isText,
    }: {
      attrs: any;
      isSelected?: boolean;
      isText?: boolean;
    }) {
      if (isText === true) {
        return false;
      }

      if (attrs && this.props.attrs) {
        const attrsKeys = Object.keys(attrs);
        const propsAttrsKeys = Object.keys(this.props.attrs);

        if (
          attrsKeys.length !== propsAttrsKeys.length ||
          (attrsKeys.length && attrsKeys.some(key => !propsAttrsKeys.includes(key)))
        ) {
          return false;
        }
      }

      const result = super.update({ attrs, isSelected });
      const isAttrsChange = this.props.attrs !== attrs;
      const isSelectedChange = this.props.isSelected !== isSelected;
      if (isAttrsChange || isSelectedChange) {
        // this to clean observable set by Vue
        if (isAttrsChange) Object.assign(this.props, { attrs });
        if (isSelectedChange) Object.assign(this.props, { isSelected: (isSelected && true) || false });
        if (this.renderer) {
          this.renderer.update({
            ...this.props,
          });
          return true;
        }
      }
      return result;
    }

    // ignored the internal mutations of the card by default, and can be overwritten if necessary
    public ignoreMutation(
      event:
        | MutationRecord
        | {
            type: 'selection';
            target: Element;
          },
    ) {
      if (this.dom.contains) {
        return this.dom.contains(event.target);
      } else {
        return false;
      }
    }

    public destroy() {
      super.destroy();
      this.renderer && this.renderer.uninstall();
    }
  }

  Card.prototype.NodeView = AccessNodeView;
  return Card;
};

export { AccessLayer, IViewMapProps };
