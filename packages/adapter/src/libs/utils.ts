import { SylApi, TSylApiCommand } from '../api';

const getObjectType = (obj: any) => Object.prototype.toString.call(obj);

const isFunction = (obj: any) => getObjectType(obj) === '[object Function]';

const isPureObject = (obj: any) => getObjectType(obj) === '[object Object]';

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

export {
  checkIsPrintableKey,
  createDetachedElement,
  getObjectType,
  isBackSpace,
  isFunction,
  isPureObject,
  judgeKey,
  warpCommand,
};
