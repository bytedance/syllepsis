import { MarkType } from 'prosemirror-model';

import { Types } from '../../libs';
import { SylSchema } from '../../schema';
import { getShortcutAttrs, TextShortcut } from './shortcut-plugin';

const textMarkShortcut = (
  regexp: RegExp,
  name: string,
  config: Types.ValueOf<NonNullable<SylSchema<any>['textMatcher']>>,
) =>
  new TextShortcut(
    name,
    regexp,
    (view, state, match, start, end) => {
      const contentText = match[1];
      const mark: MarkType = state.schema.marks[name];

      const attrs = getShortcutAttrs(config.handler, view, match, start, end);
      const stashMark = view.state.doc.resolve(start).marks();
      if (!attrs) return null;
      const tr = state.tr;
      // add mark and keep the existing mark. The blank is inserted to not apply the 'add mark' to the following input
      tr.delete(start, end).insert(start, [
        state.schema.text(contentText, [mark.create(attrs), ...stashMark]),
        state.schema.text('\u0020', stashMark),
      ]);
      return tr;
    },
    config,
  );

export { textMarkShortcut };
