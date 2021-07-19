import type { NodeType } from 'prosemirror-model';

declare module 'prosemirror-model' {
  interface AttributeSpec {
    inherit?: boolean;
  }
  interface NodeType {
    defaultAttrs: Record<string, any>;
  }
}
