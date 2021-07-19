import EventEmitter from 'eventemitter3';
import { history } from 'prosemirror-history';
import { DOMParser, Node as ProsemirrorNode, Schema } from 'prosemirror-model';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';

import { ISylApiAdapterOptions, SylApi } from './api';
import { BasicCtrlPlugin, BSControlKey, IBasicCtrlConfig } from './basic/basic-ctrl';
import { CreateCustomCtrlPlugin, ICustomCtrlConfig } from './basic/custom-ctrl';
import { DecorationPlugin } from './basic/decoration';
import { getKeymapPlugins } from './basic/keymap/keymap';
import { createLifeCyclePlugin } from './basic/lifecycle/lifecycle-plugin';
import { ruleBuilder } from './basic/text-shortcut/rule-builder';
import { SHORTCUT_KEY } from './basic/text-shortcut/shortcut-plugin';
import { EventChannel } from './event';
import { handleDOMSpec, removeBrInEnd } from './formatter';
import { parseSylPluginConfig } from './libs/plugin-config-parse';
import { ISylPluginConfig, Types } from './libs/types';
import { LocaleStore } from './locale';
import { IModuleType, ModuleManager } from './module';
import { BaseCard, BaseCardView, basicSchema, SchemaMeta, SylPlugin } from './schema';
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

interface IConfiguration extends IBaseConfig, IBasicCtrlConfig, IExtraConfig {}

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

const collectCommands = (adapter: SylApi, initedSylPlugins: SylPlugin<any>[]) => {
  initedSylPlugins.forEach((sylPlugin: unknown) => {
    if (!(sylPlugin as SylPlugin<any>).$controller) return;
    const plugin = sylPlugin as SylPlugin<any>;
    const pluginCommand = plugin.$controller && plugin.$controller.command;
    if (pluginCommand) {
      adapter.addCommand(plugin.name, pluginCommand);
    }
  });
};

const setConfiguration = (
  baseConfig: Types.StringMap<any>,
  configProps: Types.StringMap<any>,
  cb?: (key: string, val: any, oldVal: any) => void,
) => {
  Object.keys(baseConfig).forEach(key => {
    if (configProps[key] !== undefined && baseConfig[key] !== configProps[key]) {
      cb && cb(key, configProps[key], baseConfig[key]);
      baseConfig[key] = configProps[key];
    }
  });
};

class SylConfigurator {
  public mount: HTMLElement;
  public view: EditorView;
  public moduleManage?: ModuleManager;
  private localStore?: LocaleStore;
  public domParser?: DOMParser;

  // configs of SylPlugin
  private sylPluginConfigs: Array<ISylPluginConfig> = [];
  // instances of SylPlugin
  private sylPluginInstances: Array<SylPlugin> = [];
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
    const { initedSylPlugins, keyMaps, nativePlugins } = parseSylPluginConfig(this.sylPluginConfigs, adapter);
    collectCommands(adapter, initedSylPlugins);

    this.sylPluginInstances = initedSylPlugins;
    this.initNativePlugin(adapter, keyMaps, nativePlugins);

    this.schema = createSchema(
      updateSchema(
        this.schema.spec,
        this.sylPluginInstances.map(p => p && p.$schemaMeta).filter(p => p) as SchemaMeta[],
      ),
    );

    const newProseState = EditorState.create({
      schema: this.schema,
      plugins: this.plugins,
    });

    this.view.setProps({
      state: newProseState,
      nodeViews: getNodeViewStringMap(this.sylPluginInstances, adapter),
      dispatchTransaction: dispatchTransactionFactory({
        view: this.view,
        emitter: this.baseConfiguration.emitter,
        onError: this.extraConfiguration.onError,
      }),
    });

    this.extraConfiguration.autoFocus && this.view.focus();
  };

  private initNativePlugin(
    adapter: SylApi,
    keyMaps: Types.StringMap<any>[],
    nativePlugins: { top: Plugin[]; bottom: Plugin[] },
  ) {
    const $schemaMetas = this.sylPluginInstances.map(p => p && p.$schemaMeta!).filter(p => p);
    const $controllerMetas = this.sylPluginInstances.map(p => p && p.$controller!).filter(p => p);
    const textShortCutPlugin = ruleBuilder($schemaMetas, $controllerMetas, !this.baseConfiguration.disableShortcut);

    const CustomCtrlPlugin = CreateCustomCtrlPlugin(
      this.sylPluginInstances.reduce((result, plugin) => {
        if (plugin) {
          const config: ICustomCtrlConfig = {};
          if (plugin.$controller) {
            if (plugin.$controller.eventHandler) config.eventHandler = plugin.$controller.eventHandler;
            if (plugin.$controller.appendTransaction) config.appendTransaction = plugin.$controller.appendTransaction;
            Object.keys(config).length && result.push(config);
          }
        }
        return result;
      }, [] as Array<ICustomCtrlConfig>),
      adapter,
    );

    this.plugins.push(
      ...nativePlugins.top,
      textShortCutPlugin,
      CustomCtrlPlugin,
      // decrease the priority of the `keymap`, because `handleKeyDown` can handle more things
      ...getKeymapPlugins(keyMaps),
      DecorationPlugin(),
      BasicCtrlPlugin(this.basicConfiguration, !this.baseConfiguration.disable),
      ...nativePlugins.bottom,
      createLifeCyclePlugin(adapter),
    );
  }

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
    this.moduleManage && config.module && this.moduleManage.update(config.module);
  }

  public on(event: EventChannel['LocalEvent'], handler: (...args: any[]) => void) {
    return this.baseConfiguration.emitter.on(event, handler);
  }

  public off(event: EventChannel['LocalEvent'], handler: (...args: Array<any>) => void) {
    return this.baseConfiguration.emitter.off(event, handler);
  }

  public emit(event: string | symbol, ...args: any[]): boolean {
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

export { IConfiguration, SylConfigurator };
