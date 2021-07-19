// @ts-nocheck

describe('inline shortcut test', () => {
  test('can disable shortcut', async () => {
    const shortcutable = await page.evaluate(() => {
      editor.disableShortcut();
      return editor.shortcutable;
    });
    expect(shortcutable).toBe(false);
  });

  test('can enable shortcut', async () => {
    const shortcutable = await page.evaluate(() => {
      editor.enableShortcut();
      return editor.shortcutable;
    });
    expect(shortcutable).toBe(true);
  });

  test('can realize inline shortcut', async () => {
    await page.evaluate(() => {
      editor.setHTML('');
      editor.focus();
    });
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('1');
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('Space');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toBe('<p><strong>1</strong> </p>');
  });

  test('do not keep shortcut mark ', async () => {
    await page.keyboard.press('1');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toBe('<p><strong>1</strong> 1</p>');
  });

  test('can keep existed marks', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p><em>1</em></p>');
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('1');
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('Space');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toBe('<p><em>1<strong>1</strong> </em></p>');
  });

  test('do not affect existed data', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ index: 4, length: 0 });
    });

    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('1');
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('NumpadMultiply');
    await page.keyboard.press('Space');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toBe('<p>123<strong>1</strong> </p>');
  });

  test('can realize inline_card shortcut', async () => {
    await page.evaluate(() => {
      editor.setHTML('');
    });
    await page.keyboard.type('{ inline_card }');

    await page.keyboard.press('Space');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toBe('<p><a>inline_card</a></p>');
  });
});

describe('list shortcut test', () => {
  test('can realize ordered_list shortcut', async () => {
    await page.evaluate(() => {
      editor.setHTML('');
    });
    await page.click('.ProseMirror');
    await page.keyboard.press('1');
    await page.keyboard.press('0');
    await page.keyboard.press('Period');
    await page.keyboard.press('Space');
    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toBe('<ol start="10"><li><br></li></ol>');
    expect(res.selection).toMatchObject({ index: 2, length: 0 });

    await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ index: 1, length: 0 });
    });
    await page.keyboard.press('1');
    await page.keyboard.press('0');
    await page.keyboard.press('0');
    await page.keyboard.press('Period');
    await page.keyboard.press('Space');
    const res1 = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res1.html).toBe('<ol start="100"><li>123</li></ol>');
    expect(res1.selection).toMatchObject({ index: 2, length: 0 });
  });
  test('can realize bullet_list shortcut', async () => {
    await page.evaluate(() => {
      editor.setHTML('');
    });
    await page.click('.ProseMirror');
    await page.keyboard.press('Minus');
    await page.keyboard.press('Space');
    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toBe('<ul><li><br></li></ul>');
    expect(res.selection).toMatchObject({ index: 2, length: 0 });

    await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ index: 1, length: 0 });
    });
    await page.keyboard.press('Minus');
    await page.keyboard.press('Space');
    const res1 = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res1.html).toBe('<ul><li>123</li></ul>');
    expect(res1.selection).toMatchObject({ index: 2, length: 0 });
  });
  test('can merge to previous list', async () => {
    await page.evaluate(() => {
      editor.setSelection({ index: 8, length: 0 });
    });
    await page.keyboard.press('Minus');
    await page.keyboard.press('Space');
    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res.html).toBe('<ul><li>123</li><li><br></li></ul>');
    expect(res.selection).toMatchObject({ index: 7, length: 0 });
  });
});

describe('block shortcut test', () => {
  test('can realize textBlock shortcut', async () => {
    await page.evaluate(() => {
      editor.setHTML('>');
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('Space');
    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toEqual('<blockquote><p><br></p></blockquote>');
    expect(res.selection).toMatchObject({ index: 2, length: 0 });
  });

  test('can realize enter timing textBlock shortcut', async () => {
    await page.evaluate(() => {
      editor.setHTML('》');
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('Enter');
    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toEqual('<blockquote><p><br></p></blockquote>');
    expect(res.selection).toMatchObject({ index: 2, length: 0 });
  });

  test('can wrap content using textBlock shortcut', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>>123</p>');
      editor.setSelection({ index: 2, length: 0 });
    });

    await page.keyboard.press('Space');

    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toEqual('<blockquote><p>123</p></blockquote>');
    expect(res.selection).toMatchObject({ index: 2, length: 0 });
  });

  test('can insert raw Block with shortcut', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>---</p>');
      editor.setSelection({ index: 4, length: 0 });
    });

    await page.keyboard.press('Space');

    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toEqual('<hr>');
    expect(res.selection).toMatchObject({ index: 2, length: 0 });
  });

  test('can realize card shortcut', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>{-- Card --</p>');
      editor.setSelection({ index: 12, length: 0 });
    });

    await page.keyboard.press('}');

    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toEqual('<div>Card</div>');
    expect(res.selection).toMatchObject({ index: 2, length: 0 });
  });

  test('can realize decline shortcut', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>{-- CardSkip --</p>');
      editor.setSelection({ index: 16, length: 0 });
    });

    await page.keyboard.press('}');

    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });
    expect(res.html).toEqual('<p>{-- CardSkip --}</p>');
    expect(res.selection).toMatchObject({ index: 17, length: 0 });
  });
});
