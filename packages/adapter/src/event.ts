import { EventEmitter } from 'eventemitter3';

enum LocalEvent {
  EDITOR_CREATED = 'editor-created',
  TEXT_CHANGED = 'text-change',
  SELECTION_CHANGED = 'selection-change',
  ON_CHANGE = 'state-change',
  ON_BLUR = 'blur',
  ON_FOCUS = 'focus',
  EDITOR_WILL_UNMOUNT = 'editor-will-unmount',
  SWITCH_LAYER = 'switch-layer',
  LOCALE_CHANGE = 'locale-change',
  CONFIG_PLUGIN_CHANGE = 'config-plugin-change',
}

interface EventChannel {
  LocalEvent: LocalEvent;
}
class EventChannel extends EventEmitter {
  static LocalEvent = LocalEvent;
}

export { EventChannel, LocalEvent };
