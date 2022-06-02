import { FORMAT_TYPE, SchemaMeta, SylController } from '../../schema';
import { blockLeafShortcut } from './block-leaf-shortcut';
import { inlineLeafShortcut } from './inline-leaf-shortcut';
import { createTextShortcutPlugin, TextShortcut } from './shortcut-plugin';
import { textblockTypeTextShortcut } from './text-block-shortcut';
import { textMarkShortcut } from './text-mark-shortcut';
/**
 * it build textmatcher as textblockshortcut and return a
 * TextShortcutPlugin instance
 */
const ruleBuilder = ($schemaMetas: SchemaMeta[], enable = true) => {
  const rules: TextShortcut[] = [];

  for (const $meta of $schemaMetas) {
    const name = $meta.name;
    const textMatcher = ($meta instanceof SylController ? $meta.textMatcher : $meta.config.textMatcher) || [];

    for (const textMatcherItem of textMatcher) {
      let regexps = textMatcherItem.matcher;

      if (!Array.isArray(regexps)) regexps = [regexps];

      for (const regexp of regexps) {
        // schema textMatcher
        switch ($meta.formatType) {
          case FORMAT_TYPE.BLOCK_ATOM:
          case FORMAT_TYPE.BLOCK_CARD:
            rules.push(blockLeafShortcut(regexp, name, textMatcherItem));
            break;
          case FORMAT_TYPE.INLINE_ATOM:
          case FORMAT_TYPE.INLINE_CARD:
            rules.push(inlineLeafShortcut(regexp, name, textMatcherItem));
            break;
          case FORMAT_TYPE.BLOCK:
            rules.push(textblockTypeTextShortcut(regexp, name, textMatcherItem));
            break;
          case FORMAT_TYPE.INLINE:
            rules.push(textMarkShortcut(regexp, name, textMatcherItem));
            break;
        }
      }
    }
  }

  return createTextShortcutPlugin(rules, enable);
};

export { ruleBuilder };
