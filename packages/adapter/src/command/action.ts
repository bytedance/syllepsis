import { EditorView } from 'prosemirror-view';

interface IPasteOption {
  plainText?: boolean; // default is false
  scrollIntoView?: boolean; // default is true
}

const dispatchEvent = (view: EditorView, event: Event) => view.dispatchEvent(event);

const pasteContent = (view: EditorView, content: string, option: IPasteOption) => {
  if (!DataTransfer || !ClipboardEvent) return false;

  const plainText = option.plainText === true;
  const dataTransfer = new DataTransfer();
  if (plainText) {
    dataTransfer.setData('text/plain', content);
  } else {
    dataTransfer.setData('text/plain', content.replace(/<br.*?>/g, '\n').replace(/<.*?>/g, ''));
    dataTransfer.setData('text/html', content);
  }
  const fakeEvent = new ClipboardEvent('paste', { clipboardData: dataTransfer });

  dispatchEvent(view, fakeEvent);
  return true;
};

export { dispatchEvent, IPasteOption, pasteContent };
