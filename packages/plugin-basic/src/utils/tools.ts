import { SylApi, Types } from '@syllepsis/adapter';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import { NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

const getMarkDisable = (excludeMarks: string | undefined, markName: string) => {
  if (!excludeMarks) return false;
  if (excludeMarks === '_') return true;
  if (excludeMarks.split(/\s/).includes(markName)) return true;
  return false;
};

const checkMarkDisable = (view: EditorView, markName: string) => {
  const { $from } = view.state.selection;
  if ($from.parent.type.spec.code) return true;
  const excludeMarks = $from.parent.type.spec.excludeMarks;
  if (!getMarkDisable(excludeMarks, markName)) {
    if ($from.depth > 1) {
      const parentExcludeMarks = $from.node($from.depth - 1).type.spec.excludeMarks;
      return getMarkDisable(parentExcludeMarks, markName);
    }
    return false;
  }

  return true;
};

const checkSupportAttr = (node: ProsemirrorNode, attrName: string) => node.attrs[attrName] !== undefined;

const checkParentSupportAttr = (view: EditorView, attrName: string) => {
  const { selection } = view.state;
  if (selection instanceof NodeSelection) {
    return checkSupportAttr(selection.node, attrName);
  }
  const { $from, $to } = selection;
  let isSupport = checkSupportAttr(selection.$from.node(), attrName);
  if (!isSupport && $from.nodeAfter && $from.pos === $to.pos) {
    isSupport = checkSupportAttr($from.nodeAfter, attrName);
  }
  return isSupport;
};

const setAlign = (view: EditorView, align: 'left' | 'center' | 'right' | 'justify') => {
  const { state, dispatch } = view;
  const tr = state.tr;
  const { ranges } = state.selection;
  if (!ranges.length) return false;
  ranges.forEach(range => {
    const from = range.$from.pos;
    const to = range.$to.pos;
    state.doc.nodesBetween(from, to, (node, nodePos) => {
      if (node.isTextblock || node.attrs.align !== undefined) {
        tr.setNodeMarkup(nodePos, undefined, { ...node.attrs, align });
        return false;
      }
    });
  });
  dispatch(tr);
  return true;
};

const checkParentHaveAttr = (view: EditorView, attrName: string, attrVal: string) =>
  view.state.selection.$from.parent.attrs[attrName] === attrVal;

type IUserAttrsConfig = Types.StringMap<{
  // used to extend default attrs
  default: any;
  [key: string]: any;
  getFromDOM: (dom: HTMLElement) => any | void | undefined; // used in `parseDOM`
  setDOMAttr: (value: string, attrs: Types.StringMap<any>) => void; // used in `toDOM`
}>;

// add user configuration to attrs attribute
const addAttrsByConfig = (config: IUserAttrsConfig = {}, schema: Types.StringMap<any>) => {
  if (!schema.attrs) schema.attrs = {};
  Object.keys(config).forEach(name => {
    Object.keys(config[name]).forEach(spec => {
      if (spec === 'getFromDOM' || spec === 'setDOMAttr') return;
      if (!schema.attrs[name]) schema.attrs[name] = {};
      schema.attrs[name][spec] = config[name][spec];
    });
  });
};

// uses the default value when return undefined
const getFromDOMByConfig = (config: IUserAttrsConfig = {}, dom: HTMLElement, parseAttrs: Types.StringMap<any>) =>
  Object.keys(config).forEach(name => {
    const value = config[name].getFromDOM(dom);
    if (value !== undefined) Object.assign(parseAttrs, { [name]: value });
  });

// used to construct dom in `toDOM`
const setDOMAttrByConfig = (config: IUserAttrsConfig = {}, node: ProsemirrorNode, attrs: Types.StringMap<any>) =>
  Object.keys(config).forEach(name => config[name].setDOMAttr(node.attrs[name], attrs));

// Keep the decimal point
const getFixSize = (num: number, count = 3) => Number(num.toFixed(count).replace(/\.?0+$/, ''));

const createFileInput = ({
  multiple = false,
  accept,
  onChange,
  getContainer = () => document.body,
}: {
  multiple: boolean;
  accept: string;
  onChange: (e: Event) => void;
  getContainer: () => HTMLElement;
}) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = multiple;
  input.accept = accept;
  input.style.display = 'none';
  input.addEventListener('change', e => {
    onChange(e);
    (e.target as HTMLInputElement).value = '';
  });
  getContainer().appendChild(input);
  return input;
};

const isMatchObject = (objStatic: any, objCompare: any) => {
  if (objStatic === objCompare) return true;
  if (!(objStatic && typeof objStatic === 'object') || !(objCompare && typeof objCompare === 'object')) return false;
  const isArray = Array.isArray(objStatic);
  if (Array.isArray(objCompare) !== isArray) return false;
  if (isArray) {
    if (objStatic.length !== objCompare.length) return false;
    for (let i = 0; i < objStatic.length; i++) if (!isMatchObject(objStatic[i], objCompare[i])) return false;
  } else {
    for (const p in objStatic) if (!(p in objCompare) || !isMatchObject(objStatic[p], objCompare[p])) return false;
  }
  return true;
};

const keymapToggleMark = (name: string) => (editor: SylApi) => {
  const isActive = editor.isActive(name);
  editor.setFormat({ [name]: !isActive });
  return true;
};

export {
  addAttrsByConfig,
  checkMarkDisable,
  checkParentHaveAttr,
  checkParentSupportAttr,
  createFileInput,
  getFixSize,
  getFromDOMByConfig,
  getMarkDisable,
  isMatchObject,
  IUserAttrsConfig,
  keymapToggleMark,
  setAlign,
  setDOMAttrByConfig,
};
