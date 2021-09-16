import { Transaction } from 'prosemirror-state';

declare module 'prosemirror-view' {
  interface EditorView {
    editable: boolean;
    docView: any;
    dispatchEvent: (event: Event) => void;
  }
}

declare module 'prosemirror-state' {
  interface PluginSpec {
    prioritize?: boolean;
  }

  interface EditorState {
    applyInner: (tr: Transaction) => EditorState;
  }
}

declare module 'prosemirror-model' {
  interface AttributeSpec {
    inherit?: boolean;
  }
}
