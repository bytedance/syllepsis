import {
  IConfiguration,
  IModuleType,
  ISylApiAdapterOptions,
  ISylPluginConfig,
  SylApi,
  SylConfigurator,
} from '@syllepsis/adapter';

import { IToolbarInlineOption, IToolbarOption } from './modules';

interface ISylEditorProps extends Partial<IConfiguration>, ISylApiAdapterOptions {
  plugins?: ISylPluginConfig[];
  module?: {
    toolbar?: IModuleType<Omit<IToolbarOption, 'RenderBridge'>>;
    toolbarInline?: IModuleType<Omit<IToolbarInlineOption, 'RenderBridge'>>;
  } & ISylApiAdapterOptions['module'];
  disable?: boolean;
  getEditor?: (editor: SylApi) => void;
}

const updateConfig = (editor: SylApi, newConfig: Partial<ISylEditorProps>) => {
  editor.configurator.update({ ...newConfig, module: newConfig.module });
};

const init = (mount: HTMLElement, props: ISylEditorProps) => {
  const { plugins, module, content, spellCheck, placeholder, locale, onError, ...basicControls } = props;

  const configurator = new SylConfigurator(mount, plugins, {
    placeholder,
    spellCheck,
    locale,
    onError,
    ...basicControls,
  });
  const editor = new SylApi(configurator, {
    module,
    content,
  });

  if (props.getEditor) props.getEditor(editor);

  return editor;
};

const SylEditorService = {
  updateConfig,
  init,
};

export { ISylEditorProps, SylEditorService };
