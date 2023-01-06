// @ts-nocheck
const CardView = (props: IProps = {}) => {
  if (props.id) {
    return `<div id='${props.id}'>Card</div>`;
  }
  return '<div>Card</div>';
};

describe('API.getHTML test', () => {
  it('get empty when set empty', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('');
      return editor.getHTML();
    });
    expect(html).toBe('');
  });
  it('get empty when no child in templ', async () => {
    const html = await page.evaluate(() => {
      let a = '';
      const listenChange = () => {
        a = editor.getHTML();
      };
      editor.on('state-change', listenChange);
      editor.setHTML(`<p>${INLINE_CARD_HTML}</p>`);
      editor.off('state-change', listenChange);
      return a;
    });
    expect(html).toBe('');
  });

  it('remove tag that has attribute ignoretag', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>1<span class="ignoreTag">23</span>456</p>');
      return editor.getHTML();
    });
    expect(html).toBe('<p>123456</p>');
  });

  it('remove tag that has attribute ignoretag', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>1<span class="ignoreTag">23</span>456</p>');
      return editor.getHTML();
    });
    expect(html).toBe('<p>123456</p>');
  });

  it('keep br before a', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p><br>${INLINE_CARD_HTML}</p>`);
      return editor.getHTML();
    });
    expect(html).toBe('<p><br><a>inline_card</a></p>');
  });

  it('keep br after a', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p>${INLINE_CARD_HTML}<br>123</p>`);
      return editor.getHTML();
    });
    expect(html).toBe('<p><a>inline_card</a><br>123</p>');
  });

  it('not keep lastChild br after a', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p>${INLINE_CARD_HTML}<br></p>`);
      return editor.getHTML();
    });
    expect(html).toBe('<p><a>inline_card</a></p>');

    const html1 = await page.evaluate(() => {
      editor.setHTML(`<p>${INLINE_CARD_HTML}1<br>2</p>`);
      return editor.getHTML();
    });
    expect(html1).toBe('<p><a>inline_card</a>1<br>2</p>');
  });

  it('ignoretag in list', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<ul><li>123<span class="ignoreTag">456</span></li></ul>');
      return editor.getHTML();
    });
    expect(html).toBe('<ul><li>123456</li></ul>');
  });

  it('mix ignoreel and ignoretag', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>123</p><div class="ignore">abc</div><p>456</p><p>1<span class="ignoreTag">23</span>456</p>');
      return editor.getHTML();
    });
    expect(html).toBe('<p>123</p><p>456</p><p>123456</p>');
  });

  it('it can get card templ', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p>{-- Card --}</p>`);
      return editor.getHTML();
    });
    expect(html).toBe(CardView());
  });

  it('it can get trigger switch-layer', async () => {
    const res = await page.evaluate(() => {
      let type = 'template';
      const listen = _type => {
        type = _type;
      };
      editor.setHTML(`<p>{-- Card --}</p>`);
      editor.on('switch-layer', listen);
      const html = editor.getHTML({ layerType: 'test' });
      editor.off('switch-layer', listen);
      return {
        html,
        type,
      };
    });
    expect(res.html).toBe(CardView());
    expect(res.type).toBe('test');
  });

  it('keep continuous empty paragraph when setHTML mergeEmpty false', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p><br></p><p><br></p><p><br></p><p>123</p>`, {
        mergeEmpty: false,
      });
      return editor.getHTML();
    });
    expect(html).toBe('<p><br></p><p><br></p><p><br></p><p>123</p>');

    const html1 = await page.evaluate(() => {
      const dom = document.createElement('div');
      dom.innerHTML = `<p><br></p><p><br></p><p><br></p><p>123</p>`;
      const { view, domParser } = editor;
      const newSlice = domParser.parseSlice(dom);
      newSlice.openStart = 0;
      newSlice.openEnd = 0;
      view.dispatch(view.state.tr.replace(0, view.state.doc.content.size, newSlice));
      return editor.getHTML();
    });

    expect(html1).toBe('<p><br></p><p><br></p><p><br></p><p>123</p>');
  });

  it('merge continuous empty paragraph when getHTML mergeEmpty true', async () => {
    const html = await page.evaluate(() => {
      return editor.getHTML({ mergeEmpty: true });
    });
    expect(html).toBe('<p><br></p><p>123</p>');
  });

  it('keep continuous br in empty paragraph when setHTML mergeEmpty false', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p><br><br><br></p><p>123</p>`, {
        mergeEmpty: false,
      });
      return editor.getHTML();
    });
    expect(html).toBe('<p><br><br><br></p><p>123</p>');
  });

  it('merge continuous br in empty paragraph when getHTML mergeEmpty true', async () => {
    const html = await page.evaluate(() => {
      return editor.getHTML({ mergeEmpty: true });
    });
    expect(html).toBe('<p><br></p><p>123</p>');
  });

  it('keep continuous br in paragraph has content when setHTML mergeEmpty false', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p>123<br><br><br></p>`, {
        mergeEmpty: false,
      });
      return editor.getHTML();
    });
    expect(html).toBe('<p>123<br><br><br></p>');
  });

  it('merge continuous br in paragraph has content when getHTML mergeEmpty true', async () => {
    const html = await page.evaluate(() => {
      return editor.getHTML({ mergeEmpty: true });
    });
    expect(html).toBe('<p>123<br></p>');
  });

  it('keep continuous br in continuous empty paragraph when setHTML mergeEmpty false', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p><br><br><br></p><p><br><br><br></p><p><br><br><br></p>`, {
        mergeEmpty: false,
      });
      return editor.getHTML();
    });
    expect(html).toBe('<p><br><br><br></p><p><br><br><br></p><p><br><br><br></p>');
  });

  it('merge continuous br in continuous empty paragraph when getHTML mergeEmpty true', async () => {
    const html = await page.evaluate(() => {
      return editor.getHTML({
        mergeEmpty: true,
      });
    });
    expect(html).toBe('');
  });

  it('keep whiteSpace when setHTML with keepWhiteSpace true', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>1   2   3</p>', {
        keepWhiteSpace: true,
      });
      return editor.getHTML();
    });
    expect(html).toBe('<p>1   2   3</p>');
    const html1 = await page.evaluate(() => {
      editor.setHTML('<p>1   2   3</p>', {
        keepWhiteSpace: false,
      });
      return editor.getHTML();
    });
    expect(html1).toBe('<p>1 2 3</p>');

    const nodeText = await page.evaluate(() => {
      const dom = document.createElement('p');
      dom.innerText = `1   2   3`;
      const slice = editor.domParser.parseSlice(dom, {
        preserveWhitespace: true,
      });
      return slice.content.content[0].text;
    });
    expect(nodeText).toBe(`1   2   3`);
  });

  it('keep newline when setHTML & paste with keepWhiteSpace full', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(
        `<p>1   2
      3</p>`,
        {
          keepWhiteSpace: 'full',
        },
      );
      return editor.getHTML();
    });
    expect(html).toBe(`<p>1   2
      3</p>`);

    const nodeName = await page.evaluate(() => {
      const dom = document.createElement('p');
      dom.innerText = `1   2
        3`;
      const slice = editor.domParser.parseSlice(dom, {
        preserveWhitespace: 'full',
      });
      return slice.content.content[1].type.name;
    });
    expect(nodeName).toBe('break');
  });

  it('can recognized inlineCard textMatcher when inputOnly is false', async () => {
    await page.evaluate(() => {
      editor.setHTML('<p>1{ inline_card } 2</p>');
    });
    const html1 = await page.evaluate(() => {
      return editor.getHTML();
    });
    await page.evaluate(() => {
      editor.setHTML('<p>{ inline_card } 2</p>');
    });
    const html2 = await page.evaluate(() => {
      return editor.getHTML();
    });
    await page.evaluate(() => {
      editor.setHTML('<ul><li>{ inline_card } 2</li></ul>');
    });
    const html3 = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(html1).toBe('<p>1<a>inline_card</a>2</p>');
    expect(html2).toBe('<p><a>inline_card</a>2</p>');
    expect(html3).toBe('<ul><li><a>inline_card</a>2</li></ul>');
  });

  it('right content size after replace br node', async () => {
    const size = await page.evaluate(() => {
      editor.setHTML('<ul><li><br><br></li><li><br></li><ul><li><br></li></ul></ul><p>123</p><hr><p></p>', {
        mergeEmpty: false,
      });
      return [editor.view.state.doc.content.size, editor.view.state.doc.content.content[0].content.size];
    });
    expect(size).toEqual([19, 9]);
  });
});
