import { DOMOutputSpec, Node as ProseMirrorNode } from 'prosemirror-model';
import { NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { SylApi } from '../api';
import { EventChannel } from '../event';
import { defineMetadata, getMetadata, Types } from '../libs';
import { FLAG, FORMAT_TYPE, META, SELECT_CLS, SYL_TAG } from './const';
import { IEventHandler } from './controller';
import { Atom, BlockAtom, InlineAtom, SchemaMeta, SylSchema } from './schema';
import {
  createCardDOM,
  createInlineCardDOM,
  createMaskDOM,
  createTemplDOM,
  createWrapperDOM,
  isCardSchema,
  isInlineSchema,
} from './utils';

interface ICardConfig extends SylSchema<any> {
  sylCard?: boolean;
  draggable?: boolean;
  props?: IEventHandler;
  getText?: boolean;
  excludeMarks?: string;
  fixCursor?: boolean;
}

type IViewMap = Types.StringMap<any>;

const createCursorFixer = () => {
  const dom = document.createElement('span');
  dom.className = 'syl-inline-fixer';
  dom.appendChild(document.createTextNode('\u200B'));
  return dom;
};

// define all of the basic property of nodeView
class BaseCardView<Structure extends Types.StringMap<any> = any> {
  public dom: HTMLElement = document.createElement('span');
  public template: HTMLElement = createTemplDOM();
  public mask: HTMLElement = createMaskDOM();

  public attrs: Structure;
  public adapter: SylApi;
  public root?: HTMLElement;
  public isSelected = false;
  public traceSelection = true;
  public renderer: any = null;
  // Note that you should better rewrite to `boolean` when you are using custom MarkView
  public getPos: () => number;

  constructor(adapter: SylApi, node: ProseMirrorNode, view: EditorView, getPos: boolean | (() => number)) {
    this.attrs = node.attrs as any;
    this.adapter = adapter;
    this.getPos = getPos as any;
    this.dom.setAttribute(SYL_TAG, 'true');
    this.traceSelection = !(node.type.spec.traceSelection === false);
    if (this.traceSelection) {
      this.adapter.on(EventChannel.LocalEvent.SELECTION_CHANGED, this.traceSelect);
    }
  }

  public update({ attrs, isSelected, isText }: { attrs: Structure; isSelected?: boolean; isText?: boolean }) {
    // do update attrs
    return false;
  }

  public selectNode() {
    const currentNode = this.getNode();
    if (currentNode) this.attrs = currentNode.attrs as any;
    this.update({
      attrs: this.attrs,
      isSelected: true,
    });
    this.isSelected = true;
    this.dom.classList.add(SELECT_CLS);
    return false;
  }

  public deselectNode() {
    // if attrs are modified from selectNode to deselectNode, but without calling dispatchUpdate, deselectNode will reset the updated attrs
    const currentNode = this.getNode();
    if (currentNode) this.attrs = currentNode.attrs as any;
    this.update({
      attrs: this.attrs,
      isSelected: false,
    });
    this.isSelected = false;
    this.dom.classList.remove(SELECT_CLS);
    return;
  }

  public mount({ ViewMap, layers }: { ViewMap: Types.StringMap<any>; layers?: Types.StringMap<any> }) {
    console.error(
      '[SylEditor Warning]: this error usually means you do not' +
        'import Card/InlineCard from access layer' +
        'do not import from @syllepsis/cadapter directly',
    );
  }

  public traceSelect = () => {
    const { selection } = this.adapter.view.state;
    if (selection instanceof NodeSelection) return;
    if (selection.empty && this.isSelected) {
      this.deselectNode();
    } else {
      const pos = this.getPos();
      const { from, to } = selection;
      if (from <= pos && pos < to) {
        !this.isSelected && this.selectNode();
      } else if (this.isSelected) {
        this.deselectNode();
      }
    }
  };

  public afterMount(name: string) {
    this.fixCursor(name);
    this.dom.appendChild(this.template);
    this.dom.appendChild(this.mask);
  }

  public fixCursor(name: string) {
    const curNode = this.adapter.view.state.schema.nodes[name];
    if (!curNode || !curNode.spec.fixCursor) return;
    this.dom.insertBefore(createCursorFixer(), this.dom.firstElementChild);
    this.dom.appendChild(createCursorFixer());
  }

  public getNode = () => this.adapter.view.state.tr.doc.nodeAt(this.getPos());

  // cardDOM position relative to editor.root
  public getBoundingClientRect(): Types.BoundingStatic {
    const domRect = this.dom.getBoundingClientRect();
    const rootRect = this.adapter.root.getBoundingClientRect();

    return {
      ...JSON.parse(JSON.stringify(domRect)),
      top: domRect.top - rootRect.top,
      left: domRect.left - rootRect.left,
      bottom: domRect.bottom - rootRect.top,
      right: domRect.right - rootRect.left,
    };
  }

  public dispatchUpdate(attrs: Structure) {
    const { view } = this.adapter;
    // update attrs
    this.attrs = attrs;
    view.dispatch(view.state.tr.setNodeMarkup(this.getPos(), undefined, attrs));
  }

  public ignoreMutation(event: MutationRecord | { type: 'selection'; target: Element }): any {
    // return true
  }

  public stopEvent(): any {
    // return true
  }

  public destroy(): any {
    if (this.traceSelection) {
      this.adapter.off(EventChannel.LocalEvent.SELECTION_CHANGED, this.traceSelect);
    }
  }
}

class BlockCardView<Structure> extends BaseCardView<Structure> {
  public dom = createCardDOM();
}

class InlineCardView<Structure> extends BaseCardView<Structure> {
  public dom = createInlineCardDOM();
}

class BaseCard<Structure = any> extends Atom<Structure> {
  public sylCard = true;
  public getText?: boolean;
  public excludeMarks?: string;
  public fixCursor?: boolean;

  public ViewMap: IViewMap = {};
  public layers: IViewMap = {};
}
// * https://github.com/microsoft/TypeScript/issues/15607
@defineMetadata(FLAG, FORMAT_TYPE.BLOCK_CARD)
class Card<Structure> extends BaseCard<Structure> {
  public group = 'block';
  public isolating = true;
  public tagName(node: ProseMirrorNode) {
    return 'div';
  }
  public toDOM = (node: ProseMirrorNode) => createWrapperDOM(this.tagName(node), node.attrs) as DOMOutputSpec;
}
Card.prototype.NodeView = BlockCardView;

@defineMetadata(FLAG, FORMAT_TYPE.INLINE_CARD)
class InlineCard<Structure> extends BaseCard<Structure> {
  public group = 'inline';
  public inline = true;
  public tagName(node: ProseMirrorNode) {
    return 'span';
  }
  public toDOM = (node: ProseMirrorNode) => createWrapperDOM(this.tagName(node), node.attrs) as DOMOutputSpec;
}
InlineCard.prototype.NodeView = InlineCardView;

// Deprecated
const configuration = (_config: ICardConfig) => (card: any) => {
  let config: ICardConfig & Types.StringMap<any> = _config;
  const type = getMetadata(FLAG, card);

  if (!type || !isCardSchema(card)) {
    console.warn('config with not card type!');
    return card;
  }

  const Super = isInlineSchema(card) ? InlineAtom : BlockAtom;
  config = Object.assign(new Super(), config);

  // whether it is a sylCard, used to click to select node
  if (config.sylCard === undefined) {
    config.sylCard = true;
  }
  // if need to select node before you can drag. (default true)
  if (config.draggable === undefined) {
    config.draggable = true;
  }

  const meta = new SchemaMeta(type, config.name, config);
  defineMetadata(META, meta)(card);
  return card;
};

export { BaseCard, BaseCardView, BlockCardView, Card, configuration, ICardConfig, InlineCard, InlineCardView };
