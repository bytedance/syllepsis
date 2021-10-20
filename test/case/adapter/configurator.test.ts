// @ts-nocheck

describe('configurator test', () => {
  test('can update configuration config', async () => {
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

  test('placeholder can justify align', async () => {
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

  test('can registerController', async () => {
    await page.keyboard.down('Shift');
    await page.keyboard.press('o');
    await page.keyboard.up('Shift');
    const result = await page.evaluate(
      () =>
        window.__testControllerKeymap && window.__testControllerEventHandler && editor.command.test_controller.test(),
    );

    expect(result).toBe(true);
  });

  test('can unregisterController', async () => {
    await page.evaluate(() => {
      window.__testControllerKeymap = false;
      editor.configurator.unregisterController('test_controller');
    });
    await page.keyboard.down('Shift');
    await page.keyboard.press('o');
    await page.keyboard.up('Shift');
    const result = await page.evaluate(() => window.__testControllerKeymap);

    expect(result).toBe(false);
  });

  test('support asynchronous loading controller', async () => {
    const result = await page.evaluate(() => editor.command.async_controller.test());
    expect(result).toBe(true);
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

  test('can replace event handler', async () => {
    await page.evaluate(() => {
      window.__handleClick = 0;
      window.__click = 0;
      editor.configurator.update({
        eventHandler: {
          handleClick: () => {
            window.__handleClick--;
          },
          handleDOMEvents: {
            click: () => {
              window.__click--;
            },
          },
        },
      });
    });

    await page.click('.ProseMirror');

    const isPass = await page.evaluate(() => window.__handleClick === -1 && window.__click === -1);

    expect(isPass).toBe(true);
  });
  test('can register event handler', async () => {
    await page.click('body');
    await page.evaluate(() => {
      window.handleClick = 0;
      window.click = 0;
      editor.configurator.registerEventHandler({
        handleClick: () => {
          window.handleClick++;
        },
        handleDOMEvents: {
          click: () => {
            window.click++;
          },
        },
      });
    });

    await page.click('.ProseMirror');

    const isPass = await page.evaluate(() => window.handleClick === 1 && window.click === 1);

    expect(isPass).toBe(true);
  });

  test('can replace keymap', async () => {
    await page.evaluate(() => {
      window.__keymap = 0;
      editor.configurator.update({
        keymap: {
          'Shift-b': () => {
            window.__keymap--;
          },
        },
      });
    });

    await page.keyboard.down('Shift');
    await page.keyboard.press('b');
    await page.keyboard.up('Shift');

    const isPass = await page.evaluate(() => window.__keymap === -1);

    expect(isPass).toBe(true);
  });

  test('can register keymap', async () => {
    await page.evaluate(() => {
      window.keymapR = 0;
      editor.configurator.registerKeymap({
        'Shift-r': () => {
          keymapR++;
        },
      });
    });
    await page.keyboard.down('Shift');
    await page.keyboard.press('r');
    await page.keyboard.up('Shift');

    const isPass = await page.evaluate(() => window.keymapR === 1);

    expect(isPass).toBe(true);
  });

  test('support update other plugin props', async () => {
    const isPass = await page.evaluate(() => {
      editor.configurator.setCustomConfiguration({
        scrollThreshold: 10,
        scrollMargin: 20,
      });

      return editor.view.someProp('scrollThreshold') === 10 && editor.view.someProp('scrollMargin') === 20;
    });

    expect(isPass).toBe(true);
  });
});
