import { EditorState, Plugin, TextSelection, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

import { isEmptyDoc, isOriginAttrs, removeExcludesMarks, resetUnInheritAttr } from '../../libs';
import { DecoKey } from '../decoration';
import { BasicView } from './basic-view';
import { cardInput, cardSingleClick } from './card';
import { BSControlKey } from './const';
import { TDropCursorConfig } from './drop-cursor-view';
import {
  chainClickEvent,
  chainKeyDownEvent,
  createPlaceHolder,
  insertDefaultNodeWhenBlock,
  passZeroWidthChar,
} from './utils';

interface IBasicCtrlConfig {
  placeholder?: string;
  keepLastLine?: boolean;
  keepMarks?: boolean;
  dropCursor?: TDropCursorConfig;
  keepWhiteSpace?: boolean | 'full';
}

const BasicCtrlPlugin = (config: IBasicCtrlConfig, _editable = true) => {
  let editable = _editable;

  return new Plugin({
    key: BSControlKey,
    state: {
      init() {
        return {
          listNestedLevel: 0,
        };
      },
      apply(tr, set) {
        const data = tr.getMeta(BSControlKey);
        if (!data) return set;
        if (data.listNestedLevel !== undefined) {
          set.listNestedLevel = data.listNestedLevel;
        }
        if (data.editable !== undefined) {
          editable = data.editable;
        }
        return set;
      },
    },
    props: {
      handleDOMEvents: {
        paste(view: EditorView) {
          const { state, dispatch } = view;
          const { $from } = state.selection;
          if (
            $from.depth === 1 &&
            state.selection instanceof TextSelection &&
            !$from.parent.content.size &&
            isOriginAttrs($from.parent)
          ) {
            dispatch(view.state.tr.setSelection(TextSelection.create(state.doc, $from.before(), $from.after())));
          }
          return false;
        },
      },
      editable: () => editable,
      decorations(state) {
        if (!config.placeholder) return;
        const doc = state.doc;
        const decoState: DecorationSet = DecoKey.getState(state);
        if (decoState === DecorationSet.empty && isEmptyDoc(state.doc)) {
          return DecorationSet.create(doc, [Decoration.widget(1, createPlaceHolder(config.placeholder))]);
        }
      },
      handleClickOn(view, pos, node, nodePos, event) {
        if (!editable) return false;
        return chainClickEvent({ node, view, pos, nodePos, event }, cardSingleClick);
      },
      handleClick(view, pos, event) {
        insertDefaultNodeWhenBlock(view, pos, event);
        return false;
      },
      handleKeyDown(view, event) {
        if (!editable) return false;
        return chainKeyDownEvent(view, event, passZeroWidthChar, cardInput);
      },
    },
    view: view => new BasicView(view, config),
    appendTransaction: (trs: Transaction[], oldState: EditorState, newState: EditorState) => {
      const tr = newState.tr;
      let isModify = false;
      if (!oldState.storedMarks && newState.storedMarks && oldState.doc.nodeSize !== newState.doc.nodeSize) {
        newState.storedMarks.forEach(mark => {
          // do not clear mark which has `spec.notStore`
          if (mark.type.spec.notStore) {
            tr.removeStoredMark(mark);
            isModify = true;
          }
        });
      }
      const { $from } = newState.selection;
      if ($from.depth) {
        const isRemoved = removeExcludesMarks(tr);
        if (isRemoved && !isModify) isModify = true;
        resetUnInheritAttr(oldState, newState);
      }

      return isModify ? tr : undefined;
    },
  });
};

export { BasicCtrlPlugin, IBasicCtrlConfig };
