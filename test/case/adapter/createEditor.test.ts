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
});
