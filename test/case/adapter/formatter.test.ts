// @ts-nocheck
const CardView = '<div>Card</div>';

describe('Clear Format - Node Type - textblock format', () => {
  test('can clear textblock format', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <h1>1</h1>
        <p>2</p>
        <h2>3</h2>
        `,
      );
      editor.setSelection({
        index: 1,
        length: 7,
      });
      editor.setFormat({ header: false });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toEqual('<p>1</p><p>2</p><p>3</p>');
    expect(res.selection).toMatchObject({ index: 1, length: 7 });
  });
  test('can set textblock format', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({
        index: 1,
        length: 2,
      });
      editor.setFormat({ header: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toEqual('<h1>123</h1>');
    expect(res.selection).toMatchObject({ index: 1, length: 2 });
  });

  test('can set textblock format width attributes', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({
        index: 1,
        length: 2,
      });
      editor.setFormat({ header: { level: 2 } });
      return editor.getHTML();
    });
    expect(res).toEqual('<h2>123</h2>');
  });

  test('set textblock format would not drop empty content or block', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(`<p>123</p><p></p>${CARD_HTML}<p>123</p>`);
      editor.setSelection({
        index: 1,
        length: 10,
      });
      editor.setFormat({ header: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toEqual(`<h1>123</h1><h1><br></h1>${CardView}<h1>123</h1>`);
    expect(res.selection).toMatchObject({ index: 1, length: 10 });
  });

  test('can set textblock format when mix other format', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(`
        <p>123</p>
        <ul>
          <li>123</li>
        </ul>
        <blockquote>
          <p>123</p>
        </blockquote>
      `);
      editor.setSelection({
        index: 1,
        length: 16,
      });
      editor.setFormat({ header: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toEqual('<h1>123</h1><h1>123</h1><h1>123</h1>');
    expect(res.selection).toMatchObject({ index: 1, length: 13 });
  });
});

describe('Format - Node Type - Blockquote', () => {
  test('would not wrongly set attribute to different node type', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p>123</p>`);
      editor.setSelection({ index: 1, length: 0 });
      editor.setFormat({ block_quote: { class: 'quote' } });
      return editor.getHTML();
    });

    expect(html).toEqual('<blockquote class="quote"><p>123</p></blockquote>');
  });
  test('can clear blockquote with extra text selected outside', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <blockquote>
          <p>1</p>
          <p>2</p>
          <p>3</p>
        </blockquote>
        <p>4</p>
        `,
      );
      editor.setSelection({ index: 2, length: 0 });
      editor.setFormat({ block_quote: false });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toEqual('<p>1</p><blockquote><p>2</p><p>3</p></blockquote><p>4</p>');
    expect(res.selection).toMatchObject({ index: 1, length: 0 });
  });
  test('can clear part of blockquote with range selected inside', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <blockquote>
          <p>1</p>
          <p>2</p>
          <p>3</p>
        </blockquote>
        `,
      );
      editor.setSelection({ index: 5, length: 1 });
      editor.setFormat({ block_quote: false });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toEqual('<blockquote><p>1</p></blockquote><p>2</p><blockquote><p>3</p></blockquote>');
    expect(res.selection).toMatchObject({ index: 6, length: 1 });
  });
  test('can setFormat of blockquote with range selected inside', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <blockquote>
          <p>1</p>
          <p>2</p>
          <p>3</p>
        </blockquote>
        `,
      );
      editor.setSelection({ index: 5, length: 1 });
      editor.setFormat({ header: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toEqual('<blockquote><p>1</p></blockquote><h1>2</h1><blockquote><p>3</p></blockquote>');
    expect(res.selection).toMatchObject({ index: 6, length: 1 });
  });
  test('can setFormat of blockquote with caret selection', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <blockquote>
          <p>1</p>
          <p>2</p>
          <p>3</p>
        </blockquote>
        `,
      );
      editor.setSelection({ index: 5, length: 0 });
      editor.setFormat({ header: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toEqual('<blockquote><p>1</p></blockquote><h1>2</h1><blockquote><p>3</p></blockquote>');
    expect(res.selection).toMatchObject({ index: 6, length: 0 });
  });
});

describe('Clear Format - Node Type - List', () => {
  test('can clear format in the middle of list', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        `,
      );
      editor.setSelection({
        index: 5,
        length: 0,
      });
      return editor.getHTML();
    });

    expect(html).toEqual('<ul><li>1</li><li>2</li><li>3</li></ul>');

    const res = await page.evaluate(() => {
      editor.setFormat({ bullet_list: false });

      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toEqual('<ul><li>1</li></ul><p>2</p><ul><li>3</li></ul>');
    // TODO: index should be 5
    expect(res.selection).toMatchObject({ index: 6, length: 0 });
  });

  test('can clear format for the whole list', async () => {
    await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        `,
      );
    });

    const key = /darwin/i.test(process.platform) ? 'Meta' : 'Control';

    await page.keyboard.down(key);
    await page.keyboard.press('KeyA');
    await page.keyboard.up(key);

    const res = await page.evaluate(() => {
      editor.setFormat({ bullet_list: false });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toEqual('<p>1</p><p>2</p><p>3</p>');
    expect(res.selection).toMatchObject({ index: 0, length: 11 });
  });

  test('can clear format with a while list and extra text outside selected', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        <p>text</p>
        `,
      );
      editor.setSelection({
        index: 2,
        length: 13,
      });
      editor.setFormat({ bullet_list: false });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toEqual('<p>1</p><p>2</p><p>3</p><p>text</p>');
    expect(res.selection).toMatchObject({ index: 1, length: 12 });
  });

  test('can clear format with a partial list and extra text outside selected', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        <p>text</p>
        `,
      );
      editor.setSelection({
        index: 5,
        length: 10,
      });
      editor.setFormat({ bullet_list: false });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toEqual('<ul><li>1</li></ul><p>2</p><p>3</p><p>text</p>');
    expect(res.selection).toMatchObject({ index: 6, length: 9 });
  });

  test('can use setFormat setList', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({
        index: 1,
        length: 0,
      });
      editor.setFormat({ bullet_list: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toEqual('<ul><li>123</li></ul>');
    expect(res.selection).toMatchObject({ index: 2, length: 0 });
  });

  test('can clear format for the whole list', async () => {
    let html = await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        `,
      );
      editor.setSelection({
        index: 2,
        length: 7, // ending cursor positioned before `3`
      });

      return editor.getHTML();
    });
    expect(html).toEqual('<ul><li>1</li><li>2</li><li>3</li></ul>');

    html = await page.evaluate(() => {
      editor.setFormat({ bullet_list: false });
      return editor.getHTML();
    });

    expect(html).toEqual('<p>1</p><p>2</p><p>3</p>');
  });

  test('cursor in right after clear list', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>1</li>
        </ul>
        `,
      );
      editor.setSelection({
        index: 2,
        length: 0,
      });
      editor.setFormat({ bullet_list: false });

      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toEqual('<p>1</p>');
    expect(res.selection).toMatchObject({ index: 1, length: 0 });
  });

  test('cursor in right after switch list', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <ol>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ol>
        `,
      );
      editor.setSelection({
        index: 5,
        length: 0,
      });
      editor.setFormat({ bullet_list: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toBe('<ol start="1"><li>1</li></ol><ul><li>2</li></ul><ol start="1"><li>3</li></ol>');
    expect(res.selection).toMatchObject({ index: 7, length: 0 });
  });

  test('cursor in right position after clear list with nested list selected in range', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>1</li>
          <ul>
            <li>2</li>
            <ul>
              <li>3</li>
            </ul>
            </ul>
          <li>4</li>
        </ul>
        `,
      );
      editor.setSelection({
        index: 6,
        length: 5,
      });
      editor.setFormat({ bullet_list: false });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toBe('<ul><li>1</li></ul><p>2</p><p>3</p><ul><li>4</li></ul>');
    expect(res.selection).toMatchObject({ index: 6, length: 4 });
  });

  test('cursor in right position after switch list with nested list selected in range', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <ol>
          <li>1</li>
          <ol>
            <li>2</li>
            <ol>
              <li>3</li>
            </ol>
            </ol>
          <li>4</li>
        </ol>
        `,
      );
      editor.setSelection({
        index: 6,
        length: 5,
      });
      editor.setFormat({ bullet_list: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toBe(
      '<ol start="1"><li>1</li></ol><ul><ul><li>2</li><ul><li>3</li></ul></ul></ul><ol start="1"><li>4</li></ol>',
    );
    expect(res.selection).toMatchObject({ index: 8, length: 10 });
  });

  test('can keep nested level while range contains more than one list', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <ol>
          <li>1</li>
          <ol>
            <li>2</li>
            <ol>
              <li>3</li>
            </ol>
          </ol>
          <li>4</li>
        </ol>
        <ol>
          <li>5</li>
          <ol>
            <li>6</li>
          </ol>
        </ol>
        `,
      );
      editor.setSelection({
        index: 2,
        length: 23,
      });
      editor.setFormat({ bullet_list: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toBe(
      '<ul><li>1</li><ul><li>2</li><ul><li>3</li></ul></ul><li>4</li><li>5</li><ul><li>6</li></ul></ul>',
    );
    expect(res.selection).toMatchObject({ index: 2, length: 24 });
  });

  test('can keep nested level while range contains more than list node', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <ol>
          <li>1</li>
          <ol>
            <li>2</li>
            <ol>
              <li>3</li>
            </ol>
          </ol>
          <li>4</li>
        </ol>
        <p>5</p>
        <p>6</p>
        `,
      );
      editor.setSelection({
        index: 2,
        length: 21,
      });
      editor.setFormat({ bullet_list: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toBe('<ul><li>1</li><ul><li>2</li><ul><li>3</li></ul></ul><li>4</li><li>5</li><li>6</li></ul>');
    expect(res.selection).toMatchObject({ index: 2, length: 20 });
  });

  test('toggle between nodes that can and cannot nest themselves', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        `,
      );
      editor.setSelection({
        index: 5,
        length: 0,
      });
      editor.setFormat({ block_quote: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toBe('<ul><li>1</li></ul><blockquote><p>2</p></blockquote><ul><li>3</li></ul>');
    expect(res.selection).toMatchObject({ index: 7, length: 0 });

    const res1 = await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        `,
      );
      editor.setSelection({
        index: 2,
        length: 6,
      });
      editor.setFormat({ block_quote: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res1.html).toBe('<blockquote><p>1</p><p>2</p><p>3</p></blockquote>');
    expect(res1.selection).toMatchObject({ index: 2, length: 6 });

    const res2 = await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>1</li>
          <ul><li>2</li></ul>
          <li>3</li>
          <ul><li>4</li></ul>
        </ul>
        `,
      );
      editor.setSelection({
        index: 2,
        length: 16,
      });
      editor.setFormat({ block_quote: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res2.html).toBe('<blockquote><p>1</p><p>2</p><p>3</p><p>4</p></blockquote>');
    expect(res2.selection).toMatchObject({ index: 2, length: 14 });

    const res3 = await page.evaluate(() => {
      editor.setHTML(
        `
        <ul>
          <li>abc</li>
          <ul>
            <li>abc</li>
            <li>abc</li>
          </ul>
          <li>abc</li>
        </ul>
        `,
      );
      editor.setSelection({
        index: 9,
        length: 6,
      });
      editor.setFormat({ block_quote: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res3.html).toBe('<ul><li>abc</li></ul><blockquote><p>abc</p><p>abc</p></blockquote><ul><li>abc</li></ul>');
    expect(res3.selection).toMatchObject({ index: 10, length: 6 });
  });
});

describe('setFormat - isolating node', () => {
  test('would not handler when selection contains isolating node', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('<p>abc</p><div class="isolating"><p>123</p></div><p>efg</p>');
      // from in isolating
      editor.setSelection({ index: 8, length: 8 });
      editor.setFormat({ header: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toBe('<p>abc</p><div class="isolating"><p>123</p></div><h1>efg</h1>');
    expect(res.selection).toMatchObject({ index: 8, length: 8 });

    const res1 = await page.evaluate(() => {
      editor.undo();
      // to in isolating
      editor.setSelection({ index: 1, length: 9 });
      editor.setFormat({ block_quote: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res1.html).toBe('<blockquote><p>abc</p></blockquote><div class="isolating"><p>123</p></div><p>efg</p>');
    expect(res1.selection).toMatchObject({ index: 2, length: 8 });

    const res2 = await page.evaluate(() => {
      editor.undo();
      // across isolating
      editor.setSelection({ index: 1, length: 16 });
      editor.setFormat({ header: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res2.html).toBe('<h1>abc</h1><div class="isolating"><p>123</p></div><h1>efg</h1>');
    expect(res2.selection).toMatchObject({ index: 1, length: 16 });

    const res3 = await page.evaluate(() => {
      editor.undo();
      // across isolating
      editor.setSelection({ index: 1, length: 16 });
      editor.setFormat({ header: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res3.html).toBe('<h1>abc</h1><div class="isolating"><p>123</p></div><h1>efg</h1>');
    expect(res3.selection).toMatchObject({ index: 1, length: 16 });
  });

  test('can setFormat when in same isolating node', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('<div class="isolating"><p>123</p></div>');
      editor.setSelection({ index: 2, length: 1 });
      editor.setFormat({ header: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toBe('<div class="isolating"><h1>123</h1></div>');
    expect(res.selection).toMatchObject({ index: 2, length: 1 });
  });

  test('can not setFormat when cross isolating node', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('<div class="isolating"><p>123</p></div><div class="isolating"><p>abc</p></div>');
      editor.setSelection({ index: 2, length: 8 });
      editor.setFormat({ header: true });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toBe('<div class="isolating"><p>123</p></div><div class="isolating"><p>abc</p></div>');
    expect(res.selection).toMatchObject({ index: 2, length: 8 });
  });
});

describe('setFormat -- other', () => {
  test('can stored format', async () => {
    await page.evaluate(() => {
      editor.setHTML('');
      editor.setSelection({
        index: 1,
        length: 0,
      });
      editor.setFormat({ bold: true });
    });
    await page.keyboard.press('1');
    const html = await page.evaluate(() => editor.getHTML());
    expect(html).toEqual('<p><strong>1</strong></p>');
  });

  test('would not set mark when value is false', async () => {
    const html = await page.evaluate(() => {
      editor.setFormat({ bold: true });
      editor.setFormat({ bold: false });
      editor.setHTML('<p>123</p>');
      editor.setSelection({
        index: 1,
        length: 3,
      });
      editor.setFormat({ bold: false });
      return editor.getHTML();
    });
    expect(html).toEqual('<p>123</p>');
  });

  test('would force set mark when value is true', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>12345678</p>');
      editor.setSelection({
        index: 1,
        length: 3,
      });
      editor.setFormat({ bold: true });
      editor.setSelection({
        index: 1,
        length: 9,
      });
      editor.setFormat({ bold: true });
      return editor.getHTML();
    });
    expect(html).toEqual('<p><strong>12345678</strong></p>');
  });

  test('can set multi format when the type is mark', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({
        index: 1,
        length: 3,
      });
      editor.setFormat({ bold: true, underline: true });
      return editor.getHTML();
    });
    expect(html).toEqual('<p><u><strong>123</strong></u></p>');
  });

  test('can update mark attrs', async () => {
    const html1 = await page.evaluate(() => {
      editor.setHTML('<p><strong>123</strong></p>');
      editor.setSelection({
        index: 1,
        length: 3,
      });
      editor.setFormat({ bold: {} });
      return editor.getHTML();
    });
    const html2 = await page.evaluate(() => {
      editor.setHTML('<p><strong>123</strong></p>');
      editor.setSelection({
        index: 1,
        length: 0,
      });
      editor.setFormat({ bold: {} });
      return editor.getHTML();
    });
    expect(html1).toEqual('<p><strong>123</strong></p>');
    expect(html2).toEqual('<p><strong>123</strong></p>');
  });

  test('can not contain other mark when has excludes = _ ', async () => {
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

  test('inlineCard can not contain other mark when has excludes = _ or specific type', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p>${INLINE_CARD_HTML}${INLINE_CARD_TEXT_HTML}</p>`);
      editor.setSelection({
        index: 1,
        length: 2,
      });
      editor.setFormat({ bold: true });
      editor.setFormat({ bold: {} });
      return editor.getHTML();
    });
    expect(html).toEqual('<p><a>inline_card</a><a>inline_card_text</a></p>');
  });

  test('can set conflict mark in part of content', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p><em>123123</em></p>');
      editor.setSelection({
        index: 4,
        length: 3,
      });
      editor.setFormat({ underline: true });
      return editor.getHTML();
    });
    expect(html).toEqual('<p><em>123</em><u>123</u></p>');
  });

  test('will not affect the conflict mark when cleared', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p><u>123</u><em>123</em></p>');
      editor.setSelection({
        index: 1,
        length: 6,
      });
      editor.setFormat({ underline: false });
      return editor.getHTML();
    });
    expect(html).toEqual('<p>123<em>123</em></p>');
  });

  test('simple mark can coexist', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p><strong>123</strong></p>');
      editor.setSelection({
        index: 1,
        length: 3,
      });

      editor.setFormat({ underline: true });
      return editor.getHTML();
    });

    expect(html).toEqual('<p><u><strong>123</strong></u></p>');
  });

  test('can not save dom which do not have parser', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(
        `<div class="CodeMirror">
          <pre class="CodeMirror-line">const a = "a";</pre>
        </div>
        <p code_block=true></p>
        <p><img /></p>
        `,
      );
      return editor.getHTML();
    });

    expect(html).toEqual('<p>const a = "a";</p>');
  });

  test('keep same attrs when switch type', async () => {
    const res1 = await page.evaluate(() => {
      editor.setHTML(`<p style="text-align: center;">123</p>`);
      editor.setFormat({ bullet_list: true });
      return {
        html: editor.getHTML(),
        align: editor.view.state.selection.$from.node().attrs.align,
      };
    });

    expect(res1.html).toEqual('<ul><li style="text-align: center;list-style-position: inside;">123</li></ul>');
    expect(res1.align).toEqual('center');

    const res2 = await page.evaluate(() => {
      editor.setFormat({ bullet_list: false });
      return {
        html: editor.getHTML(),
        align: editor.view.state.selection.$from.node().attrs.align,
      };
    });
    expect(res2.html).toEqual('<p style="text-align: center;">123</p>');
    expect(res2.align).toEqual('center');
  });

  test('attrs takes effect in nested Nodes', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<blockquote><p>123</p></blockquote>');
      editor.setSelection({
        index: 3,
        length: 0,
      });
      editor.setFormat({ header: { class: 'test' } });
      return editor.getHTML();
    });
    expect(html).toEqual(`<h1 class="test">123</h1>`);
  });

  test('using with range before selection', async () => {
    let html, selection;
    ({ html, selection } = await page.evaluate(() => {
      editor.setHTML('<p>1234567</p>');
      editor.setSelection({
        index: 2,
        length: 2,
      });
      editor.setFormat({ bold: true }, { index: 1, length: 1 });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    }));
    expect(html).toEqual(`<p><strong>1</strong>234567</p>`);
    expect(selection).toMatchObject({
      index: 2,
      length: 2,
    });

    // increase
    ({ html, selection } = await page.evaluate(() => {
      editor.setHTML('<p>1</p><p>1234567</p>');
      editor.setSelection({
        index: 6,
        length: 2,
      });
      editor.setFormat({ bullet_list: true }, { index: 1, length: 1 });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    }));
    expect(html).toEqual(`<ul><li>1</li></ul><p>1234567</p>`);
    expect(selection).toMatchObject({
      index: 8,
      length: 2,
    });

    // decrease
    ({ html, selection } = await page.evaluate(() => {
      editor.setFormat({ bullet_list: false }, { index: 2, length: 1 });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    }));
    expect(html).toEqual(`<p>1</p><p>1234567</p>`);
    expect(selection).toMatchObject({
      index: 6,
      length: 2,
    });
  });

  test('using with range after selection', async () => {
    let html, selection;
    ({ html, selection } = await page.evaluate(() => {
      editor.setHTML('<p>1234567</p>');
      editor.setSelection({
        index: 2,
        length: 2,
      });
      editor.setFormat({ bold: true }, { index: 4, length: 2 });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    }));
    expect(html).toEqual(`<p>123<strong>45</strong>67</p>`);
    expect(selection).toMatchObject({
      index: 2,
      length: 2,
    });

    // increase
    ({ html, selection } = await page.evaluate(() => {
      editor.setHTML('<p>1234567</p><p>1</p>');
      editor.setSelection({
        index: 3,
        length: 2,
      });
      editor.setFormat({ bullet_list: true }, { index: 10, length: 1 });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    }));
    expect(html).toEqual(`<p>1234567</p><ul><li>1</li></ul>`);
    expect(selection).toMatchObject({
      index: 3,
      length: 2,
    });

    // decrease
    ({ html, selection } = await page.evaluate(() => {
      editor.setFormat({ bullet_list: false }, { index: 11, length: 1 });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    }));
    expect(html).toEqual(`<p>1234567</p><p>1</p>`);
    expect(selection).toMatchObject({
      index: 3,
      length: 2,
    });
  });

  test('using with range contains selection', async () => {
    let html, selection;
    ({ html, selection } = await page.evaluate(() => {
      editor.setHTML('<p>1234567</p>');
      editor.setSelection({
        index: 2,
        length: 2,
      });
      editor.setFormat({ bold: true }, { index: 1, length: 4 });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    }));
    expect(html).toEqual(`<p><strong>1234</strong>567</p>`);
    expect(selection).toMatchObject({
      index: 2,
      length: 2,
    });

    // increase
    ({ html, selection } = await page.evaluate(() => {
      editor.setHTML('<p>1234567</p>');
      editor.setSelection({
        index: 3,
        length: 2,
      });
      editor.setFormat({ bullet_list: true }, { index: 1, length: 5 });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    }));
    expect(html).toEqual(`<ul><li>1234567</li></ul>`);
    expect(selection).toMatchObject({
      index: 4,
      length: 2,
    });

    // decrease
    ({ html, selection } = await page.evaluate(() => {
      editor.setFormat({ bullet_list: false }, { index: 2, length: 5 });
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    }));
    expect(html).toEqual(`<p>1234567</p>`);
    expect(selection).toMatchObject({
      index: 3,
      length: 2,
    });
  });
});
