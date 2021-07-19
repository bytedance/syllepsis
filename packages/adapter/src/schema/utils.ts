import 'reflect-metadata';

import { Types } from '../libs';
import { FLAG, FORMAT_TYPE, SYL_TAG } from './const';

const createElement = (tagName: string) => {
  const container = document.createElement(tagName);
  container.setAttribute(SYL_TAG, 'true');
  return container;
};

const createCardDOM = () => createElement('div');
const createInlineCardDOM = () => createElement('syl-inline');

const createMaskDOM = () => document.createElement('mask');
const createTemplDOM = () => {
  const dom = document.createElement('templ');
  dom.setAttribute('style', 'display: none;');
  return dom;
};

const checkType = (current: any, type: number) => {
  const flag = Reflect.getMetadata(FLAG, current);
  return Boolean(flag) && Boolean(flag & type);
};

const getSchemaType = (Ctor: Types.Ctor): FORMAT_TYPE => Reflect.getMetadata(FLAG, Ctor);
const isCardSchema = (Ctor: Types.Ctor) => checkType(Ctor, FORMAT_TYPE.CARD);
const isInlineSchema = (Ctor: Types.Ctor | Types.StringMap<any>) => checkType(Ctor, FORMAT_TYPE.INLINE);
const isBlockSchema = (Ctor: Types.Ctor) => checkType(Ctor, FORMAT_TYPE.BLOCK);

export {
  createCardDOM,
  createInlineCardDOM,
  createMaskDOM,
  createTemplDOM,
  getSchemaType,
  isBlockSchema,
  isCardSchema,
  isInlineSchema,
};
