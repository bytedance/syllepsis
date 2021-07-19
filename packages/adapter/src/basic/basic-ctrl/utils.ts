import { Node as ProsemirrorNode } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { DecorationSet, EditorView } from 'prosemirror-view';

import { browser } from '../../libs';
import { DecoKey } from '../decoration';

interface IClickOn {
  node: ProsemirrorNode<any>;
  nodePos: number;
  view: EditorView<any>;
  pos: number;
  event: MouseEvent;
}

type ClickHandler = (T: IClickOn) => boolean;

const chainClickEvent = (params: IClickOn, ...args: Array<ClickHandler>) =>
  Array.from(args).some(handler => handler(params));

type KeyboardHandle = ({ view, event }: { view: EditorView; event: KeyboardEvent }) => boolean;

const chainKeyDownEvent = (view: EditorView, event: KeyboardEvent, ...args: Array<KeyboardHandle>) =>
  Array.from(args).some(handler => handler({ view, event }));

const checkIsRawBlock = (node: ProsemirrorNode | null | undefined) => node && node.isBlock && !node.isTextblock;

// insert `paragraph` in the middle when text cannot be inserted to the before and after node
const insertPWhenBlock = (view: EditorView, pos: number) => {
  const $pos = view.state.doc.resolve(pos);
  if ($pos.node().type === view.state.doc.type) {
    const { nodeBefore, nodeAfter } = $pos;
    if (checkIsRawBlock(nodeBefore) && checkIsRawBlock(nodeAfter)) {
      const { dispatch, state } = view;
      let tr = state.tr.insert(pos, state.schema.nodes.paragraph.create());
      tr = tr.setSelection(TextSelection.create(tr.doc, pos + 1));
      dispatch(tr);
      view.focus();
    }
  }
};

const zeroRegTail = /\u200B+$/;
const zeroRegHead = /^\u200B+/;

const doPassZeroTr = (direction: 1 | -1, view: EditorView) => {
  const decorationState = DecoKey.getState(view.state) as DecorationSet;
  const decorations = decorationState.find(undefined, undefined, spec => spec.shadowType === 'inline');
  const { $from, empty } = view.state.selection;
  const passNode = direction > 0 ? $from.nodeAfter : $from.nodeBefore;

  if (!passNode || !passNode.isText) return false;
  const reg = direction > 0 ? zeroRegHead : zeroRegTail;
  const matchRes = passNode.textContent.match(reg);
  if (!matchRes) return false;
  const { dispatch, state } = view;
  const newPos = direction > 0 ? $from.pos + matchRes[0].length : $from.pos - matchRes[0].length + (empty ? 0 : 1);

  let preventDefault = false;
  if (
    empty &&
    decorations.some(({ from }) => (newPos < from && $from.pos > from) || (newPos > from && $from.pos < from))
  ) {
    preventDefault = true;
  }
  dispatch(state.tr.setSelection(TextSelection.create(state.doc, newPos)));
  return preventDefault;
};

const passZeroWidthChar = ({ view, event }: { view: EditorView; event: KeyboardEvent }) => {
  const { keyCode, which, key } = event;
  if (keyCode === 39 || which === 39 || key === 'ArrowRight') {
    return doPassZeroTr(1, view);
  } else if (keyCode === 37 || which === 37 || key === 'ArrowLeft') {
    return doPassZeroTr(-1, view);
  }
  return false;
};

const createPlaceHolder = (placeholder: string) => (view: EditorView) => {
  const span = document.createElement('span');
  span.classList.add('syl-placeholder');
  const { parent } = view.state.selection.$from;
  let styleText = 'cursor: text; user-select: none;text-indent: initial;';
  if ((!browser.android && !browser.ios && !browser.mac) || (browser.mac && browser.chrome)) {
    styleText += ' position: absolute;';
  }
  if (parent.attrs.align === 'right') {
    const paddingRight = parseInt(window.getComputedStyle(view.dom).paddingRight, 10);
    styleText += ` right: ${paddingRight}px`;
  } else if (parent.attrs.align === 'center') {
    styleText += ' transform: translateX(-50%);';
  }

  span.setAttribute('style', styleText);
  span.setAttribute('ignoreel', 'true');
  span.addEventListener('click', () => view.focus());
  span.innerHTML = placeholder;
  return span;
};

export {
  chainClickEvent,
  chainKeyDownEvent,
  ClickHandler,
  createPlaceHolder,
  IClickOn,
  insertPWhenBlock,
  KeyboardHandle,
  passZeroWidthChar,
};
