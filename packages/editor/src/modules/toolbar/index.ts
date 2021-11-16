import './style.css';

import { IToolbar, SylApi, Types } from '@syllepsis/adapter';

import { IRenderer } from '../../renderer';

interface IToolbarOption {
  mount?: Element | null;
  tools: Array<ToolConfig>;
  tooltips?: Types.StringMap<Tooltip> | false;
  showNames?: Types.StringMap<string>;
  icons?: Types.StringMap<any>;
  className?: string;
  tipDirection?: 'up' | 'left' | 'down' | 'right' | string; // currently only effective for vertical buttons
  tipDistance?: number;
  onToolClick?: (editor: SylApi, name: string) => void;
  Component?: any;
  trigger?: TTrigger; // dropdown menu trigger method
  menuDirection?: 'up' | 'down' | 'up-start' | 'down-start' | string; // position of dropdown menu
  menuDistance?: number;
  RenderBridge: Types.Ctor<IRenderer<any>>;
}

interface IToolbarLibProps {
  editor: SylApi;
  option: IToolbarOption;
}

type Tooltip = string | boolean | ((icon: any) => any);
type TTrigger = 'click' | 'hover' | string;

type TSupportToolConfig = string | CustomTool | TCustomMoreTool;
interface TCustomMoreTool {
  name?: string;
  icon?: any;
  showName?: IToolbar['showName'];
  tooltip?: Tooltip;
  trigger?: TTrigger;
  content: Types.DeepArray<TSupportToolConfig>;
  contentOption?: Partial<IToolbarOption>;
}

interface CustomTool {
  name?: string;
  tooltip?: Tooltip;
  render: (node: SylApi) => any;
}

type ToolConfig = TSupportToolConfig | Types.DeepArray<TSupportToolConfig>;

interface TContent {
  type: string;
  name?: string;
  showName?: IToolbar['showName'];
  tooltip?: Tooltip;
  toolbar?: IToolbar;
}

interface TCustomContent {
  name: string;
  type: string;
  tooltip?: Tooltip;
  render: (editor: SylApi) => any;
}

interface TMoreContent {
  name?: string;
  type: string;
  trigger?: TTrigger;
  icon?: any;
  tooltip?: Tooltip;
  content: Array<TContent | TCustomContent | TMoreContent>;
  contentOption?: Partial<IToolbarOption>;
  [key: string]: any;
}

type ToolContent = TContent | TCustomContent | TMoreContent;

interface TPluginConfig {
  name: string;
  toolbar: IToolbar;
  disable?: (editor: SylApi) => boolean;
  active?: (editor: SylApi) => boolean;
}

interface IToolbarUtil {
  name: string;
  icon?: any;
  tooltip?: string;
  handler: (editor: SylApi, name: string, attrs: Types.StringMap<any>) => void;
  disable?: (editor: SylApi) => boolean;
  active?: (editor: SylApi) => boolean;
}

const DIVIDER = '|';
const TOOL_TYPE = {
  BUTTON: 'button',
  DIVIDER: 'divider',
  DROPDOWN: 'dropdown',
  SELECT: 'select',
  COLOR: 'color',
  CUSTOM: 'custom',
  MORE: 'more',
};

class ToolbarLib {
  public contents: ToolContent[] = [];
  public editor: SylApi;
  public option: IToolbarOption;

  constructor(props: IToolbarLibProps) {
    const { editor, option } = props;
    this.editor = editor;
    this.option = option;

    this.getTools();
  }

  public unmount() {}

  public getTools() {
    if (this.option.tools) {
      this.contents = this.option.tools
        .map((toolName: ToolConfig) => this.formatTools(toolName))
        .filter((t: any) => t) as TContent[];
    }
  }

  public formatTools(toolName: ToolConfig): ToolContent | undefined {
    if (Array.isArray(toolName)) {
      return this.buildMoreTools({ content: toolName });
    } else if (typeof toolName === 'object') {
      if ('render' in toolName) {
        const { tooltip, render, name } = toolName;
        return { name, tooltip, type: TOOL_TYPE.CUSTOM, render };
      } else if ('content' in toolName) {
        return this.buildMoreTools(toolName);
      }
    } else if (typeof toolName === 'string') {
      if (toolName === DIVIDER) {
        return { type: TOOL_TYPE.DIVIDER };
      } else {
        const pluginConfig = this.getSylPluginConfigByName(toolName);
        if (pluginConfig && pluginConfig.toolbar) {
          return this.buildButtonTool(toolName, pluginConfig as TPluginConfig);
        }
      }
    }
  }

  public getSylPluginConfigByName(name: string) {
    return this.editor.configurator
      .getSylPlugins()
      .map(p => {
        if (!p.$controller) return;
        return {
          name: p.name || p.$controller.name,
          toolbar: p.$controller.toolbar,
          disable: p.$controller.disable,
          active: p.$controller.active,
        };
      })
      .find(p => p && p.name === name);
  }

  public buildMoreTools(config: TCustomMoreTool): TMoreContent {
    const { name = '', tooltip = '', content, icon = '', trigger = 'hover', ...rest } = config;
    return {
      ...rest,
      name,
      icon,
      tooltip,
      trigger,
      type: TOOL_TYPE.MORE,
      content: content.map(n => this.formatTools(n)).filter((t: any) => t) as TContent[],
    };
  }

  public buildButtonTool(toolName: string, pluginConfig: TPluginConfig): TContent {
    const { toolbar, name, disable, active } = pluginConfig;
    const { tooltips = {}, icons = {}, showNames = {} } = this.option;
    const showName = showNames[toolName];
    return {
      type: toolbar.type || TOOL_TYPE.BUTTON,
      name,
      tooltip: tooltips ? tooltips[toolName] : false,
      showName,
      toolbar: {
        ...toolbar,
        disable,
        active,
        icon: icons[toolName] || toolbar.icon,
      },
    };
  }
}

export {
  IToolbarLibProps,
  IToolbarOption,
  IToolbarUtil,
  TContent,
  TCustomContent,
  TMoreContent,
  TOOL_TYPE,
  ToolbarLib,
  ToolConfig,
  ToolContent,
  Tooltip,
  TTrigger,
};

export * from './loader';
