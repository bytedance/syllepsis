import 'reflect-metadata';

import { Node as ProseMirrorNode } from 'prosemirror-model';
import { NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { SylApi } from '../api';
import { EventChannel } from '../event';
import { Types } from '../libs';
import { FLAG, FORMAT_TYPE, META, SELECT_CLS, SYL_TAG } from './const';
import { IEventHandler } from './controller';
import { Atom, BlockAtom, InlineAtom, SchemaMeta, SylSchema } from './schema';
import {
  createCardDOM,
  createInlineCardDOM,
  createMaskDOM,
  createTemplDOM,
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

  public getBoundingClientRect(): Types.BoundingStatic {
    const pos = this.adapter.view.coordsAtPos(this.getPos());
    if (!this.root) this.root = this.adapter.root;
    const root = this.root;
    const rootRect = root.getBoundingClientRect();

    return {
      top: pos.top - rootRect.top,
      left: pos.left - rootRect.left,
      bottom: rootRect.bottom - pos.bottom,
      right: rootRect.right - pos.right,
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
@Reflect.metadata(FLAG, FORMAT_TYPE.BLOCK_CARD)
class Card<Structure> extends BaseCard<Structure> {
  public group = 'block';
  public isolating = true;
}
Card.prototype.NodeView = BlockCardView;

@Reflect.metadata(FLAG, FORMAT_TYPE.INLINE_CARD)
class InlineCard<Structure> extends BaseCard<Structure> {
  public group = 'inline';
  public inline = true;
}
InlineCard.prototype.NodeView = InlineCardView;

// Deprecated
const configuration = (_config: ICardConfig) => (card: any) => {
  let config: ICardConfig & Types.StringMap<any> = _config;
  const type = Reflect.getMetadata(FLAG, card);

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
  Reflect.defineMetadata(META, meta, card);
  return card;
};

export { BaseCard, BaseCardView, BlockCardView, Card, configuration, ICardConfig, InlineCard, InlineCardView };
