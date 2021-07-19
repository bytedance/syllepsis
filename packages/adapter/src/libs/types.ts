/* eslint-disable import/group-exports */
import { SylPlugin, SylUnionPlugin } from '../schema';

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Types {
  export type noop = () => void;
  export interface StringMap<T> {
    [index: string]: T;
  }

  export type ValueOf<T> = T extends Array<any> ? T[number] : T[keyof T];

  export interface IRangeStatic {
    index: number;
    length: number;
  }

  export interface BoundingStatic {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }

  export interface Ctor<Instance = any> {
    new (...props: any[]): Instance;
  }

  export interface DeepArray<T> extends Array<T | DeepArray<T>> {}
}

interface ISylPluginProps {
  controllerProps?: Types.StringMap<any>;
  layers?: Types.StringMap<any>;
}

interface IConfigPluginObj {
  plugin: ISylPlugin;
  controllerProps?: Types.StringMap<any>;
  layers?: Types.StringMap<(props: any) => any>; // custom layers
}

type ISylPlugin = typeof SylPlugin | typeof SylUnionPlugin | Plugin | SylPlugin | SylUnionPlugin;

type ISylPluginConfig = ISylPlugin | IConfigPluginObj;

export { IConfigPluginObj, ISylPluginConfig, ISylPluginProps, Types };
