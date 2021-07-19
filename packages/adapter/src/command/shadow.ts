import { EditorState } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

import { DecoKey, IDecoState } from '../basic/decoration';
import { IG_EL } from '../formatter';
import { Types } from '../libs';
import { createCardDOM, createInlineCardDOM } from '../schema';

const createShadowWrapper = (inline: boolean) => {
  let dom: HTMLElement;
  if (inline) dom = createInlineCardDOM();
  else dom = createCardDOM();
  dom.setAttribute(IG_EL, 'true');
  return dom;
};

const getShadows = (
  state: EditorState,
  key?: ((spec: Types.StringMap<any>) => boolean) | string,
  start?: number,
  end?: number,
) => {
  let specMatch;
  if (key) {
    if (typeof key === 'string') {
      specMatch = (_spec: Types.StringMap<any>) => _spec.key === key;
    } else if (typeof key === 'function') {
      specMatch = key;
    }
  }

  const decorations = (DecoKey.getState(state) as DecorationSet).find(start, end, specMatch) as Decoration[];

  return decorations;
};

// data needs to provide pos, shadow
const insertShadow = (
  state: EditorState,
  dispatch: EditorView['dispatch'],
  data: IDecoState['data'] & { editable?: boolean },
  inline: boolean,
) => {
  let tr = state.tr;
  let fixPos = 0;
  if (inline && data.editable) {
    tr = state.tr.insert(data.pos!, state.schema.text('\u200B\u200B'));
    fixPos = 1;
  }

  dispatch(
    tr.setMeta(DecoKey, {
      action: 'add',
      data: {
        ...data,
        pos: data.pos! + fixPos,
        spec: { ...data.spec, shadowType: inline ? 'inline' : 'block' },
      },
      dom: createShadowWrapper(inline),
    }),
  );
};

const removeShadow = (state: EditorState, dispatch: EditorView['dispatch'], key: string) => {
  const decorations = getShadows(state, key);
  if (!decorations.length) return;
  const { from, to, spec } = decorations[0];
  const $pos = state.tr.doc.resolve(from);
  let fixPos = 0;
  if ($pos.nodeBefore && $pos.nodeBefore.textContent.match(/\u200B$/)) {
    fixPos = -1;
  }
  dispatch(
    state.tr.setMeta(DecoKey, {
      action: 'remove',
      data: {
        spec: { key },
      },
    }),
  );
  return {
    spec,
    from: from + fixPos,
    to: to + fixPos,
  };
};

// data must have from, to,
const appendShadow = (
  state: EditorState,
  dispatch: EditorView['dispatch'],
  data: IDecoState['data'],
  inline: boolean,
) => {
  dispatch(
    state.tr.setMeta(DecoKey, {
      action: inline ? 'appendInline' : 'appendNode',
      data,
    }),
  );
};

export { appendShadow, getShadows, insertShadow, removeShadow };
