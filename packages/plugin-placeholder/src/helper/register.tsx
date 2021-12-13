import { SylApi } from '@syllepsis/adapter';
import axios from 'axios';
import React, { lazy, Suspense, useCallback, useMemo, useState } from 'react';

import { ready } from '../mvc/api';
import { IPluginData, TPromise } from '../mvc/types';
import { isOk } from './http';
import { deepCopy } from './index';

const cacheComponent: {
  [key: string]: any
} = {};

const lazyLoaderMap: {
  [key: string]: any
} = {};

type TRetry = () => void;
type TLoaderComponent = () => JSX.Element;
type TRetryComponent = (props: { retry: TRetry }) => JSX.Element;

interface IConfigData {
  meta?: any,
  data?: any,
  initTools?: any,
  initComp?: any
}

const defaultMeta = {
  name: '',
  typo: {
    width: '',
    height: '',
    ratio: '0.2',
    align: 'left',
  },
  able: {
    drag: false,
    fullscreen: false,
    resize: false,
    close: true,
    matcher: '',
    history: false,
  },
  cycle: {
    load: 'init',
    render: 'init',
    unmount: 'never',
  }
};

// refer: https://github.com/C-Rodg/React-Lazy-Retry/blob/master/src/index.js
const LazyComponent = (promise: TPromise, LoaderComp: TLoaderComponent, RetryComp: TRetryComponent) => {
  const RetryWrapper = React.forwardRef((props: any, ref: any) => {
    const [loading, setLoading] = useState(true);
    const retry = useCallback(() => setLoading(true), []);

    const RenderComponent = useMemo(
      () =>
        lazy(() => promise(loading).catch(() => {
            setLoading(false);
            return { default: () => <RetryComp retry={retry}/> };
          })
        )
      , [loading, retry]);

    return (
      <Suspense fallback={<LoaderComp/>}>
        <RenderComponent ref={ref} {...props} />
      </Suspense>
    );
  });
  return RetryWrapper;
};

function getLazyComponentLoader(name: string) {
  return lazyLoaderMap[name];
}

interface IPluginKeyValue {
  [key: string]: IPluginData
}

function dispatch(event: string, data?: any) {
  window.dispatchEvent(new CustomEvent(event, {
    detail: data
  }));
}

const PLUGIN_EVENT = {
  READY: 'plugin-cycle-ready'
};

const PLUGIN_STATUS = { ONLINE: 1, OFFLINE: -1 }
const VERSION = { ON: 1, OFF: -1 }

let pluginsConfig: IPluginKeyValue = {};
let isInitConfig = false;

// 获取配置
function getPluginsConfig(name: string) {
  return pluginsConfig[name];
}

const cacheKey = '__syllepsis__dynamic__plugins__'

async function inject(url: string | IPluginKeyValue, editor: SylApi, _config = {}) {
  const config = Object.assign({
    isEnd: true,
    cache: false,
  }, _config);
  const { isEnd, cache } = config;
  if (typeof url === 'string') {
    if (cache) {
      try {
        let useCache = false;
        const cacheValue = window.localStorage.getItem(cacheKey);
        if (cacheValue) {
          const cacheConfig = JSON.parse(cacheValue);
          if (typeof cacheConfig === 'object') {
            assignPluginConfig(pluginsConfig, cacheConfig);
            useCache = true;
          }
        }
        if (useCache) {
          injectUrl(url, editor).then((config) => {
            // 需要检验是否是合法的插件配置
            if (typeof config === 'object') {
              window.localStorage.setItem(cacheKey, JSON.stringify(config));
            }
          })
        } else {
          pluginsConfig = Object.assign(pluginsConfig, await injectUrl(url, editor));
          if (typeof pluginsConfig === 'object') {
            window.localStorage.setItem(cacheKey, JSON.stringify(pluginsConfig));
          }
        }
      } catch (e) {
        console.error('fetch config error', e);
      }
    } else {
      const serverConfig = await injectUrl(url, editor);
      pluginsConfig = Object.assign(serverConfig, pluginsConfig);
    }
  } else if (typeof url === 'object') {
    pluginsConfig = Object.assign(pluginsConfig, url);
  } else {
    console.error('invalid params: url', url);
  }

  isInitConfig = true;

  if (isEnd) {
    // console.log('valid', pluginsConfig);
    execIfNeed(editor, pluginsConfig);
    dispatch(PLUGIN_EVENT.READY);
  }
}

async function injectUrl(url: string, editor: SylApi) {
  const data = { params: { status: PLUGIN_STATUS.ONLINE, versionOn: VERSION.ON } }
  const res = await axios.get(url, data);
  if (isOk(res)) {
    const pluginsData: IPluginKeyValue = {};
    const data = res.data.data as IPluginData[];
    return appendPluginConfig(pluginsData, data);
  }
  return {};
}

function appendPluginConfig(preData: { [key: string]: IPluginData }, appendData: IPluginData[]) {
  appendData.forEach((eachPluginData: IPluginData) => {
    const { name } = eachPluginData;
    if (name) {
      const tempPluginData = deepCopy(eachPluginData);
      tempPluginData.init = getInitFunction(eachPluginData);
      if (!preData[name]) {
        preData[name] = tempPluginData;
      }
    }
  });
  return preData;
}

function assignPluginConfig(preData: { [key: string]: IPluginData }, appendData: { [key: string]: IPluginData }) {
  const keys = Object.keys(appendData);
  keys.forEach((eachKey: string) => {
    const eachPluginData = appendData[eachKey];
    const { name } = eachPluginData;
    if (name) {
      const tempPluginData = deepCopy(eachPluginData);
      tempPluginData.init = getInitFunction(eachPluginData);
      if (!preData[name]) {
        preData[name] = tempPluginData;
      }
    }
  });
}

function getInitFunction(eachPluginData: IPluginData) {
  const { name, url, init } = eachPluginData;
  if (init) {
    console.warn('do not repeat init');
    return;
  }
  if (!url) {
    console.error('config should has url params');
    return;
  }
  if (!name) {
    console.error('plugin should have name plugins');
    return;
  }
  return () => new Promise((resolve, reject) => {
    axios.get(url).then(res => {
      eval(res.data);
      resolve('');
    })
  });
}

let isExec = false;
const registerCb: any[] = [];

function execIfNeed(editor: any, pluginsConfig: IPluginKeyValue) {
  const keys = Object.keys(pluginsConfig);
  keys.forEach((eachKey) => {
    execPlugin(eachKey, editor);
  });
  isExec = true;
  registerCb.forEach((eachRegister) => {
    eachRegister();
  });
}

function execPlugin(name: string, editor: SylApi) {
  return new Promise(async (resolve, reject) => {
    if (isInitConfig) {
      const currPluginData = getPluginsConfig(name);
      if (!currPluginData) {
        reject(`not support plugin ${name}`);
        return false;
      }
      const { init } = currPluginData;
      if (!init) {
        reject('config should have init function ');
        return false;
      }

      init().then(async (config: IConfigData) => {
        const { initTools, meta, data } = config;

        if (initTools && !currPluginData.__isInit) {
          currPluginData.__isInit = true;
          await initTools(editor, meta, data, name);
          ready('initTools.' + name);
        }
        resolve(config.initComp ? config.initComp() : '');
      }).catch((error: any) => {
        console.log('plugin init error', name, error);
        currPluginData.__isInit = false;
      });
    } else {
      window.addEventListener(PLUGIN_EVENT.READY, () => {
        execPlugin(name, editor).then(comp => resolve(comp));
      })
    }
  })
}

function register(name: string, editor: SylApi) {
  const cb = (resolve: any, reject: any) => {
    // use cache
    if (lazyLoaderMap[name]) {
      resolve(lazyLoaderMap[name]);
    } else {
      execPlugin(name, editor).then((comp) => {
        lazyLoaderMap[name] = function (loadComp: TLoaderComponent, retryComp: TRetryComponent) {
          if (!cacheComponent[name]) {
            cacheComponent[name] = LazyComponent(comp as TPromise, loadComp, retryComp);
          }
          return cacheComponent[name];
        }
        resolve(lazyLoaderMap[name]);
      }).catch((e) => {
        reject(e);
      })
    }
  }
  if (isExec) {
    return new Promise(cb);
  } else {
    return new Promise((resolve, reject) => {
      registerCb.push(() => {
        cb(resolve, reject);
      });
    });
  }
}

export {
  defaultMeta,
  getLazyComponentLoader,
  getPluginsConfig,
  inject,
  register,
  TRetry,
};
