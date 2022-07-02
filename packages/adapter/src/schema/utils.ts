import { DOMOutputSpec } from 'prosemirror-model';

import { formatToDOMAttrs, getMetadata, Types } from '../libs';
import { FLAG, FORMAT_TYPE, SYL_TAG } from './const';

const createElement = (tagName: string) => {
  const container = document.createElement(tagName);
  container.setAttribute(SYL_TAG, 'true');
  return container;
};

const createCardDOM = () => createElement('div');
const createInlineCardDOM = () => createElement('syl-inline');

// provide default `toDOM` according to `tagName`, `attrs` and `content`
const createWrapperDOM = (tagName: string, attrs: Types.StringMap<any> = {}, hasContent = false): DOMOutputSpec => {
  const pDOM: DOMOutputSpec = [tagName, formatToDOMAttrs(attrs)];
  if (hasContent) pDOM[2] = 0;

  return pDOM;
};

const createMaskDOM = () => document.createElement('mask');
const createTemplDOM = () => {
  const dom = document.createElement('templ');
  dom.setAttribute('style', 'display: none;');
  return dom;
};

const checkType = (current: any, type: number) => {
  const flag = getMetadata(FLAG, current);
  return Boolean(flag) && Boolean(flag & type);
};

const getSchemaType = (Ctor: Types.Ctor): FORMAT_TYPE => getMetadata(FLAG, Ctor);
const isCardSchema = (Ctor: Types.Ctor) => checkType(Ctor, FORMAT_TYPE.CARD);
const isInlineSchema = (Ctor: Types.Ctor | Types.StringMap<any>) => checkType(Ctor, FORMAT_TYPE.INLINE);
const isBlockSchema = (Ctor: Types.Ctor) => checkType(Ctor, FORMAT_TYPE.BLOCK);

export {
  createCardDOM,
  createInlineCardDOM,
  createMaskDOM,
  createTemplDOM,
  createWrapperDOM,
  getSchemaType,
  isBlockSchema,
  isCardSchema,
  isInlineSchema,
};
