const PLACEHOLDER_KEY = 'placeholder';

interface ITypoMeta {
  align?: string;
  width?: number | string,
  height?: number | string,
  ratio?: number | string,
  adapt?: boolean,
}

interface IAbleMeta {
  close?: boolean,
  drag?: boolean,
  rotate?: boolean,
  resize?: boolean,
  matcher?: string,
  shortcut?: string,
  history: boolean,
}

const enum loadOrRenderType {
  INIT = 'init',
  VISIBLE = 'visible',
  CLICK = 'click'
}

const enum unmountType {
  NEVER = 'never',
  INVISIBLE = 'invisible'
}

interface ICycleMeta {
  load?: loadOrRenderType,
  render?: loadOrRenderType,
  unmount?: unmountType
}

interface IMeta {
  id: string,
  name: string,
  typo?: ITypoMeta,
  able?: IAbleMeta,
  cycle?: ICycleMeta,
}

interface IPlaceholderData {
  meta: IMeta,
  data: any,
}

interface IPlaceholderCompProps {
  width?: number;
  height?: number;
  selected?: boolean;
  text: string | JSX.Element;
  onClick?: () => void;
  isError?: boolean
}

// React.ComponentType<any>
//     | React.ForwardRefRenderFunction<any>
type TPromise = (params?: any) => Promise<{ default: any; }>;

interface IPluginData {
  // store exit on config
  key?: string,
  id?: string,
  name?: string;
  desc?: string;
  status?: number;
  url?: string;
  files?: string[];
  exec?: boolean;

  // inject when exec
  __isInit?: boolean,
  init?: () => any,
  __comp?: TPromise
}

interface IPlaceholderRef {
  getCopyData?: () => Promise<{ html?: string; text?: string; }>
  getActiveTools?: () => [{
    icon?: JSX.Element,
    content: string,
    onClick: () => void,
  }],
}

export {
  IAbleMeta,
  ICycleMeta,
  IMeta,
  IPlaceholderCompProps,
  IPlaceholderData,
  IPlaceholderRef,
  IPluginData,
  ITypoMeta,
  loadOrRenderType,
  PLACEHOLDER_KEY,
  TPromise,
  unmountType}
