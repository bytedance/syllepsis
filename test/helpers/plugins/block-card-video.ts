import { Video as BaseSchema, VideoPlugin as BasePlugin } from '../../../packages/plugin-basic/dist/es';

class Video extends BaseSchema {
  public NodeView: any = null;
}

class VideoPlugin extends BasePlugin {
  public Schema = Video;
}

export { VideoPlugin };
