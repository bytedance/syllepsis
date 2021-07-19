import { Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { getStoreMarks } from '../../libs/prose-util';
import { DropCursorView } from './drop-cursor-view';
import { IBasicCtrlConfig } from './plugin';

const shouldInsertParagraph = (child: Node | null | undefined) => {
  // `notLastLine` is used to declare that the node shouldn't be the last line
  if (!child || child.type.spec.notLastLine) return true;

  let lastChild = child;
  while (lastChild) {
    if (!lastChild.lastChild) break;
    lastChild = lastChild.lastChild;
  }
  return !lastChild.isTextblock || Boolean(lastChild.content.size);
};

class BasicView {
  public config: IBasicCtrlConfig;
  public dropCursor: undefined | any;

  constructor(view: EditorView, config: IBasicCtrlConfig) {
    this.config = config;

    if (config.dropCursor !== false) {
      this.dropCursor = new DropCursorView(view, typeof config.dropCursor !== 'object' ? undefined : config.dropCursor);
    }
  }

  update(view: EditorView, prevState: EditorState) {
    this.dropCursor && this.dropCursor.update(view, prevState);
    const {
      state,
      state: { doc, tr },
      dispatch,
    } = view;
    const { lastChild } = doc;

    // it would insert paragraph even if `keepLastLine` is `false`, when the lastChild is `atom`.
    if (this.config.keepLastLine === false && lastChild && !lastChild.type.isAtom) return;

    if (!shouldInsertParagraph(lastChild)) return;
    const marks = getStoreMarks(state);
    dispatch(
      tr
        .insert(doc.nodeSize - 2, state.schema.topNodeType.contentMatch.defaultType.create())
        .ensureMarks(marks)
        .setMeta('addToHistory', false),
    );
  }

  destroy() {
    this.dropCursor && this.dropCursor.destroy();
  }
}
export { BasicView };
