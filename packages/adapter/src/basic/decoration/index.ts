import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationAttrs, DecorationSet, EditorView } from 'prosemirror-view';

import { Types } from '../../libs';

interface IDecoType {
  ADD: 'add';
  REMOVE: 'remove';
  APPEND_NODE: 'appendNode';
  APPEND_INLINE: 'appendInline';
}

interface IDecoState {
  action: Types.ValueOf<IDecoType>;
  dom?: HTMLElement;
  data: {
    pos?: number;
    from?: number;
    to?: number;
    attrs?: DecorationAttrs;
    shadow?: (dom: HTMLElement, view: EditorView, getPos: () => number) => HTMLElement;
    spec: {
      key: string;
      onRemove?: () => void;
      [k: string]: any;
    };
  };
}

const DECO_TYPE: IDecoType = {
  ADD: 'add',
  REMOVE: 'remove',
  APPEND_NODE: 'appendNode',
  APPEND_INLINE: 'appendInline',
};

const DecoKey = new PluginKey('decoration');

const DecorationPlugin = () =>
  new Plugin({
    key: DecoKey,
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr, set: DecorationSet) {
        let newSet = set;
        const decoState: IDecoState = tr.getMeta(DecoKey);
        if (decoState && decoState.action) {
          const findItem = () => newSet.find(undefined, undefined, ({ key }) => key === decoState.data.spec.key);
          let targetItems: Decoration[] = findItem();
          switch (decoState.action) {
            case DECO_TYPE.ADD: {
              if (targetItems.length) break;
              const { pos, shadow, spec } = decoState.data;
              newSet = newSet.add(tr.doc, [
                Decoration.widget(pos!, (view, getPos) => shadow!(decoState.dom!, view, getPos), spec),
              ]);
              break;
            }
            case DECO_TYPE.REMOVE: {
              let times = 0;
              const removeItem = () => {
                targetItems.forEach(target => {
                  target.spec.onRemove && target.spec.onRemove();
                });
                newSet = newSet.remove(targetItems);
              };
              while (targetItems.length && times < 3) {
                targetItems[0].from = targetItems[0].from - times;
                targetItems[0].to = targetItems[0].to - times;
                removeItem();
                targetItems = findItem();
                times++;
              }
              break;
            }
            case DECO_TYPE.APPEND_NODE: {
              if (targetItems.length) break;
              const { from, to, attrs, spec } = decoState.data;
              newSet = newSet.add(tr.doc, [Decoration.node(from!, to!, attrs!, spec)]);
              break;
            }
            case DECO_TYPE.APPEND_INLINE: {
              if (targetItems.length) break;
              const { from, to, attrs, spec } = decoState.data;
              newSet = newSet.add(tr.doc, [Decoration.inline(from!, to!, attrs!, spec as any)]);
            }
          }
          return newSet;
        } else {
          return newSet.map(tr.mapping, tr.doc, {
            onRemove: spec => spec.onRemove && spec.onRemove(),
          });
        }
      },
    },
    appendTransaction(trs: Transaction[], oldState: EditorState, newState: EditorState) {
      let tr = newState.tr;
      const newDecorations = DecoKey.getState(newState).find() as Decoration[];
      const oldDecorations = DecoKey.getState(oldState).find() as Decoration[];
      if (newDecorations.length < oldDecorations.length) {
        oldDecorations.some(decoration => {
          if (
            decoration.from <= tr.doc.content.size &&
            newDecorations.every(({ spec }) => spec.key !== decoration.spec.key)
          ) {
            const $pos = tr.doc.resolve(decoration.from);
            let from = $pos.pos;
            let to = $pos.pos;
            let zeroBefore = null;
            let zeroAfter = null;
            $pos.nodeBefore && (zeroBefore = $pos.nodeBefore.textContent.match(/\u200B$/));
            $pos.nodeAfter && (zeroAfter = $pos.nodeAfter.textContent.match(/^\u200B/));
            zeroBefore && (from -= zeroBefore.length);
            zeroAfter && (to += zeroAfter.length);
            tr = tr.delete(from, to);
            return true;
          } else {
            return false;
          }
        });
        return tr;
      } else {
        return null;
      }
    },
    props: {
      decorations(state) {
        return (this as Plugin).getState(state) as DecorationSet;
      },
    },
  });

export { DECO_TYPE, DecoKey, DecorationPlugin, IDecoState };
