import isEqual from 'lodash.isequal';

import { SylApi } from './api';
import { Types } from './libs';

class BaseModule<Option = any> {
  public adapter: SylApi;
  public option: Option;

  constructor(adapter: SylApi, option: Option) {
    this.adapter = adapter;
    this.option = option;
  }

  public setProps(...arg: any[]) {}

  public replaceProps(...arg: any[]) {}

  public destructor() {}
}

interface IModuleType<T = Types.StringMap<any>> {
  option: T;
  Ctor: new (...props: any[]) => BaseModule;
}
class ModuleManager {
  public modulesMap: Types.StringMap<IModuleType> = {};
  public cache: Types.StringMap<BaseModule<any> | null> = {};
  public adapter: SylApi;

  constructor(adapter: SylApi, modulesMap: Types.StringMap<IModuleType>) {
    this.adapter = adapter;
    this.modulesMap = { ...modulesMap };
  }

  public install() {
    Object.keys(this.modulesMap).forEach(name => {
      const moduleMap = this.modulesMap[name];
      this.cache[name] = new moduleMap.Ctor(this.adapter, moduleMap.option);
    });
  }

  public get(name: string) {
    return this.cache[name];
  }

  public update(props: Types.StringMap<IModuleType>) {
    Object.keys(props).map(name => this.updateModule(name, props[name].option));
  }

  public updateModule(name: string, option: IModuleType['option']) {
    const instance = this.cache[name];
    const curConfig = this.modulesMap[name];
    if (!instance || !curConfig) return false;
    if (!isEqual(curConfig.option, option)) {
      instance.setProps(option);
      curConfig.option = { ...curConfig.option, ...option };
    }
  }

  public add(name: string, override = false) {
    if (!override && this.cache[name]) return;
    const moduleMap = this.modulesMap[name];
    if (!moduleMap) return;
    const module = this.cache[name];
    if (module) {
      module.destructor();
      this.cache[name] = null;
    }
    this.cache[name] = new moduleMap.Ctor(this.adapter, moduleMap.option);
  }

  public remove(name: string) {
    const module = this.cache[name];
    if (module) {
      module.destructor();
      this.cache[name] = null;
    }
  }

  public uninstall() {
    Object.keys(this.cache).forEach(name => {
      const module = this.cache[name];
      module && module.destructor();
      this.cache[name] = null;
    });
  }
}

export { BaseModule, IModuleType, ModuleManager };
