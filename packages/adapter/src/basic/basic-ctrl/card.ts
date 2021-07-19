import { NodeSelection } from 'prosemirror-state';

import { checkIsPrintableKey } from '../../libs';
import { ClickHandler, KeyboardHandle } from './utils';

const cardSingleClick: ClickHandler = ({ node, nodePos, view }) => {
  if (node.type.spec.sylCard) {
    const {
      state: { tr, doc },
      dispatch,
    } = view;
    const newSelection = NodeSelection.create(doc, nodePos);
    dispatch(tr.setSelection(newSelection));
    return true;
  }
  return false;
};

const cardInput: KeyboardHandle = ({ view, event }) => {
  const {
    state: { tr },
    dispatch,
  } = view;
  // should delete Node when input with NodeSelection
  if (checkIsPrintableKey(event) && tr.selection instanceof NodeSelection) {
    dispatch(tr.deleteSelection());
  }
  return false;
};

export { cardInput, cardSingleClick };
