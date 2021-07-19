import { testPlugins } from './plugins';
import { IModuleType, Types } from '../../packages/adapter/dist/es';
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
  });

  if (selection) editor.setSelection(selection);

  return editor;
};

export { createEditor };
