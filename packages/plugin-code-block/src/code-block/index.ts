import { SylPlugin } from '@syllepsis/adapter';

import { ICodeBlockProps, PLUGIN_NAME } from './config';
import { CodeBlockController } from './controller';
import { CodeBlock } from './schema';

class CodeBlockPlugin extends SylPlugin<ICodeBlockProps> {
  public name = PLUGIN_NAME;
  public Controller = CodeBlockController;
  public Schema = CodeBlock;
}

export { CodeBlockPlugin };
