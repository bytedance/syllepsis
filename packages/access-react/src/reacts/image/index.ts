import { ImagePlugin as BasePlugin } from '@syllepsis/plugin-basic';

import { ImageView, InlineImageView } from './view';

class ImagePlugin extends BasePlugin {
  public Schema = ImageView;
}

class InlineImagePlugin extends BasePlugin {
  public Schema = InlineImageView;
}

export { ImagePlugin, InlineImagePlugin };
