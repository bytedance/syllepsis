import EventEmitter from 'eventemitter3';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { SylApi } from '../../api';
import { EventChannel } from '../../event';

const pluginKey = new PluginKey('lifecycle');

const emitLifeCycleEvent = (view: EditorView, prevState: EditorState, emitter: EventEmitter) => {
  const { state } = view;
  if (!prevState.doc.eq(state.doc)) {
    /**
     * TODO
     * since the timing of updating the DOM by libraries such as react and vue is not synchronized.
     * it will make `getHTML()` return lagging content  if trigger the `text-change` event synchronized
     */
    setTimeout(() => emitter.emit(EventChannel.LocalEvent.TEXT_CHANGED));
  }
  if (!prevState.selection.eq(state.selection)) {
    emitter.emit(EventChannel.LocalEvent.SELECTION_CHANGED);
  }
};
const createLifeCyclePlugin = (adapter: SylApi) =>
  new Plugin({
    key: pluginKey,
    view: () => ({
      update: (view: EditorView, prevState: EditorState) =>
        emitLifeCycleEvent(view, prevState, adapter.configurator.emitter),
    }),
  });

export { createLifeCyclePlugin, emitLifeCycleEvent };
