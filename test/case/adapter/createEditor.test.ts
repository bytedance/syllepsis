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

  it('support scrollThreshold and scrollMargin', async () => {
    const isPass = await page.evaluate(() => {
      return editor.view.someProp('scrollThreshold') === 2 && editor.view.someProp('scrollMargin') === 2;
    });

    expect(isPass).toBe(true);
  });

  it('support appendTransaction', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('');
      const { state, dispatch } = editor.view;
      const tr = state.tr;
      tr.insertText('syl-append');
      dispatch(tr);
      return editor.getHTML();
    });

    expect(res).toBe('<p>syl-appendsyl-append</p>');
  });

  it('support filterTransaction', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('');
      const { state, dispatch } = editor.view;
      const tr = state.tr;
      tr.insertText('test');
      tr.setMeta('syl-filter', 'true');
      dispatch(tr);
      return editor.getHTML();
    });

    expect(res).toBe('');
  });

  it('support update transaction config', async () => {
    const res = await page.evaluate(() => {
      editor.configurator.update({
        appendTransaction: null,
        filterTransaction: null,
      });
      editor.setHTML('');
      const { state, dispatch } = editor.view;
      const tr = state.tr;
      tr.insertText('syl-append');
      tr.setMeta('syl-filter', 'true');
      dispatch(tr);
      return editor.getHTML();
    });

    expect(res).toBe('<p>syl-append</p>');
  });
});
