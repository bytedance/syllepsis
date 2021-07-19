import { Types } from '../libs';

/**
 * this match text before cursor, fired when cursor position changing
 * and the cursor adjacent the aims text at the same time
 * return attrs for creating ProseMirror.Schema.Node or ProseMirror.Schema.Mark
 */
type TextMatcherHandler = (
  match: RegExpExecArray,
  offset?: number,
  boundStatics?: {
    getStart: () => Types.BoundingStatic;
    getEnd: () => Types.BoundingStatic;
  },
) => Types.StringMap<any> | undefined | null | boolean;

type ParseDOMMatcher<Structure> =
  | {
      tag: string;
      priority?: number;
      preserveWhitespace?: 'full' | undefined;
      getAttrs?(dom: HTMLElement): Partial<Structure> | boolean | void;
    }
  | {
      style: string;
      priority?: number;
      preserveWhitespace?: 'full' | undefined;
      getAttrs?(dom: string): Partial<Structure> | boolean | void;
    };

// this interface is common matcher format, define both textMatcher & markMatcher
interface IMatcherConfig<MatcherType = RegExp | RegExp[], HandlerType = TextMatcherHandler> {
  name?: string;
  matcher: MatcherType;
  inputOnly?: boolean;
  handler?: HandlerType;
  timing?: 'enter' | 'input' | string;
}

export { IMatcherConfig, ParseDOMMatcher, TextMatcherHandler };
