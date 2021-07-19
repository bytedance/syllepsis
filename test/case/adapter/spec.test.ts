// @ts-nocheck

import { IG_EL, IG_TAG } from '../../../packages/adapter/dist/es';

const INLINE_CARD_TEXT = 'inline_card_text';

describe('Test syl spec config', () => {
  test('it can getInlineCard Text which has spec.getText', async () => {
    const text = await page.evaluate(() => {
      editor.setHTML(`<p><strong>1</strong>23</p><p><strong>312</strong>${INLINE_CARD_TEXT_HTML}</p>`);
      return editor.getText();
    });
    expect(text).toBe(`123312${INLINE_CARD_TEXT}`);
  });

  test('clearFormat can not clear mark has notClear spec', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p><em>123</em></p>');
      editor.setSelection({
        index: 1,
        length: 3,
      });

      editor.clearFormat();
      return editor.getHTML();
    });

    expect(html).toEqual('<p><em>123</em></p>');
  });

  test('can apply node when conflict with node marks', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p><strong>123</strong></p>`);
      editor.setSelection({ index: 2, length: 0 });
      editor.focus();
      editor.setFormat({ header: true });
      return editor.getHTML();
    });
    expect(html).toBe(`<h1>123</h1>`);
  });

  test('not keep mark after delete which has spec.notStore', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>1<u>23</u></p>');
      editor.setSelection({ index: 4, length: 0 });
    });

    await page.click('.ProseMirror > p:first-child', { clickCount: 1 });
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    const format = await page.evaluate(() => {
      return editor.getFormat();
    });
    expect(!!format.underline).toBe(false);
  });

  test('not keep mark after warp line which has spec.notStore', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>1<u>23</u></p>');
      editor.setSelection({ index: 4, length: 0 });
    });

    await page.keyboard.press('KeyA');
    await page.keyboard.press('Enter');
    await page.keyboard.press('KeyA');

    const html = await page.evaluate(() => {
      return editor.getHTML();
    });

    expect(html).toBe('<p>1<u>23a</u></p><p>a</p>');
  });

  test('not allow mark mention in excludeMarks by blockType', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p><strong>1</strong>23<em>456</em><u>789</u></p>`);
      editor.setSelection({ index: 2, length: 0 });
      editor.setFormat({ header: true });
      return editor.getHTML();
    });
    expect(html).toBe(`<h1>123456<u>789</u></h1>`);
  });

  test('it will replace mark when has excludes = _ , ', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p><em>123</em></p>');
      editor.setSelection({
        index: 1,
        length: 3,
      });
      editor.setFormat({ bold: true });
      return editor.getHTML();
    });

    expect(html).toEqual('<p><strong>123</strong></p>');
  });

  test('it will replace mark when has excludes has specific type', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p><strong>123</strong></p>');
      editor.setSelection({
        index: 1,
        length: 3,
      });

      editor.setFormat({ strike: true });
      return editor.getHTML();
    });

    expect(html).toEqual('<p><s>123</s></p>');
  });

  test('it will clear mark when enter to disallowed node', async () => {
    await page.evaluate(() => {
      editor.setHTML('<h1>123</h1><p><strong>123</strong></p>');
      editor.setSelection({
        index: 6,
        length: 0,
      });
    });
    await page.keyboard.press('Backspace');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('<h1>123123</h1>');
  });
});

describe('Test syl dom spec config', () => {
  test(`recognize ${IG_TAG} in dom attributes`, async () => {
    const html = await page.evaluate(attr => {
      editor.setHTML(`<p><strong ${attr}="true">123</strong></p>`);
      return editor.getHTML();
    }, IG_TAG);

    expect(html).toEqual('<p>123</p>');
  });

  test(`recognize ${IG_EL} in dom attributes`, async () => {
    const html = await page.evaluate(attr => {
      editor.setHTML(`<p><strong ${attr}="true">123</strong></p>`);
      return editor.getHTML();
    }, IG_EL);

    expect(html).toEqual('');
  });
});
