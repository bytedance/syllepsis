import { SylPlugin } from '../../../packages/adapter/dist/es';
import { BlockQuote as BaseQuote } from '../../../packages/plugin-basic/dist/es/block/block-quote';

class BlockQuote extends BaseQuote {
  public content = '(paragraph|header|card)+';
  public textMatcher: any = [
    {
      matcher: /^>\s$/,
    },
    {
      matcher: /^》$/,
      timing: 'enter',
    },
  ];
  public attrs = {
    class: {
      default: '',
    },
  };
}

class BlockQuotePlugin extends SylPlugin<any> {
  public name = 'block_quote';
  public Schema = BlockQuote;
}

export { BlockQuotePlugin };
