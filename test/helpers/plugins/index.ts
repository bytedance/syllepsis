import { PluginKey, Plugin } from 'prosemirror-state';
import { BlockQuotePlugin } from './block-quote';
import { HeaderPlugin } from './block-header';
import { IgnorePlugin } from './inline-ignore';
import { IgnoreTagPlugin } from './inline-ignore-tag';
import { CardPlugin } from './block-card';
import { InlineCardPlugin } from './inline-card';
import { ItalicPlugin } from './inline-Italic';
import { UnderlinePlugin } from './inline-underline';
import { StrikeThroughPlugin } from './inline-strike-through';
import { InlineCardTextPlugin } from './inline-card-text';
import { IsolatingPlugin } from './isolating-block';
import { PastePlugin } from './paste-handler';
import { SylPlugin, SylSchema } from '../../../packages/adapter/dist/es';

const key = new PluginKey('nativePlugin');

const nativePlugin = new Plugin({
  key,
  prioritize: true,
});

const testPlugins: any = [
  new BlockQuotePlugin(),
  IgnorePlugin,
  IgnoreTagPlugin,
  new UnderlinePlugin(),
  new HeaderPlugin(),
  CardPlugin,
  {
    plugin: CardPlugin,
    controllerProps: {
      name: 'header',
    },
    layers: {
      test: () => 'test',
    },
  },
  {
    plugin: InlineCardPlugin,
  },
  new ItalicPlugin(),
  new StrikeThroughPlugin(),
  InlineCardTextPlugin,
  class EmptyPlugin extends SylPlugin<any> {},
  class RepeatPlugin extends SylPlugin<any> {
    // @ts-ignore
    public Schema = class Text extends SylSchema<never> {
      public name = 'text';
      public group = 'inline';
    };
  },
  nativePlugin,
  IsolatingPlugin,
  new PastePlugin(),
];

export { testPlugins };
