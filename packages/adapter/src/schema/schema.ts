import { DOMOutputSpec, DOMOutputSpecArray, Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorView, NodeView as BaseNodeView } from 'prosemirror-view';

import { SylApi } from '../api';
import { defineMetadata, formatToDOMAttrs, Types } from '../libs';
import { FLAG, FORMAT_TYPE } from './const';
import { IMatcherConfig, ParseDOMMatcher, TextMatcherHandler } from './matchers';

// provide default `toDOM` according to `tagName`, `attrs` and `content`
const createWrapperDOM = (tagName: string, attrs: Types.StringMap<any> = {}, hasContent = false): DOMOutputSpec => {
  const pDOM: DOMOutputSpecArray = [tagName, formatToDOMAttrs(attrs)];
  if (hasContent) pDOM[2] = 0;

  return pDOM;
};

@defineMetadata(FLAG, FORMAT_TYPE.BLOCK)
class SylSchema<Structure> {
  public name = '';
  public attrs?: {
    [key in keyof Structure]: {
      default?: Structure[key];
    };
  };
  public isolating?: boolean;
  // it will help `toDOM` if provide `tagName`, otherwise will use default `tagName`
  public tagName?(node: ProseMirrorNode): string;
  public textMatcher?: Array<IMatcherConfig<RegExp | RegExp[], TextMatcherHandler>>;
  public parseDOM?: ParseDOMMatcher<Structure>[];
  public toDOM?(node: ProseMirrorNode): DOMOutputSpec;
}

class Formattable<Structure extends any = any, Props extends any = any> extends SylSchema<Structure> {
  public editor?: SylApi;
  public props: Partial<Props> = {};

  constructor(editor?: SylApi, props?: Partial<Props>) {
    super();
    this.editor = editor;
    props && (this.props = props);
  }

  declare NodeView?: {
    // getPos is True when form `marks`
    new (adapter: SylApi, node: ProseMirrorNode, view: EditorView, getPos: boolean | (() => number)): BaseNodeView;
  };
}

@defineMetadata(FLAG, FORMAT_TYPE.BLOCK)
class Block<Structure> extends Formattable<Structure> {
  public group = 'block';
  public content = 'inline*';
  public inline = false;
  public defining = true;
  public draggable = false;
  public selectable = false;
  public tagName(node: ProseMirrorNode) {
    return 'div';
  }
  public toDOM = (node: ProseMirrorNode) => createWrapperDOM(this.tagName(node), node.attrs, Boolean(this.content));
}

/**
 * used to describe sematic inline, same as `inline` in css
 * `notClear` declares that it shouldn't be cleared by `SylApi.clearFormat`
 * `notStore` declares that it wouldn't be stored after deletion
 */
@defineMetadata(FLAG, FORMAT_TYPE.INLINE)
class Inline<Structure> extends Formattable<Structure> {
  public group = 'inline';
  public inline = true;
  public notClear?: boolean;
  public notStore?: boolean;
  public tagName(node: ProseMirrorNode) {
    return 'span';
  }
  public toDOM = (node: ProseMirrorNode) => createWrapperDOM(this.tagName(node), node.attrs, true);
}

@defineMetadata(FLAG, FORMAT_TYPE.ATOM)
class Atom<Structure> extends Formattable<Structure> {
  public isLeaf = true;
  public draggable = true;
}

@defineMetadata(FLAG, FORMAT_TYPE.BLOCK_ATOM)
class BlockAtom<Structure> extends Atom<Structure> {
  public group = 'block';
  public inline = false;
  public isolating = true;
  public tagName(node: ProseMirrorNode) {
    return 'div';
  }
  public toDOM = (node: ProseMirrorNode) => createWrapperDOM(this.tagName(node), node.attrs);
}

@defineMetadata(FLAG, FORMAT_TYPE.INLINE_ATOM)
class InlineAtom<Structure> extends Atom<Structure> {
  public group = 'inline';
  public inline = true;
  public tagName(node: ProseMirrorNode) {
    return 'span';
  }
  public toDOM = (node: ProseMirrorNode) => createWrapperDOM(this.tagName(node), node.attrs);
}

// every plugin will generate a schemaMeta instance, it is actually can be
// used by ProseMirror, its `config` property is actually a SchemaSpec
class SchemaMeta<S extends SylSchema<any> = SylSchema<any>> {
  public formatType: FORMAT_TYPE;
  public name: string;
  public config: S;

  constructor(formatType: FORMAT_TYPE, name: string, config: S) {
    this.formatType = formatType;
    this.name = name;
    this.config = config;
  }

  public getDisplay(): 'nodes' | 'marks' {
    if (this.formatType & FORMAT_TYPE.INLINE) {
      if (this.formatType & FORMAT_TYPE.CARD || this.formatType & FORMAT_TYPE.ATOM) {
        return 'nodes';
      }

      return 'marks';
    }
    return 'nodes';
  }
}

export { Atom, Block, BlockAtom, Formattable, Inline, InlineAtom, SchemaMeta, SylSchema };
