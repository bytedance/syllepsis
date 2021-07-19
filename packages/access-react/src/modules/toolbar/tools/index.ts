import { IToolbar, SylApi } from '@syllepsis/adapter';
import { IToolbarOption, TContent } from '@syllepsis/editor';

import { ToolbarType, ToolDisplay } from '../utils';

export * from './button';
export * from './custom-button';
export * from './divider';
export * from './more';
export * from './select';

export interface IProp {
  name: string;
  toolbar: IToolbar;
  tooltip: TContent['tooltip'];
  showName?: TContent['showName'];
  tipDirection: IToolbarOption['tipDirection'];
  tipDistance: IToolbarOption['tipDistance'];
  active: boolean;
  handler: (editor: SylApi, name?: string, ...args: any[]) => any;
  attrs: { [key: string]: any } | false;
  editor: SylApi;
  display: ToolDisplay;
  getAttrs?: (editor: SylApi) => any;
  toolbarType: ToolbarType;
}
