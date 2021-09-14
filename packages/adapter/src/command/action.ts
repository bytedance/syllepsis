import { Slice } from 'prosemirror-model';
import { __parseFromClipboard, EditorView } from 'prosemirror-view';

interface IPasteOption {
  plainText?: boolean; // default is false
  scrollIntoView?: boolean; // default is true
}

const paste = (view: EditorView, content: string, option: IPasteOption) => {
  if (!DataTransfer || !ClipboardEvent) return false;

  const plainText = option.plainText === true;

  const slice = __parseFromClipboard(
    view,
    plainText ? content : '',
    plainText ? '' : content,
    plainText,
    view.state.selection.$from,
  );

  const dataTransfer = new DataTransfer();
  if (plainText) {
    dataTransfer.setData('text/plain', content);
  } else {
    dataTransfer.setData('text/plain', content.replace(/<br.*?>/g, '\n').replace(/<.*?>/g, ''));
    dataTransfer.setData('text/html', content);
  }
  const fakeEvent = new ClipboardEvent('paste', { clipboardData: dataTransfer });

  if (view.someProp('handlePaste', f => f(view, fakeEvent, slice || Slice.empty))) return true;
  if (!slice) return false;

  const singleNode =
    !slice.openStart && !slice.openEnd && slice.content.childCount === 1 ? slice.content.firstChild : null;

  const tr = singleNode
    ? view.state.tr.replaceSelectionWith(singleNode, plainText)
    : view.state.tr.replaceSelection(slice);

  if (option.scrollIntoView !== false) tr.scrollIntoView();
  view.dispatch(tr.setMeta('paste', true).setMeta('uiEvent', 'paste'));

  return true;
};

export { IPasteOption, paste };
