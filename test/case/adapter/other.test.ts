// @ts-nocheck

describe('placeholder test', () => {
  it('can update configuration config', async () => {
    const res = await page.evaluate(() => {
      editor.configurator.update({
        placeholder: 'new-placeholder',
        spellCheck: true,
        keepLastLine: false,
        onError: () => console.error('catch error'),
      });
      editor.configurator.update({});

      editor.setHTML('');

      return {
        placeholder: editor.view.dom.querySelector('.syl-placeholder').innerText,
        spellCheck: editor.view.dom.getAttribute('spellcheck'),
      };
    });
    expect(res).toEqual({
      placeholder: 'new-placeholder',
      spellCheck: 'true',
    });
  });

  it('placeholder can justify align', async () => {
    const styleCenter = await page.evaluate(() => {
      editor.setHTML('');
      editor.updateCardAttrs(0, { align: 'center' });
      const style = document.querySelector('.syl-placeholder').getAttribute('style');
      return style;
    });
    const styleRight = await page.evaluate(() => {
      editor.updateCardAttrs(0, { align: 'right' });
      return document.querySelector('.syl-placeholder').getAttribute('style');
    });
    expect(/transform/.test(styleCenter)).toBe(true);
    expect(/right/.test(styleRight)).toBe(true);
  });
});

describe('Controller config test', () => {
  test('can define transformGetHTML', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>123transformGetHTML</p>');
      return editor.getHTML();
    });

    expect(html).toEqual('<p>123</p>');
  });
  test('can define appendTransaction', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('appendTransaction', { silent: false });
      return editor.getHTML();
    });

    expect(html).toEqual('<p>appendedTransaction</p>');
  });
});

describe('Modules test', () => {
  test('can update moduleMap', async () => {
    const text = await page.evaluate(() => {
      return document.querySelector('.module-desc')?.innerHTML;
    });

    expect(text).toEqual('init');

    const text1 = await page.evaluate(() => {
      editor.configurator.update({ module: { desc: { option: { text: 'test' } } } });
      return document.querySelector('.module-desc')?.innerHTML;
    });
    expect(text1).toEqual('test');
  });
});

describe('MountEvent test', () => {
  test('can update event listener', async () => {
    const isPass = await page.evaluate(() => {
      let focusCount = 0;
      let blurCount = 0;
      editor.blur();
      const onBlur = () => blurCount++;
      const onFocus = () => focusCount++;

      editor.configurator.update({ onFocus, onBlur });

      editor.focus();
      editor.blur();

      const firstPass = focusCount === blurCount && focusCount === 1;

      const onFocusNew = () => focusCount--;
      const onBlurNew = () => blurCount--;
      editor.configurator.update({ onFocus: onFocusNew, onBlur: onBlurNew });
      editor.focus();
      editor.blur();

      const secondPass = focusCount === blurCount && focusCount === 0;
      editor.focus();

      return firstPass && secondPass;
    });

    expect(isPass).toEqual(true);
  });
});

describe('final test', () => {
  it('it can uninstall', async () => {
    const res = await page.evaluate(() => {
      editor.uninstall();
      try {
        editor.configurator.setLocale({ en: { test: 'test' } });
        editor.configurator.getLocaleValue('en');
        editor.setContent();
        editor.insert();
        editor.replace();
        editor.update();
        editor.delete();
        editor.view.dispatch();
      } catch (err) {}
      return editor.isDestroy;
    });
    expect(res).toEqual(true);
  });
});
