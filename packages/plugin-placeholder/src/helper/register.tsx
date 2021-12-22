import { LocalEvent } from '@syllepsis/adapter';
import axios from 'axios';
import React, { lazy, Suspense, useCallback, useMemo, useState } from 'react';

import { IDynamicSylApi } from '../mvc/schema';
import { IPluginData, TPromise } from '../mvc/types';
import { isOk } from './http';
import { deepCopy } from './index';

type TRetry = () => void;
type TLoaderComponent = () => JSX.Element;
type TRetryComponent = (props: { retry: TRetry }) => JSX.Element;

interface IConfigData {
  meta?: any,
  data?: any,
  initTools?: any,
  initComp?: any
}

interface IPluginKeyValue {
  [key: string]: IPluginData
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


const PLUGIN_EVENT = {
  READY: 'plugin-cycle-ready'
};

const PLUGIN_STATUS = { ONLINE: 1, OFFLINE: -1 }
const VERSION = { ON: 1, OFF: -1 }
const cacheKey = '__syllepsis__dynamic__plugins__'

function dispatch(event: string, data?: any) {
  window.dispatchEvent(new CustomEvent(event, {
    detail: data
  }));
}

class Register {
  private readonly editor: IDynamicSylApi;
  private cacheComponent: { [key: string]: any; };
  private lazyLoaderMap: { [key: string]: any; };
  private pluginsConfig: IPluginKeyValue;
  private isInitConfig: boolean;
  private isExec: boolean;
  private registerCb: any[];

  constructor(editor: IDynamicSylApi) {
    this.editor = editor;
    this.cacheComponent = {}
    this.lazyLoaderMap = {}
    this.pluginsConfig = {};
    this.isInitConfig = false;
    this.isExec = false;
    this.registerCb = [];
    // init when unmount
    this.editor.on(LocalEvent.EDITOR_WILL_UNMOUNT, this.init)
  }

  init = () => {
    // reset data when init
    const keys = Object.keys(this.pluginsConfig);
    keys.forEach((eachKey) => {
      this.pluginsConfig[eachKey].__isInit = false;
    })
    this.cacheComponent = {}
    this.lazyLoaderMap = {}
    this.pluginsConfig = {};
    this.isInitConfig = false;
    this.isExec = false;
    this.registerCb = [];
  }

  // refer: https://github.com/C-Rodg/React-Lazy-Retry/blob/master/src/index.js
  LazyComponent = (promise: TPromise, LoaderComp: TLoaderComponent, RetryComp: TRetryComponent) => {
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

  getLazyComponentLoader = (name: string) => this.lazyLoaderMap[name]

  getPluginsConfig = (name: string) => this.pluginsConfig[name]

  inject = async (url: string | IPluginKeyValue, _config = {}) => {
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
              this.assignPluginConfig(this.pluginsConfig, cacheConfig);
              useCache = true;
            }
          }
          if (useCache) {
            this.injectUrl(url).then((config) => {
              if (typeof config === 'object') {
                window.localStorage.setItem(cacheKey, JSON.stringify(config));
              }
            })
          } else {
            this.pluginsConfig = Object.assign(this.pluginsConfig, await this.injectUrl(url));
            if (typeof this.pluginsConfig === 'object') {
              window.localStorage.setItem(cacheKey, JSON.stringify(this.pluginsConfig));
            }
          }
        } catch (e) {
          console.error('fetch config error', e);
        }
      } else {
        const serverConfig = await this.injectUrl(url);
        this.pluginsConfig = Object.assign(serverConfig, this.pluginsConfig);
      }
    } else if (typeof url === 'object') {
      this.pluginsConfig = Object.assign(this.pluginsConfig, url);
    } else {
      console.error('invalid params: url', url);
    }

    this.isInitConfig = true;

    if (isEnd) {
      // console.log('valid', pluginsConfig);
      this.execIfNeed(this.editor, this.pluginsConfig);
      dispatch(PLUGIN_EVENT.READY);
    }
  }


  injectUrl = async(url: string) => {
    const data = { params: { status: PLUGIN_STATUS.ONLINE, versionOn: VERSION.ON } }
    const res = await axios.get(url, data);
    if (isOk(res)) {
      const pluginsData: IPluginKeyValue = {};
      const data = res.data.data as IPluginData[];
      return this.appendPluginConfig(pluginsData, data);
    }
    return {};
  }

  appendPluginConfig = (preData: { [key: string]: IPluginData }, appendData: IPluginData[]) => {
    appendData.forEach((eachPluginData: IPluginData) => {
      const { name } = eachPluginData;
      if (name) {
        const tempPluginData = deepCopy(eachPluginData);
        tempPluginData.init = this.getInitFunction(eachPluginData);
        if (!preData[name]) {
          preData[name] = tempPluginData;
        }
      }
    });
    return preData;
  }

  assignPluginConfig = (preData: { [key: string]: IPluginData }, appendData: { [key: string]: IPluginData }) => {
    const keys = Object.keys(appendData);
    keys.forEach((eachKey: string) => {
      const eachPluginData = appendData[eachKey];
      const { name } = eachPluginData;
      if (name) {
        const tempPluginData = deepCopy(eachPluginData);
        tempPluginData.init = this.getInitFunction(eachPluginData);
        if (!preData[name]) {
          preData[name] = tempPluginData;
        }
      }
    });
  }

  getInitFunction = (eachPluginData: IPluginData) => {
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
    return () => new Promise(() => {
      axios.get(url).then(res => {
        eval(res.data);
      })
    });
  }

  execIfNeed = (editor: IDynamicSylApi, pluginsConfig: IPluginKeyValue) => {
    const keys = Object.keys(pluginsConfig);
    keys.forEach((eachKey) => {
      this.execPlugin(eachKey, editor);
    });
    this.isExec = true;
    this.registerCb.forEach((eachRegister) => {
      eachRegister();
    });
  }

  execPlugin = (name: string, editor: IDynamicSylApi) => new Promise(async (resolve, reject) => {
    if (this.isInitConfig) {
      const currPluginData = this.getPluginsConfig(name);
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

        // prevent repeat init
        if (initTools && !currPluginData.__isInit) {
          currPluginData.__isInit = true;
          await initTools(editor, meta, data, name);
          editor.dynamicPlugins.ready('initTools.' + name);
        }
        resolve(config.initComp ? config.initComp() : '');
      }).catch((error: any) => {
        console.log('plugin init error', name, error);
        currPluginData.__isInit = false;
      });
    } else {
      window.addEventListener(PLUGIN_EVENT.READY, () => {
        this.execPlugin(name, editor).then(comp => resolve(comp));
      })
    }
  })

  register = (name: string, editor: IDynamicSylApi) => {
    const cb = (resolve: any, reject: any) => {
      // use cache
      if (this.lazyLoaderMap[name]) {
        resolve(this.lazyLoaderMap[name]);
      } else {
        this.execPlugin(name, editor).then((comp) => {
          this.lazyLoaderMap[name] = (loadComp: TLoaderComponent, retryComp: TRetryComponent) => {
            if (!this.cacheComponent[name]) {
              this.cacheComponent[name] = this.LazyComponent(comp as TPromise, loadComp, retryComp);
            }
            return this.cacheComponent[name];
          }
          resolve(this.lazyLoaderMap[name]);
        }).catch((e) => {
          reject(e);
        })
      }
    }
    if (this.isExec) {
      return new Promise(cb);
    } else {
      return new Promise((resolve, reject) => {
        this.registerCb.push(() => {
          cb(resolve, reject);
        });
      });
    }
  }
}

export {
  defaultMeta,
  Register,
  TRetry,
};
