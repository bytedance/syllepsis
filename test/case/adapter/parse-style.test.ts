import { parseTypesetStyle as OriginParse } from '../../../packages/adapter/dist/es';

const parseTypesetStyle = (style: string) => {
  const res = OriginParse(style);
  Object.keys(res).forEach(key => {
    // @ts-ignore
    if (res[key] === undefined) delete res[key];
  });
  return res;
};

describe('test parse type-setting-style', () => {
  test('can parse text-indent with em', () => {
    const res = parseTypesetStyle('text-indent: 3em;');
    expect(res).toEqual({ lineIndent: 3 });
  });

  test('can parse text-indent with px', () => {
    const res = parseTypesetStyle('text-indent: 32px;');
    expect(res).toEqual({ lineIndent: 2 });
  });

  test('can parse text-indent with pt', () => {
    const res = parseTypesetStyle('text-indent: 64pt;');
    expect(res).toEqual({ lineIndent: 3 });
  });

  test('can parse line-height with scale', () => {
    const res = parseTypesetStyle('line-height: 3;');
    expect(res).toEqual({ lineHeight: 3 });
  });

  test('can parse line-height with px', () => {
    const res = parseTypesetStyle('line-height: 48px;');
    expect(res).toEqual({ lineHeight: 3 });
  });

  test('can parse line-height with em', () => {
    const res = parseTypesetStyle('line-height: 56pt;');
    expect(res).toEqual({ lineHeight: 2.63 });
  });

  test('can parse margin', () => {
    const res = parseTypesetStyle('margin: 3px;');
    expect(res).toEqual({
      spaceBefore: 3,
      spaceAfter: 3,
      spaceBoth: 3,
    });

    const res1 = parseTypesetStyle('margin: 3px 4px;');
    expect(res1).toEqual({
      spaceBefore: 3,
      spaceAfter: 3,
      spaceBoth: 4,
    });

    const res2 = parseTypesetStyle('margin: 3px 4px 5px;');
    expect(res2).toEqual({
      spaceBefore: 3,
      spaceAfter: 5,
      spaceBoth: 4,
    });

    const res3 = parseTypesetStyle('margin: 3px 4px 5px 6px;');
    expect(res3).toEqual({
      spaceBefore: 3,
      spaceAfter: 5,
      spaceBoth: 6,
    });
  });

  test('can parse margin with specific position', () => {
    const res = parseTypesetStyle('margin-top: 3px;');
    expect(res).toEqual({ spaceBefore: 3 });

    const res1 = parseTypesetStyle('margin-right: 3px;');
    expect(res1).toEqual({ spaceBoth: 3 });

    const res2 = parseTypesetStyle('margin-bottom: 3px;');
    expect(res2).toEqual({ spaceAfter: 3 });

    const res3 = parseTypesetStyle('margin-left: 3px;');
    expect(res3).toEqual({ spaceBoth: 3 });
  });

  test('can parse padding', () => {
    const res = parseTypesetStyle('padding: 3px;');
    expect(res).toEqual({
      spaceBefore: 3,
      spaceAfter: 3,
      spaceBoth: 3,
    });

    const res1 = parseTypesetStyle('padding: 3px 4px;');
    expect(res1).toEqual({
      spaceBefore: 3,
      spaceAfter: 3,
      spaceBoth: 4,
    });

    const res2 = parseTypesetStyle('padding: 3px 4px 5px;');
    expect(res2).toEqual({
      spaceBefore: 3,
      spaceAfter: 5,
      spaceBoth: 4,
    });

    const res3 = parseTypesetStyle('padding: 3px 4px 5px 6px;');
    expect(res3).toEqual({
      spaceBefore: 3,
      spaceAfter: 5,
      spaceBoth: 6,
    });
  });

  test('can parse padding with specific position', () => {
    const res = parseTypesetStyle('padding-top: 3px;');
    expect(res).toEqual({ spaceBefore: 3 });

    const res1 = parseTypesetStyle('padding-left: 3px;');
    expect(res1).toEqual({ spaceBoth: 3 });

    const res2 = parseTypesetStyle('padding-bottom: 3px;');
    expect(res2).toEqual({ spaceAfter: 3 });

    const res3 = parseTypesetStyle('padding-right: 3px;');
    expect(res3).toEqual({ spaceBoth: 3 });
  });

  test('can parse mix style', () => {
    const res = parseTypesetStyle(
      'padding: 3px 4px 5px 6px; margin: 4px 5px 6px 7px; line-height: 2; background-color: #000; text-indent: 3em;',
    );
    expect(res).toEqual({
      spaceBefore: 4,
      spaceBoth: 7,
      spaceAfter: 6,
      lineIndent: 3,
      lineHeight: 2,
    });

    const res1 = parseTypesetStyle(
      'padding: 3px 5px 6px; line-height: 48px; background-color: #000; font-family: PingFang-SC;text-indent: 2em;',
    );
    expect(res1).toEqual({
      spaceBefore: 3,
      spaceBoth: 5,
      spaceAfter: 6,
      lineIndent: 2,
      lineHeight: 3,
    });

    const res2 = parseTypesetStyle('padding: 0 5px; margin-top: 10px');
    expect(res2).toEqual({ spaceBefore: 10, spaceBoth: 5, spaceAfter: 0 });
  });

  test('get bigger value first', () => {
    const res1 = parseTypesetStyle('margin: 3px 5px 6px; padding: 0;');
    expect(res1).toEqual({
      spaceBefore: 3,
      spaceBoth: 5,
      spaceAfter: 6,
    });
  });
});
