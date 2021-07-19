import { NodeType } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { canJoin, findWrapping } from 'prosemirror-transform';

import { Types } from '../../libs';
import { SylSchema } from '../../schema';
import { getShortcutAttrs, TextShortcut } from './shortcut-plugin';

const textblockTypeTextShortcut = (
  regexp: RegExp,
  name: string,
  config: Types.ValueOf<NonNullable<SylSchema<any>['textMatcher']>>,
) =>
  new TextShortcut(
    name,
    regexp,
    (view, state, match, start, end) => {
      const { tr } = state;
      const $start = tr.doc.resolve(start);

      const attrs = getShortcutAttrs(config.handler, view, match, start, end);
      if (!attrs) return null;
      const nodeType = state.schema.nodes[name] as NodeType;

      if (!nodeType || !$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) {
        return null;
      }

      // like header
      if (nodeType.isTextblock) {
        return tr.setBlockType(start, undefined, nodeType, attrs).delete(start, end);
      }

      const subNodeType = nodeType.contentMatch.defaultType;

      // like hr
      if (!subNodeType) {
        return tr.replaceRangeWith($start.before(), $start.after(), nodeType.create(attrs));
      } else if (subNodeType !== $start.node().type) {
        // like list, blockquote
        tr.setBlockType($start.before(), $start.after(), subNodeType).setSelection(
          TextSelection.create(tr.doc, state.selection.from, state.selection.to),
        );
      }

      tr.delete(start, end);
      const range = tr.selection.$from.blockRange();
      const wrapping = range && findWrapping(range, nodeType, attrs);

      if (!wrapping || !range) return null;
      tr.wrap(range, wrapping);
      const before = state.tr.doc.resolve(start - 1).nodeBefore;
      if (before && before.type === nodeType && canJoin(tr.doc, start - 1)) {
        tr.join(start - 1);
      }
      return tr;
    },
    config,
  );

export { textblockTypeTextShortcut };
