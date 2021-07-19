import { Audio as BaseSchema, AudioPlugin as BasePlugin } from '../../../packages/plugin-basic/dist/es';

class Audio extends BaseSchema {
  public NodeView: any = null;
}

class AudioPlugin extends BasePlugin {
  public Schema = Audio;
}

export { AudioPlugin };
