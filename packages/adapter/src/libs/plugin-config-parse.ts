import { Plugin } from 'prosemirror-state';

import { SylApi } from '../api';
import { SylPlugin, SylUnionPlugin } from '../schema';
import { IConfigPluginObj, ISylPluginConfig, ISylPluginProps, Types } from './types';

// parse the configuration of Plugins
const parseSylPluginConfig = (sylPluginConfigs: ISylPluginConfig[], adapter: SylApi) => {
  const initedSylPlugins: SylPlugin<any>[] = [];
  const keyMaps: Types.StringMap<any>[] = [];
  const nativePlugins: { top: Plugin[]; bottom: Plugin[] } = { top: [], bottom: [] };

  // the custom `Plugin.spec.prioritize` indicates whether to register first
  const addNativePlugin = (plugin: Plugin) => {
    plugin.spec.prioritize ? nativePlugins.top.push(plugin) : nativePlugins.bottom.push(plugin);
  };

  const registerPlugin = (sylPlugin: SylPlugin, props: ISylPluginProps) => {
    sylPlugin.init(adapter, props);
    initedSylPlugins.push(sylPlugin);

    let keyMap = {};
    if (sylPlugin.$controller && sylPlugin.$controller.keymap) {
      keyMap = sylPlugin.$controller.keymap;
    }

    keyMap && keyMaps.push(keyMap);
  };

  const registerUnionPlugin = (unionPlugin: SylUnionPlugin, props: ISylPluginProps) => {
    const { nativePlugins: pmPlugins = [], sylPlugins = [] } = unionPlugin.install(adapter, props.controllerProps);
    pmPlugins.forEach(n => addNativePlugin(n));
    sylPlugins.forEach(s => parseConfig(s));
  };

  // Parse the `ISylPluginConfig`, which can be an object，`SylPlugin`, `SylUnionPlugin`, `prosemirror plugin` or their instance
  const parseConfig = (config: ISylPluginConfig) => {
    let pluginConfig = config;
    const props: ISylPluginProps = {
      controllerProps: {},
    };

    // SylPlugin config object, property `plugin` maybe SylPlugin, SylUnionPlugin
    if ((pluginConfig as IConfigPluginObj).plugin) {
      pluginConfig = (pluginConfig as IConfigPluginObj).plugin;
      props.controllerProps = (config as IConfigPluginObj).controllerProps || {};
      props.layers = (config as IConfigPluginObj).layers || undefined;
    }
    if (pluginConfig instanceof Plugin) {
      // prosemirror plugin
      addNativePlugin(pluginConfig);
    } else if (pluginConfig instanceof SylPlugin) {
      // SylPlugin instance
      registerPlugin(pluginConfig, props);
    } else if (pluginConfig instanceof SylUnionPlugin) {
      // SylUnionPlugin instance
      registerUnionPlugin(pluginConfig, props);
    } else if ((pluginConfig as typeof SylPlugin).prototype instanceof SylPlugin) {
      // SylPlugin
      registerPlugin(new (pluginConfig as typeof SylPlugin)(), props);
    } else if ((pluginConfig as typeof SylUnionPlugin).prototype instanceof SylUnionPlugin) {
      // SylUnionPlugin
      registerUnionPlugin(new (pluginConfig as typeof SylUnionPlugin)(), props);
    }
  };

  sylPluginConfigs.forEach(parseConfig);

  return {
    initedSylPlugins,
    keyMaps,
    nativePlugins,
  };
};

export { parseSylPluginConfig };
