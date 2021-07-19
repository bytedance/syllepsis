import {
  baseKeymap,
  chainCommands,
  createParagraphNear,
  joinBackward,
  joinDown,
  joinUp,
  lift,
  liftEmptyBlock,
  newlineInCode,
  selectNodeBackward,
  selectParentNode,
} from 'prosemirror-commands';
import { redo } from 'prosemirror-history';
import { keydownHandler } from 'prosemirror-keymap';
import { Plugin, PluginKey } from 'prosemirror-state';

import { Types } from '../../libs';
import {
  clearFormatAtHead,
  deleteSelection,
  deleteZeroChar,
  insertBreak,
  selectBefore,
  splitBlockKeepMarks,
  undo,
} from './behavior';

const createKeyMapPlugin = (bindings: Types.StringMap<any>, key: PluginKey) =>
  new Plugin({ key, props: { handleKeyDown: keydownHandler(bindings) } });

// to prevent override basemap's basic map
const backspace = chainCommands(
  deleteSelection,
  selectBefore,
  joinBackward,
  selectNodeBackward,
  clearFormatAtHead,
  deleteZeroChar,
);

const enter = chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlockKeepMarks);

const composeKeymap = (keyMaps: Types.StringMap<any>[], mapping: Types.StringMap<any> = {}) =>
  keyMaps.reduce((res, cur) => {
    Object.keys(cur).forEach(key => {
      if (res[key]) {
        res[key] = chainCommands(res[key], cur[key]);
      } else {
        res[key] = cur[key];
      }
    });
    return res;
  }, mapping);

const getCustomKeymapPlugins = (customKeyMaps: Types.StringMap<any>[]) =>
  createKeyMapPlugin(composeKeymap(customKeyMaps), new PluginKey('customKeymap'));

const getInnerKeymapPlugins = () => [
  createKeyMapPlugin(
    {
      Enter: enter,
      'Mod-z': undo,
      'Mod-y': redo,
      'Shift-Mod-z': redo,
      Backspace: backspace,
      'Alt-ArrowUp': joinUp,
      'Alt-ArrowDown': joinDown,
      'Mod-Bracketleft': lift,
      Escape: selectParentNode,
      'Shift-Enter': insertBreak,
    },
    new PluginKey('basicKeymap'),
  ),
  createKeyMapPlugin(baseKeymap, new PluginKey('defaultKeymap')),
];

const getKeymapPlugins = (customKeyMaps: Types.StringMap<any>[]) => [
  getCustomKeymapPlugins(customKeyMaps),
  ...getInnerKeymapPlugins(),
];

export { composeKeymap, getCustomKeymapPlugins, getInnerKeymapPlugins, getKeymapPlugins };
