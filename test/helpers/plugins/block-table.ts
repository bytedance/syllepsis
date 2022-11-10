// @ts-nocheck
import { TablePlugin as BaseTablePlugin } from '../../../packages/plugin-table/dist/es';

class TablePlugin extends BaseTablePlugin {
  init(...args: any[]) {
    const res = super.init(...args);
    res.nativePlugins = [];
    return res as any;
  }
}

export { TablePlugin };
