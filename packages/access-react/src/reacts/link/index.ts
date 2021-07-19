import { LinkPlugin as BasePlugin } from '@syllepsis/plugin-basic';

import { LinkController, LinkSchema } from './link';

class LinkPlugin extends BasePlugin {
  public Controller = LinkController;
  public Schema = LinkSchema;
}

export { LinkPlugin };
