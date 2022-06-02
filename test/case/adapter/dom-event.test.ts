// @ts-nocheck

describe('keymap & EventHandler', () => {
  test('support keymap set in controller', async () => {
    await page.keyboard.down('ControlLeft');
    await page.keyboard.down('i');
    await page.keyboard.up('ControlLeft');
    await page.keyboard.up('i');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('<p>keymap</p>');
  });
  test('support eventHandler set in controller', async () => {
    await page.evaluate(() => {
      editor.setHTML('');
    });
    const $p = await page.$('.ProseMirror p:first-child');
    const { x, y } = await $p.boundingBox();

    await page.mouse.click(x + 10, y + 10);
    await page.mouse.click(x + 10, y + 10);
    await page.mouse.click(x + 10, y + 10);

    const html = await page.evaluate(() => {
      return editor.getHTML();
    });

    expect(html).toEqual('<p>handleTripleClickOn</p>');
  });
});

describe('Test DOM Event', () => {
  test('click card can select card', async () => {
    await page.evaluate(() => {
      editor.setHTML(`${CARD_HTML}`);
      editor.updateCardAttrs(0, { id: 'card' });
    });
    await page.click('mask #card');
    const selectionName = await page.evaluate(() => {
      return editor.view.state.selection.node.type.name;
    });
    expect(selectionName).toEqual('card');
  });
  test('input will replace card which selected', async () => {
    await page.click('mask #card');
    await page.keyboard.press('KeyA');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });

    expect(html).toEqual('<p>a</p>');
  });
  test('Backspace - can delete empty line before when at head', async () => {
    await page.evaluate(() => {
      editor.setHTML(`
        <p></p>
        <p>a</p>
      `);
      editor.setSelection({ index: 3, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const res = await page.evaluate(() => {
      return {
        selection: editor.getSelection(),
        html: editor.getHTML(),
      };
    });
    expect(res.selection).toMatchObject({ index: 1, length: 0 });
    expect(res.html).toEqual('<p>a</p>');
  });
  test('Backspace - can delete character', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>1</p>');
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('');
  });
  test('Backspace - delete empty paragraph between card and selected card', async () => {
    await page.evaluate(() => {
      editor.setHTML(`${CARD_HTML}<p></p>${CARD_HTML}`);
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const { selection, html } = await page.evaluate(() => {
      return {
        selection: editor.view.state.selection.node.type.name,
        html: editor.getHTML(),
      };
    });
    expect(selection).toEqual('card');
    expect(html).toEqual('<div>Card</div><div>Card</div>');
  });
  test('Backspace - after card can select card', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p></p>${CARD_HTML}`);
      editor.setSelection({ index: 4, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const selection = await page.evaluate(() => {
      return editor.view.state.selection.node.type.name;
    });
    expect(selection).toEqual('card');
  });
  test('Backspace - can delete selected node', async () => {
    await page.keyboard.press('Backspace');
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('');
  });
  test('Backspace - can selected node while in p has content', async () => {
    await page.evaluate(() => {
      editor.setHTML(`${CARD_HTML}<p>123</p>`);
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const selection = await page.evaluate(() => {
      return editor.view.state.selection.node.type.name;
    });
    expect(selection).toEqual('card');
  });
  test('Backspace - jump and join to the last editable node when in head of line', async () => {
    await page.evaluate(() => {
      editor.setHTML(`
        <ul>
          <li>1</li>
          <ul>
            <ul>
              <ul>
                <li>2</li>
              </ul>
            </ul>
          </ul>
        </ul>
        <p>a</p>
      `);
      editor.setSelection({ index: 15, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const res = await page.evaluate(() => {
      return {
        selection: editor.getSelection(),
        html: editor.getHTML(),
      };
    });
    expect(res.selection).toMatchObject({ index: 9, length: 0 });
    expect(res.html).toEqual('<ul><li>1</li><ul><ul><ul><li>2a</li></ul></ul></ul></ul>');
  });

  test('Backspace - reset paragraph at head', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p style="margin-top: 4px;"></p>`);
      editor.setSelection({ index: 1, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const { html, selection } = await page.evaluate(() => {
      return {
        selection: editor.getSelection(),
        html: editor.getHTML(),
      };
    });
    expect(selection).toMatchObject({ index: 1, length: 0 });
    expect(html).toEqual('');
  });

  test('Backspace - delete empty paragraph at head', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p style="margin-top: 4px;"></p><p>123</p>`);
      editor.setSelection({ index: 1, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const { html, selection } = await page.evaluate(() => {
      return {
        selection: editor.getSelection(),
        html: editor.getHTML(),
      };
    });
    expect(selection).toMatchObject({ index: 1, length: 0 });
    expect(html).toEqual('<p>123</p>');
  });

  test('Backspace - do nothing at the first of doc', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p></p>`);
      editor.setSelection({ index: 1, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const { html, selection } = await page.evaluate(() => {
      return {
        selection: editor.getSelection(),
        html: editor.getHTML(),
      };
    });
    expect(selection).toMatchObject({ index: 1, length: 0 });
    expect(html).toEqual('');
  });
  test('Backspace - can delete content with shadow', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<hr><p>123</p>`);
      editor.appendShadow({
        index: 0,
        length: 1,
        attrs: {
          nodeName: 'shadow',
        },
        spec: {
          key: 'shadow',
        },
      });
      editor.setSelection({ index: 0, length: 10 });
    });

    await page.keyboard.press('Backspace');

    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('');
  });

  test('Enter - insert paragraph when selection node', async () => {
    // insert at head
    await page.evaluate(() => {
      editor.setHTML(`${CARD_HTML}`);
      editor.setSelection({ index: 2 });
      editor.focus();
    });
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Enter');
    const res = await page.evaluate(() => editor.getHTML());
    expect(res).toEqual(`<p><br></p><div>Card</div>`);

    // insert at after
    await page.evaluate(() => {
      editor.setHTML(`<p></p>${CARD_HTML}<p>1</p>`);
      editor.setSelection({ index: 4, length: 0 });
    });
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Enter');
    const res2 = await page.evaluate(() => editor.getHTML());
    expect(res2).toEqual(`<p><br></p><div>Card</div><p><br></p><p>1</p>`);
  });

  test('Enter - split block at head', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p></p>');
      editor.setSelection({ index: 0, length: 2 });
    });

    await page.keyboard.press('Enter');
    const res = await page.evaluate(() => editor.getExistNodes('paragraph').length);
    expect(res).toEqual(2);
  });

  test('Enter - clear format when at end', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<h1>1</h1>`);
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('Enter');
    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        format: editor.getFormat(),
      };
    });
    expect(res.html).toEqual(`<h1>1</h1>`);
    expect(res.format).toEqual({});
  });

  test('Enter - clear paragraph align when empty', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p style="text-align: center"></p>`);
      editor.setSelection({ index: 1, length: 0 });
    });
    await page.keyboard.press('Enter');
    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        align: editor.view.state.selection.$from.parent.attrs.align,
      };
    });
    expect(res.html).toEqual(``);
    expect(res.align).toEqual('');
  });

  test('Enter - split paragraph keep format', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p style="text-align: center;">12<em>3</em></p>`);
      editor.setSelection({ index: 4, length: 0 });
    });
    await page.keyboard.press('Enter');
    const res = await page.evaluate(() => {
      return {
        html: editor.getHTML(),
        italic: editor.getFormat().italic,
        align: editor.view.state.selection.$from.parent.attrs.align,
      };
    });
    expect(res.html).toEqual(`<p style="text-align: center;">12<em>3</em></p>`);
    expect(res.italic).toEqual(true);
    expect(res.align).toEqual('center');
  });
  test('Tab - nothing happen when not list', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ index: 1, length: 0 });
    });

    await page.keyboard.press('Tab');
    const html = await page.evaluate(() => editor.getHTML());
    expect(html).toBe('<p>123</p>');
    await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.focus();
      editor.setSelection({ index: 1, length: 0 });
    });

    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    const html1 = await page.evaluate(() => editor.getHTML());
    expect(html1).toBe('<p>123</p>');
  });
  test('Shift + Enter - insert break', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.focus();
      editor.setSelection({ index: 1, length: 3 });
    });
    await page.keyboard.down('Shift');
    await page.keyboard.press('Enter');
    await page.keyboard.up('Shift');

    await page.evaluate(() => editor.setSelection({ index: 1 }));

    await page.keyboard.down('Shift');
    await page.keyboard.press('Enter');
    await page.keyboard.up('Shift');

    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('<p><br>123</p>');
  });

  test('Click insert Paragraph in sibling blocks', async () => {
    const { x, y } = await page.evaluate(() => {
      editor.setHTML(`${CARD_HTML}${CARD_HTML}`);
      const _rect = document.querySelector('div[__syl_tag]').getBoundingClientRect();
      return { x: _rect.x + 20, y: _rect.bottom + 1 };
    });
    await page.mouse.click(x, y);
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toEqual('<div>Card</div><p><br></p><div>Card</div>');
  });
  /**
   * 零宽字符
   */
  test('ArrowLeft pass all zero width char', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p>1&#8203;&#8203;&#8203;</p>`);
      editor.setSelection({ index: 5, length: 0 });
      editor.focus();
    });
    await page.keyboard.press('ArrowLeft');
    const selection = await page.evaluate(() => {
      return editor.getSelection();
    });
    expect(selection).toMatchObject({ index: 1, length: 0 });
  });
  test('ArrowRight pass all zero width char', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p>a&#8203;&#8203;&#8203;</p>`);
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('ArrowRight');
    const selection = await page.evaluate(() => {
      return editor.getSelection();
    });
    expect(selection).toMatchObject({ index: 7, length: 0 });
  });
  test('ArrowRight pass all zero width char', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p>a&#8203;&#8203;&#8203;</p>`);
      editor.setSelection({ index: 2, length: 0 });
    });
    await page.keyboard.press('ArrowRight');
    const selection = await page.evaluate(() => {
      return editor.getSelection();
    });
    expect(selection).toMatchObject({ index: 7, length: 0 });
  });
  test('ArrowLeft pass correct when selected node', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p>1&#8203;${INLINE_CARD_HTML}&#8203;</p>`);
      editor.setSelection({ index: 3, length: 1 });
      editor.focus();
    });
    await page.keyboard.press('ArrowLeft');
    const selection = await page.evaluate(() => {
      return editor.getSelection();
    });
    expect(selection).toMatchObject({ index: 2, length: 0 });
  });
  test('selecting rang or no zero width char works as usual', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p>abcd</p>`);
      editor.setSelection({ index: 1, length: 3 });
    });
    await page.keyboard.press('ArrowRight');
    const selection1 = await page.evaluate(() => {
      return editor.getSelection();
    });
    await page.evaluate(() => {
      editor.setHTML(`<p>abcd</p>`);
      editor.setSelection({ index: 5, length: 0 });
    });
    await page.keyboard.press('ArrowLeft');
    const selection2 = await page.evaluate(() => {
      return editor.getSelection();
    });
    await page.evaluate(() => {
      editor.setHTML(`<p>abcd</p>`);
      editor.setSelection({ index: 5, length: 0 });
    });
    await page.keyboard.press('ArrowRight');
    const selection3 = await page.evaluate(() => {
      return editor.getSelection();
    });
    expect(selection1).toMatchObject({ index: 4, length: 0 });
    expect(selection2).toMatchObject({ index: 4, length: 0 });
    expect(selection3).toMatchObject({ index: 7, length: 0 });
  });
  // backspace删除零宽字符
  test('backspace - delete zero char', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p>1&#8203;${INLINE_CARD_HTML}&#8203;</p>`);
      editor.setSelection({ index: 5, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const { html, selection } = await page.evaluate(() => {
      return {
        selection: editor.getSelection(),
        html: editor.getHTML(),
      };
    });
    expect(selection).toMatchObject({ index: 2, length: 0 });
    expect(html).toEqual('<p>1</p>');
  });

  test('backspace - delete continuous zero char', async () => {
    await page.evaluate(() => {
      editor.setHTML(`<p>1&#8203;${INLINE_CARD_HTML}&#8203;&#8203;&#8203;&#8203;</p>`);
      editor.setSelection({ index: 8, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const { html, selection } = await page.evaluate(() => {
      return {
        selection: editor.getSelection(),
        html: editor.getHTML(),
      };
    });
    expect(selection).toMatchObject({ index: 2, length: 0 });
    expect(html).toEqual('<p>1</p>');
  });

  test('backspace - clearFormat at head', async () => {
    const format1 = await page.evaluate(() => {
      editor.setHTML(`<h1>123</h1>`);
      editor.setSelection({ index: 1, length: 3 });
      return editor.getFormat().header;
    });
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    const format2 = await page.evaluate(() => {
      return editor.getFormat().header;
    });
    await page.keyboard.press('Backspace');
    expect(Boolean(format1)).toEqual(true);
    expect(format2).toEqual(undefined);
  });
});
