// @ts-nocheck

describe('list - Tab', () => {
  test('can sink list item at everywhere', async () => {
    // at head
    await page.evaluate(() => {
      editor.setHTML('<ul><li>123</li></ul>');
      editor.setSelection({ index: 2 });
    });
    await page.keyboard.press('Tab');
    const html = await page.evaluate(() => editor.getHTML());
    expect(html).toBe('<ul><ul><li>123</li></ul></ul>');

    // at inner
    await page.evaluate(() => {
      editor.setHTML('<ul><li>123</li></ul>');
      editor.setSelection({ index: 4 });
    });
    await page.keyboard.press('Tab');
    const html1 = await page.evaluate(() => editor.getHTML());
    expect(html1).toBe('<ul><ul><li>123</li></ul></ul>');

    // raw list_item
    await page.evaluate(() => {
      editor.setHTML('<li>123</li>');
      editor.setSelection({ index: 1 });
    });
    await page.keyboard.press('Tab');
    const html2 = await page.evaluate(() => editor.getHTML());
    expect(html2).toBe('<ul><li>123</li></ul>');
  });

  test('can sink empty list item', async () => {
    await page.evaluate(() => {
      editor.setHTML('<ul><li></li></ul>');
      editor.setSelection({ index: 2 });
    });
    await page.keyboard.press('Tab');
    const html = await page.evaluate(() => editor.getHTML());
    expect(html).toBe('<ul><ul><li><br></li></ul></ul>');
  });

  test('can merge list when sink', async () => {
    // merge before
    await page.evaluate(() => {
      editor.setHTML('<ul><ul><li>123</li></ul><li>321</li></ul>');
      editor.setSelection({ index: 9 });
    });
    await page.keyboard.press('Tab');
    const html = await page.evaluate(() => editor.getHTML());
    expect(html).toBe('<ul><ul><li>123</li><li>321</li></ul></ul>');

    // merge after
    await page.evaluate(() => {
      editor.setHTML('<ul><li>123</li><ul><li>321</li></ul></ul>');
      editor.setSelection({ index: 2 });
    });
    await page.keyboard.press('Tab');
    const html1 = await page.evaluate(() => editor.getHTML());
    expect(html1).toBe('<ul><ul><li>123</li><li>321</li></ul></ul>');

    // merge siblings
    await page.evaluate(() => {
      editor.setHTML('<ul><ul><li>123</li></ul><li>321</li><ul><li>123</li></ul></ul>');
      editor.setSelection({ index: 9 });
    });
    await page.keyboard.press('Tab');
    const html2 = await page.evaluate(() => editor.getHTML());
    expect(html2).toBe('<ul><ul><li>123</li><li>321</li><li>123</li></ul></ul>');
  });

  test('Tab - sink list item can not over maxNestedLevel(set 2)', async () => {
    await page.evaluate(() => {
      editor.setHTML('<ul><ul><li>123</li></ul></ul>');
      editor.setSelection({ index: 3 });
    });

    await page.keyboard.press('Tab');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('<ul><ul><li>123</li></ul></ul>');
  });
});

describe('list - Shift + Tab', () => {
  test('can lift list item at everywhere', async () => {
    // at head
    await page.evaluate(() => {
      editor.setHTML('<ul><ul><li>123</li></ul></ul>');
      editor.setSelection({ index: 3 });
    });

    await page.keyboard.down('ShiftLeft');
    await page.keyboard.press('Tab');
    await page.keyboard.up('ShiftLeft');

    const html = await page.evaluate(() => editor.getHTML());
    expect(html).toBe('<ul><li>123</li></ul>');

    // at inner
    await page.evaluate(() => {
      editor.setHTML('<ul><ul><li>123</li></ul></ul>');
      editor.setSelection({ index: 5 });
    });

    await page.keyboard.down('ShiftLeft');
    await page.keyboard.press('Tab');
    await page.keyboard.up('ShiftLeft');

    const html1 = await page.evaluate(() => editor.getHTML());
    expect(html1).toBe('<ul><li>123</li></ul>');

    // clear
    await page.evaluate(() => {
      editor.setHTML('<ul><li></li></ul>');
      editor.setSelection({ index: 2 });
    });

    await page.keyboard.down('ShiftLeft');
    await page.keyboard.press('Tab');
    await page.keyboard.up('ShiftLeft');

    const html2 = await page.evaluate(() => editor.getHTML());
    expect(html2).toBe('');
  });

  test('can lift empty list item', async () => {
    await page.evaluate(() => {
      editor.setHTML('<ul><ul><li></li></ul></ul>');
      editor.setSelection({ index: 3 });
    });

    await page.keyboard.down('ShiftLeft');
    await page.keyboard.press('Tab');
    await page.keyboard.up('ShiftLeft');

    const html = await page.evaluate(() => editor.getHTML());
    expect(html).toBe('<ul><li><br></li></ul>');
  });

  test('can merge list when lift', async () => {
    // merge before
    await page.evaluate(() => {
      editor.setHTML('<ul><li>123</li><ul><li>321</li></ul></ul>');
      editor.setSelection({ index: 8 });
    });

    await page.keyboard.down('ShiftLeft');
    await page.keyboard.press('Tab');
    await page.keyboard.up('ShiftLeft');

    const html = await page.evaluate(() => editor.getHTML());
    expect(html).toBe('<ul><li>123</li><li>321</li></ul>');

    // merge after
    await page.evaluate(() => {
      editor.setHTML('<ul><ul><li>123</li></ul><li>321</li></ul>');
      editor.setSelection({ index: 3 });
    });

    await page.keyboard.down('ShiftLeft');
    await page.keyboard.press('Tab');
    await page.keyboard.up('ShiftLeft');

    const html1 = await page.evaluate(() => editor.getHTML());
    expect(html1).toBe('<ul><li>123</li><li>321</li></ul>');

    // merge siblings
    await page.evaluate(() => {
      editor.setHTML('<ul><li>123</li><ul><li>321</li></ul><li>123</li></ul>');
      editor.setSelection({ index: 8 });
    });

    await page.keyboard.down('ShiftLeft');
    await page.keyboard.press('Tab');
    await page.keyboard.up('ShiftLeft');

    const html2 = await page.evaluate(() => editor.getHTML());
    expect(html2).toBe('<ul><li>123</li><li>321</li><li>123</li></ul>');
  });
});

describe('list - Enter', () => {
  test('will lift empty list item in head', async () => {
    await page.evaluate(() => {
      editor.setHTML('<ul><li></li></ul>');
      editor.setSelection({ index: 2 });
    });

    await page.keyboard.down('Enter');

    const html = await page.evaluate(() => editor.getHTML());
    expect(html).toBe('');
  });

  test('will split list item when inner', async () => {
    // head
    await page.evaluate(() => {
      editor.setHTML('<ul><li>123</li></ul>');
      editor.setSelection({ index: 2 });
    });

    await page.keyboard.down('Enter');

    const html = await page.evaluate(() => editor.getHTML());
    expect(html).toBe('<ul><li><br></li><li>123</li></ul>');

    // inner
    await page.evaluate(() => {
      editor.setHTML('<ul><li>123</li></ul>');
      editor.setSelection({ index: 3 });
    });

    await page.keyboard.down('Enter');

    const html1 = await page.evaluate(() => editor.getHTML());
    expect(html1).toBe('<ul><li>1</li><li>23</li></ul>');

    // tail
    await page.evaluate(() => {
      editor.setHTML('<ul><li>123</li></ul>');
      editor.setSelection({ index: 5 });
    });

    await page.keyboard.down('Enter');

    const html2 = await page.evaluate(() => editor.getHTML());
    expect(html2).toBe('<ul><li>123</li><li><br></li></ul>');
  });

  test('Enter - split list keep mark', async () => {
    await page.evaluate(() => {
      editor.setHTML('<ul><li><em>123</em></li></ul>');
      editor.setSelection({ index: 3, length: 0 });
    });
    await page.keyboard.press('Enter');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('<ul><li><em>1</em></li><li><em>23</em></li></ul>');
  });
});

describe('list - Backspace', () => {
  test('can remove empty list', async () => {
    await page.evaluate(() => {
      editor.setHTML('<ul><li></li></ul>');
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('');
  });

  test('can remove single list_item', async () => {
    await page.evaluate(() => {
      editor.setHTML('<li></li>');
      editor.setSelection({ index: 1, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    await page.keyboard.press('Backspace');
    expect(html).toEqual('');
  });

  test('can can delete character in list', async () => {
    await page.evaluate(() => {
      editor.setHTML('<ul><li>12</li></ul>');
      editor.setSelection({ index: 4, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('<ul><li>1</li></ul>');
  });

  test('can lift list item only at head', async () => {
    await page.evaluate(() => {
      editor.setHTML('<ul><ul><li>123</li></ul></ul>');
      editor.setSelection({ index: 3, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const html1 = await page.evaluate(() => {
      return editor.getHTML();
    });
    await page.evaluate(() => {
      editor.setHTML('<ul><ul><li>123</li></ul></ul>');
      editor.setSelection({ index: 4, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const html2 = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html1).toEqual('<ul><li>123</li></ul>');
    expect(html2).toEqual('<ul><ul><li>23</li></ul></ul>');
  });

  test('can lift list item to p when only 1 level', async () => {
    await page.evaluate(() => {
      editor.setHTML('<ul><li></li></ul>');
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('');
  });

  test('can keep the order after split list', async () => {
    await page.evaluate(() => {
      editor.setHTML('<ol><li>123</li><li></li><li>123</li></ol>');
      editor.setSelection({ index: 7 });
    });

    await page.keyboard.press('Backspace');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('<ol start="1"><li>123</li></ol><p><br></p><ol start="2"><li>123</li></ol>');
  });

  test('can merge sibling list', async () => {
    await page.keyboard.press('Backspace');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('<ol start="1"><li>123</li><li>123</li></ol>');
  });
});
