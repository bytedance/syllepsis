import './index.css';

import { SylPlugin } from '@syllepsis/adapter';

import { PlaceholderController } from './mvc/controller';
import { PlaceholderSchema } from './mvc/schema';
import { PLACEHOLDER_KEY } from './mvc/types';

export { IToolsApi } from './comp/toolWrapper';
export { IDynamicApi } from './mvc/api';
export { IDynamicSylApi } from './mvc/schema';
export { IMeta, IPlaceholderRef } from './mvc/types';

export class PlaceholderPlugin extends SylPlugin {
  public name = PLACEHOLDER_KEY;
  public Controller = PlaceholderController;
  public Schema = PlaceholderSchema;
}