import { testPlugins } from './plugins';
import { IModuleType, Types, SylApi } from '../../packages/adapter/dist/es';
import { SylEditorService } from '../../packages/editor/dist/es/Editor';

const createEditor = (
  content?: string | Record<string, any>,
  selection?: Types.IRangeStatic,
  dom: HTMLElement = document.createElement('div'),
  sylPlugins: any[] = [],
  module: Record<string, IModuleType> = {},
) => {
  const editor = SylEditorService.init(dom, {
    content,
    module,
    plugins: testPlugins.concat(sylPlugins),
    placeholder: '请输入',
    keepWhiteSpace: true,
    autoFocus: true,
    eventHandler: {
      handleClick: () => {
        // @ts-ignore
        window.__handleClick++;
        return false;
      },
      handleDOMEvents: {
        click: () => {
          // @ts-ignore
          window.__click++;
          return true;
        },
      },
    },
    keymap: {
      'Shift-b': () => {
        // @ts-ignore
        window.__keymap++;
        return false;
      },
    },
    scrollThreshold: 2,
    scrollMargin: 2,
  });

  if (selection) editor.setSelection(selection);

  return editor;
};

export { createEditor };
