import { Image as BaseSchema, ImagePlugin as BasePlugin } from '../../../packages/plugin-basic/dist/es';

class Image extends BaseSchema {
  public NodeView: any = null;
}

class ImagePlugin extends BasePlugin {
  public Schema = Image;
}

export { ImagePlugin };
