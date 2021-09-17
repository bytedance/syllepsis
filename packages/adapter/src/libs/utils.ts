import { SylApi, TSylApiCommand } from '../api';
import { Types } from './types';

const getObjectType = (obj: any) => Object.prototype.toString.call(obj);

const isFunction = (obj: any) => getObjectType(obj) === '[object Function]';

const isPureObject = (obj: any) => getObjectType(obj) === '[object Object]';

const isEmpty = (val: any) => val === null || val === undefined || val === '';

const checkIsPrintableKey = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) return false;
  const keycode = e.keyCode || e.which;
  if (
    (keycode > 47 && keycode < 58) || // number keys
    keycode === 32 ||
    keycode === 13 || // space & return key(s) (if you want to allow carriage returns)
    (keycode > 64 && keycode < 91) || // letter keys
    (keycode > 95 && keycode < 112) || // numpad keys
    (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
    (keycode > 218 && keycode < 223) // [\]' (in order)
  ) {
    return true;
  }
};

const judgeKey = (e: KeyboardEvent, key: string, keyCode: number) =>
  e.key === key || e.keyCode === keyCode || e.which === keyCode;

const isBackSpace = (e: KeyboardEvent) => judgeKey(e, 'Backspace', 8);

const warpCommand = (adapter: SylApi, command: any): TSylApiCommand => (...args) =>
  command.apply(null, [adapter, ...args]);

let detachedDocument: Document | null = null;

const createDetachedElement = (tagName: string) => {
  if (!detachedDocument) detachedDocument = document.implementation.createHTMLDocument('detach');
  return detachedDocument.createElement(tagName);
};

const formatToDOMAttrs = (attrs: Types.StringMap<any>) => {
  const result: Types.StringMap<any> = {};
  Object.keys(attrs).forEach(key => {
    const value = attrs[key];
    if (isEmpty(value)) return;
    if (value instanceof Object) result[key] = JSON.stringify(value);
    else result[key] = value;
  });
  return result;
};

type ToArray<T> = T extends any[] ? T : T[];

const toArray = <T>(arg: T) => {
  if (arg instanceof Array) return arg as ToArray<T>;
  return [arg] as ToArray<T>;
};
const groupData = (target: any, key: string, handler: any) => {
  if (!Array.isArray(target[key])) target[key] = [];
  target[key].push(handler);
};

const filterData = (target: any, key: string, handler: any) => {
  if (!Array.isArray(target[key])) return;
  target[key] = target[key].filter((fn: any) => fn !== handler);
};

export {
  checkIsPrintableKey,
  createDetachedElement,
  filterData,
  formatToDOMAttrs,
  getObjectType,
  groupData,
  isBackSpace,
  isFunction,
  isPureObject,
  judgeKey,
  toArray,
  warpCommand,
};
