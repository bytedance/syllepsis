// @ts-nocheck

describe('CreateEditor', () => {
  it('support content', async () => {
    const html = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html).toBe('<h1>Header</h1>');
  });
  it('autoFocus works', async () => {
    const isFocused = await page.evaluate(() => {
      return editor.isFocused;
    });
    expect(isFocused).toBe(true);
  });

  it('support register prosemirror-plugin', async () => {
    const isRegister = await page.evaluate(() => {
      return Boolean(editor.view.state.config.pluginsByKey.nativePlugin$);
    });
    expect(isRegister).toBe(true);
  });

  it('support eventHandler', async () => {
    await page.evaluate(() => {
      window.__handleClick = 0;
      window.__click = 0;
    });
    await page.click('.ProseMirror');
    const isPass = await page.evaluate(() => {
      return window.__handleClick === 1 && window.__click === 1;
    });

    expect(isPass).toBe(true);
  });

  it('support keymap', async () => {
    await page.evaluate(() => {
      window.__keymap = 0;
    });

    await page.keyboard.down('Shift');
    await page.keyboard.press('b');
    await page.keyboard.up('Shift');

    const isPass = await page.evaluate(() => {
      return window.__keymap === 1;
    });

    expect(isPass).toBe(true);
  });
});
