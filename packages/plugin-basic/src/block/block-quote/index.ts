import { Block, SylPlugin } from '@syllepsis/adapter';

const NAME = 'block_quote';
class BlockQuote extends Block<any> {
  public name = NAME;
  public tagName = () => 'blockquote';

  public content = 'paragraph+';

  public textMatcher = [
    {
      matcher: [/^>\s$/, /^》\s$/],
    },
  ];

  public parseDOM = [{ tag: 'blockquote' }, { tag: 'bi' }];
}

class BlockQuotePlugin extends SylPlugin {
  public name = NAME;
  public Schema = BlockQuote;
}

export { BlockQuote, BlockQuotePlugin };
