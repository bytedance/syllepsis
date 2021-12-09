import EventEmitter from 'eventemitter3';
import { history } from 'prosemirror-history';
import { DOMParser, Node as ProsemirrorNode, Schema } from 'prosemirror-model';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';

import { ISylApiAdapterOptions, SylApi } from './api';
import { BasicCtrlPlugin, BSControlKey, IBasicCtrlConfig } from './basic/basic-ctrl';
import { CtrlPlugin } from './basic/ctrl-plugin';
import { createCustomCtrlPlugin, CUSTOM_CTRL_ACCEPT, ICustomCtrlConfig } from './basic/custom-ctrl';
import { DecorationPlugin } from './basic/decoration';
import { basicKeymapPlugin, createCustomKeymapPlugins, defaultKeymapPlugin, TSylKeymap } from './basic/keymap';
import { createLifeCyclePlugin } from './basic/lifecycle/lifecycle-plugin';
import { ruleBuilder } from './basic/text-shortcut/rule-builder';
import { SHORTCUT_KEY } from './basic/text-shortcut/shortcut-plugin';
import { EventChannel } from './event';
import { handleDOMSpec, removeBrInEnd } from './formatter';
import { parseSylPluginConfig } from './libs/plugin-config-parse';
import { ISylPluginConfig, Types } from './libs/types';
import { LocaleStore } from './locale';
import { IModuleType, ModuleManager } from './module';
import {
  BaseCard,
  BaseCardView,
  basicSchema,
  IEventHandler,
  SchemaMeta,
  SylController,
  SylPlugin,
  TKeymapHandler,
} from './schema';
import { createSchema, updateSchema } from './schema/normalize';

// extra configuration support, never related to editing
interface IExtraConfig {
  spellCheck?: boolean;
  autoFocus?: boolean;
  onError?: (error: Error, args?: any) => any;
  onBlur?: () => void;
  onFocus?: () => void;
}

interface IBaseConfig {
  emitter?: EventChannel;
  locale?: Types.StringMap<any>;
  disable?: boolean;
  disableShortcut?: boolean;
}

interface IKeymapConfig {
  keymap?: Types.StringMap<TKeymapHandler>;
}

interface IConfiguration extends IBaseConfig, IBasicCtrlConfig, ICustomCtrlConfig, IExtraConfig, IKeymapConfig {}
type TSylEventType = EventChannel['LocalEvent'] | string | symbol;

const EDITOR_CHECK = ['autocomplete', 'autoCorrect', 'autoCapitalize'];

const dispatchTransactionFactory = ({
  view,
  emitter,
  onError,
}: {
  view: EditorView;
  emitter: EventEmitter;
  onError: IExtraConfig['onError'];
}): EditorView['dispatch'] => (tr: Transaction) => {
  try {
    if (!view || !view.docView || !emitter) return;
    const newState = view.state.apply(tr);
    view.updateState(newState);
    emitter.emit(EventChannel.LocalEvent.ON_CHANGE);
  } catch (err) {
    onError && onError(err);
  }
};

// Format the property of `$NodeView` in `SylPlugin` as nodeViews` in `prosemirror-plugin-props, and inject `SylApi`
const getNodeViewStringMap = (sylPlugins: SylPlugin<any>[], adapter: SylApi) =>
  sylPlugins.reduce((nodeViewMap, sylPlugin) => {
    const NodeViewCtor = sylPlugin.$NodeView;
    const $schema = sylPlugin.$schema as BaseCard;

    if (!NodeViewCtor || !$schema) return nodeViewMap;

    const name = sylPlugin.name || sylPlugin.$controller!.name;
    if (nodeViewMap[name]) console.warn('multiple register', name);

    nodeViewMap[name] = (node, editorView, getPos) => {
      const nodeView = new NodeViewCtor(adapter, node, editorView, getPos);
      if (nodeView instanceof BaseCardView) {
        nodeView.mount({ ViewMap: $schema.ViewMap, layers: $schema.layers });
        nodeView.afterMount(name);
      }
      return nodeView;
    };
    return nodeViewMap;
  }, {} as Types.StringMap<(node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)) => NodeView>);

const setConfiguration = (
  baseConfig: Types.StringMap<any>,
  configProps: Types.StringMap<any>,
  cb?: (key: string, val: any, oldVal: any) => void,
) => {
  Object.keys(baseConfig).forEach(key => {
    if (configProps[key] !== undefined && baseConfig[key] !== configProps[key]) {
      const preValue = baseConfig[key];
      baseConfig[key] = configProps[key];
      cb && cb(key, configProps[key], preValue);
    }
  });
};

class SylConfigurator {
  public mount: HTMLElement;
  public view: EditorView;
  public moduleManage?: ModuleManager;
  private adapter?: SylApi;
  private localStore?: LocaleStore;
  public domParser?: DOMParser;

  // configs of SylPlugin
  private sylPluginConfigs: Array<ISylPluginConfig> = [];
  // instances of SylPlugin
  private sylPluginInstances: Array<SylPlugin> = [];

  // relate to custom ctrl
  private customCtrlPlugin?: CtrlPlugin<ICustomCtrlConfig | ICustomCtrlConfig[]>;

  // relate to keymap
  private customKeyMapPlugin?: CtrlPlugin<TSylKeymap | TSylKeymap[]>;

  // configuration that pass to BasicCtrlPlugin
  public basicConfiguration: Required<IBasicCtrlConfig> = {
    keepLastLine: true,
    dropCursor: {},
    placeholder: '',
    keepWhiteSpace: false,
  };

  public extraConfiguration: Required<IExtraConfig> = {
    onError: err => {
      throw err;
    },
    autoFocus: false,
    spellCheck: false,
    onBlur: () => {},
    onFocus: () => {},
  };

  public baseConfiguration: Required<IBaseConfig> = {
    emitter: new EventChannel(),
    locale: {},
    disable: false,
    disableShortcut: false,
  };

  public customConfiguration: ICustomCtrlConfig = {
    eventHandler: {},
    scrollThreshold: 5,
    scrollMargin: 0,
  };

  public keymapConfiguration: TSylKeymap = {};

  // prosemirror-plugin
  public plugins: Array<Plugin> = [history()];
  // prosemirror-schema
  public schema: Schema = createSchema(basicSchema);

  get onError() {
    return this.extraConfiguration.onError;
  }

  get emitter() {
    return this.baseConfiguration.emitter;
  }

  constructor(mount: HTMLElement, sylPluginConfigs: Array<ISylPluginConfig> = [], config: IConfiguration = {}) {
    this.mount = mount;
    this.sylPluginConfigs = sylPluginConfigs;
    this.update(config);
    this.view = new EditorView(this.mount, {
      state: EditorState.create({
        schema: this.schema,
      }),
    });
  }

  public init(adapter: SylApi, module: Types.StringMap<IModuleType> = {}) {
    this.adapter = adapter;
    this.customCtrlPlugin = createCustomCtrlPlugin(adapter, [this.customConfiguration]);
    this.customKeyMapPlugin = createCustomKeymapPlugins(adapter, [this.keymapConfiguration]);
    this.installSylPlugins(adapter);
    this.installModule(adapter, module);
    this.constructParser();
  }

  private constructParser() {
    const domParse = DOMParser.fromSchema(this.view.state.schema);
    const originParseSlice = domParse.parseSlice.bind(domParse);
    domParse.parseSlice = (dom: HTMLElement, _option) => {
      const { keepWhiteSpace } = this.basicConfiguration;
      let option = _option;
      if (!option) option = {};

      if (keepWhiteSpace !== undefined) {
        option.preserveWhitespace = keepWhiteSpace;
      }

      handleDOMSpec(dom);
      const slice = originParseSlice(dom, option);
      removeBrInEnd(slice);
      return slice;
    };

    this.domParser = domParse;
  }

  private installModule = (adapter: SylApi, module: Types.StringMap<IModuleType>) => {
    this.moduleManage = new ModuleManager(adapter, module);
    this.moduleManage.install();
  };

  private installSylPlugins = (adapter: SylApi) => {
    const { sylPlugins, nativePlugins } = parseSylPluginConfig(this.sylPluginConfigs, adapter);
    this.initNativePlugin(adapter, sylPlugins, nativePlugins);
    this.schema = createSchema(
      updateSchema(this.schema.spec, sylPlugins.map(p => p && p.$schemaMeta).filter(p => p) as SchemaMeta[]),
    );

    const newProseState = EditorState.create({
      schema: this.schema,
      plugins: this.plugins,
    });

    this.view.setProps({
      state: newProseState,
      nodeViews: getNodeViewStringMap(sylPlugins, adapter),
      dispatchTransaction: dispatchTransactionFactory({
        view: this.view,
        emitter: this.baseConfiguration.emitter,
        onError: this.extraConfiguration.onError,
      }),
    });

    this.sylPluginInstances = sylPlugins;
    this.extraConfiguration.autoFocus && this.view.focus();
  };

  private initNativePlugin(
    adapter: SylApi,
    sylPlugins: SylPlugin[],
    nativePlugins: { top: Plugin[]; bottom: Plugin[] },
  ) {
    const textShortCutPlugin = ruleBuilder(
      sylPlugins.map(p => p && p.$schemaMeta!).filter(p => p),
      !this.baseConfiguration.disableShortcut,
    );

    this.installController(
      adapter,
      sylPlugins.map(s => s.$controller!).filter(s => s),
    );

    this.plugins.push(
      ...nativePlugins.top,
      textShortCutPlugin,
      this.customCtrlPlugin!,
      // decrease the priority of the `keymap`, because `handleKeyDown` can handle more things
      this.customKeyMapPlugin!,
      basicKeymapPlugin,
      defaultKeymapPlugin,
      DecorationPlugin(),
      BasicCtrlPlugin(this.basicConfiguration, !this.baseConfiguration.disable),
      ...nativePlugins.bottom,
      createLifeCyclePlugin(adapter),
    );
  }

  private installController = (adapter: SylApi, sylControllers: SylController[]) => {
    this.collectCommands(adapter, sylControllers);
    this.customCtrlPlugin!.registerProps(sylControllers);
    this.customKeyMapPlugin!.registerProps(sylControllers.filter(c => c.keymap).map(c => c.keymap!));
  };

  private collectCommands = (adapter: SylApi, sylControllers: SylController[]) => {
    sylControllers.forEach((sylController: SylController) => {
      sylController?.command && adapter.addCommand(sylController.name, sylController.command);
    });
  };

  public registerController = (
    name: string,
    Controller: typeof SylController,
    controllerProps?: Types.StringMap<any>,
  ) => {
    let plugin: SylPlugin | null = null;
    this.sylPluginInstances.some(instance => {
      if (instance.name === name) {
        plugin = instance;
        plugin.registerController(Controller, controllerProps);
        return true;
      }
    });
    if (!plugin) {
      plugin = new SylPlugin();
      plugin.name = name;
      plugin.Controller = Controller;
      plugin.init(this.adapter!, { controllerProps });
      this.sylPluginInstances.push(plugin);
    }

    this.installController(this.adapter!, [plugin.$controller!]);
    this.emit(EventChannel.LocalEvent.CONFIG_PLUGIN_CHANGE);
  };

  public unregisterController = (name: string) => {
    const isChange = this.sylPluginInstances.some(plugin => {
      if (plugin.name === name && plugin.$controller) {
        this.customCtrlPlugin?.unregisterProps(plugin.$controller);
        plugin.$controller.keymap && this.customKeyMapPlugin?.unregisterProps(plugin.$controller.keymap);
        if (plugin.$controller.command) delete this.adapter?.command[name];
        plugin.unregisterController();
        return true;
      }
    });
    isChange && this.emit(EventChannel.LocalEvent.CONFIG_PLUGIN_CHANGE);
  };

  private setExtraConfiguration = (config: IConfiguration) =>
    setConfiguration(this.extraConfiguration, config, (key, val, oldVal) => {
      if (key === 'spellCheck') {
        EDITOR_CHECK.forEach(attr => this.view.dom.setAttribute(attr, val ? 'on' : 'off'));
        this.view.dom.setAttribute('spellcheck', val ? 'true' : 'false');
      } else if (key === 'onBlur') {
        this.emitter.off(EventChannel.LocalEvent.ON_BLUR, oldVal);
        this.emitter.on(EventChannel.LocalEvent.ON_BLUR, val);
      } else if (key === 'onFocus') {
        this.emitter.off(EventChannel.LocalEvent.ON_FOCUS, oldVal);
        this.emitter.on(EventChannel.LocalEvent.ON_FOCUS, val);
      }
    });

  private setBaseConfiguration = (config: IConfiguration) =>
    setConfiguration(this.baseConfiguration, config, (key, val) => {
      if (key === 'locale') {
        this.localStore = new LocaleStore(val);
      } else if (key === 'disable' && this.view) {
        this.setEditable(val);
      }
    });

  private setBasicCtrlConfiguration = (config: IConfiguration) =>
    setConfiguration(this.basicConfiguration, config, key => {
      if (key === 'placeholder' && this.view) {
        this.view.updateState(this.view.state);
      }
    });

  public update(config: IConfiguration & ISylApiAdapterOptions) {
    this.setBaseConfiguration(config);
    this.setExtraConfiguration(config);
    this.setBasicCtrlConfiguration(config);
    this.setCustomConfiguration(config);
    this.setKeymapConfiguration(config.keymap);
    config.module && this.moduleManage?.update(config.module);
  }

  private setCustomConfiguration = (props: ICustomCtrlConfig) => {
    if (props.hasOwnProperty('eventHandler') || props.eventHandler !== this.customConfiguration.eventHandler) {
      this.customConfiguration.eventHandler && this.unregisterEventHandler(this.customConfiguration.eventHandler);
    }
    Object.keys(props).forEach(key => {
      // @ts-ignore
      if (CUSTOM_CTRL_ACCEPT[key]) this.customConfiguration[key] = props[key];
    });
    this.customCtrlPlugin?.registerProps(this.customConfiguration);
  };

  public registerEventHandler = (eventHandler: IEventHandler) => {
    this.customCtrlPlugin?.registerProps({ eventHandler });
  };

  public unregisterEventHandler = (eventHandler: IEventHandler) => {
    this.customCtrlPlugin?.unregisterProps({ eventHandler });
  };

  private setKeymapConfiguration = (keymap?: TSylKeymap) => {
    if (this.keymapConfiguration !== keymap || !keymap) this.unregisterKeymap(this.keymapConfiguration);
    this.keymapConfiguration = keymap || {};
    this.registerKeymap(this.keymapConfiguration);
  };

  public registerKeymap = (keymap: TSylKeymap) => {
    this.customKeyMapPlugin && this.customKeyMapPlugin.registerProps(keymap);
  };

  public unregisterKeymap = (keymap: Types.StringMap<TKeymapHandler>) => {
    this.customKeyMapPlugin && this.customKeyMapPlugin.unregisterProps(keymap);
  };

  public on(event: TSylEventType, handler: (...args: any[]) => void) {
    return this.baseConfiguration.emitter.on(event, handler);
  }

  public off(event: TSylEventType, handler: (...args: Array<any>) => void) {
    return this.baseConfiguration.emitter.off(event, handler);
  }

  public emit(event: TSylEventType, ...args: any[]): boolean {
    return this.baseConfiguration.emitter.emit(event, ...args);
  }

  public getLocaleValue(name: string) {
    if (!this.localStore) return '';
    return this.localStore._get(name);
  }

  public setEditable(editable: boolean) {
    const { state, dispatch } = this.view;
    dispatch(state.tr.setMeta(BSControlKey, { editable }));
  }

  public setShortcutAble(enable: boolean) {
    const { state, dispatch } = this.view;
    dispatch(state.tr.setMeta(SHORTCUT_KEY, enable));
  }

  public setLocale(locale?: Types.StringMap<any>) {
    if (!locale) return;
    if (!this.localStore) this.localStore = new LocaleStore(this.baseConfiguration.locale);
    this.localStore._set(locale);
    return this.emit(EventChannel.LocalEvent.LOCALE_CHANGE);
  }

  public getSylPlugins(): SylPlugin<any>[] {
    return this.sylPluginInstances;
  }

  public uninstall() {
    this.emit(EventChannel.LocalEvent.EDITOR_WILL_UNMOUNT);
    this.view.destroy();
    this.moduleManage && this.moduleManage.uninstall();
  }
}

export { IConfiguration, SylConfigurator, TSylEventType };
