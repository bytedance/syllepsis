//@ts-nocheck

describe('Test builtin plugin props config', () => {
  test('recognize ParagraphPlugin support configs', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p style="line-height: 3; margin: 10px 6px 12px 6px;text-align: center;" class="syl">123</p>');
      return editor.getHTML();
    });

    expect(html).toEqual('<p style="text-align: center;margin: 16px 8px 12px;" class="syl">123</p>');

    const html1 = await page.evaluate(() => {
      editor.setHTML('<section test="syl" style="text-indent: 2em;text-align: start;" class="test">123</section>');
      return editor.getHTML();
    });

    expect(html1).toEqual('<p style="text-indent: 2em;" test="syl">123</p>');
  });

  test('recognize ListItemPlugin support configs', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(
        '<ul><li style="line-height: 36px; margin-left: 12px;margin-bottom: 20px;margin-top: 6px">123</li></ul>',
      );
      return editor.getHTML();
    });

    expect(html).toEqual('<ul><li style="line-height: 2.25;margin-left: 16px; margin-right: 16px;">123</li></ul>');

    const html1 = await page.evaluate(() => {
      editor.setHTML('<ul><li><p style="margin-left: 8px;margin-bottom: 10px;margin-top: 8px">123</p></li></ul>');
      return editor.getHTML();
    });

    expect(html1).toEqual('<ul><li style="margin-bottom: 10px;margin-left: 8px; margin-right: 8px;">123</li></ul>');
  });

  test('recognize ImagePlugin support configs', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<img src="test" image="image">`);
      return editor.getHTML();
    });

    expect(html).toContain('image="image"');

    // delete after fail
    await page.evaluate(() => {
      editor.setHTML(`<img src="delete" image="image">`);
      editor.command.image.updateImageUrl({
        state: {},
        getPos: () => 0,
        attrs: { src: 'delete', width: 100, height: 100 },
      });
    });

    await page.waitForTimeout(100);

    const isEmpty = await page.evaluate(() => {
      return editor.getHTML() === '';
    });

    expect(isEmpty).toEqual(true);
  });

  test('recognize VideoPlugin support configs', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<video src="test" video="video">`);
      return editor.getHTML();
    });

    expect(html).toContain('video="video"');
  });

  test('recognize AudioPlugin support configs', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<audio src="test" audio="audio">`);
      return editor.getHTML();
    });

    expect(html).toContain('audio="audio"');
  });

  test('recognize FontSizePlugin support configs', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p>1<span style="font-size: 24px;">2</span>3</p>`);
      return editor.getHTML();
    });

    expect(html).toEqual('<p>1<span style="font-size: 24px;">2</span>3</p>');

    // only 24px
    const html1 = await page.evaluate(() => {
      editor.setHTML(`<p>1<span style="font-size: 36px;">2</span>3</p>`);
      return editor.getHTML();
    });

    expect(html1).toEqual('<p>1<span style="font-size: 24px;">2</span>3</p>');
  });
});
