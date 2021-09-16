// @ts-nocheck

describe('Extra test', () => {
  test('not invoke event on html', async () => {
    const val = await page.evaluate(() => {
      return new Promise(resolve => {
        let v = 0;
        Object.defineProperty(window, 'variable', {
          get() {
            return v;
          },
          set(val) {
            v = val;
            resolve(v);
            return v;
          },
        });
        editor.setHTML('<img src="gg" onerror="window.variable=2" />');
        setTimeout(() => resolve(window.variable), 4500);
      });
    });

    expect(val).toEqual(0);
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
