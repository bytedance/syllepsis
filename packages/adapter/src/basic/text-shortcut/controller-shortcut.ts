import { Types } from '../../libs';
import { SylController } from '../../schema';
import { TextShortcut } from './shortcut-plugin';

const controllerShortcut = (
  regexp: RegExp,
  name: string,
  config: Types.ValueOf<NonNullable<SylController['textMatcher']>>,
) =>
  new TextShortcut(
    name,
    regexp,
    (view, state, match, start, end) => {
      if (config.handler) {
        config.handler(match, start, {
          getStart: () => view.coordsAtPos(start),
          getEnd: () => view.coordsAtPos(end),
        });
      }
      return null;
    },
    config,
  );

export { controllerShortcut };
