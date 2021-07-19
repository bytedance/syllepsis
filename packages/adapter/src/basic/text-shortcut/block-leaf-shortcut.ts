import { NodeType } from 'prosemirror-model';

import { Types } from '../../libs';
import { SylSchema } from '../../schema';
import { getShortcutAttrs, TextShortcut } from './shortcut-plugin';

const blockLeafShortcut = (
  regexp: RegExp,
  name: string,
  config: Types.ValueOf<NonNullable<SylSchema<any>['textMatcher']>>,
) =>
  new TextShortcut(
    name,
    regexp,
    (view, state, match, start, end) => {
      const nodeType: NodeType = state.schema.nodes[name];
      if (!nodeType) return null;

      const attrs = getShortcutAttrs(config.handler, view, match, start, end);
      if (!attrs) return null;

      const $pos = state.doc.resolve(start);
      const newNode = nodeType.create(attrs);
      return state.tr.replaceWith($pos.before(), $pos.after(), newNode);
    },
    config,
  );

export { blockLeafShortcut };
