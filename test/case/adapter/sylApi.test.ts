// @ts-nocheck
const createEditor = require('../../helpers/createEditor');

const INLINE_CARD_TEXT = 'inline_card';
const InlineCardView = `<a>${INLINE_CARD_TEXT}</a>`;

const CardView = (props: IProps = {}) => {
  if (props.id) {
    return `<div id="${props.id}">Card</div>`;
  }
  return '<div>Card</div>';
};

describe('single API test', () => {
  test('it can disable editor', async () => {
    const editable = await page.evaluate(() => {
      editor.setHTML();
      editor.disable();
      editor.focus();
      return editor.editable;
    });
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('KeyA');

    const html = await page.evaluate(() => editor.getHTML());

    expect(editable).toBe(false);
    expect(html).toBe('');
  });

  test('it can enable editor', async () => {
    const editable = await page.evaluate(() => {
      editor.enable();
      return editor.view.editable;
    });
    expect(editable).toBe(true);
  });

  test('it can focus', async () => {
    const focused = await page.evaluate(() => {
      editor.focus();
      return editor.isFocused;
    });
    expect(focused).toBe(true);
  });

  test('it can blur', async () => {
    const focused = await page.evaluate(() => {
      editor.focus();
      editor.blur();
      return editor.isFocused;
    });
    expect(focused).toBe(false);
  });

  test('it can use length', async () => {
    const editorLen = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      return editor.length;
    });
    expect(editorLen).toBe(5 + 2);
  });

  test('it can getContent', async () => {
    const content = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      return editor.getContent();
    });
    expect(content.doc.content.length === 2 && content.doc.content[0].content[0].text === '123').toBe(true);
  });

  test('get/setSection recognize anchor an head', async () => {
    const selection = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ anchor: 0, head: 2 });
      return editor.getSelection();
    });
    expect(selection).toMatchObject({ index: 0, length: 2, anchor: 0, head: 2 });

    const selection1 = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ anchor: 2, head: 0 });
      return editor.getSelection();
    });
    expect(selection1).toMatchObject({ index: 0, length: 2, anchor: 2, head: 0 });

    const selection2 = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ anchor: 2 });
      return editor.getSelection();
    });
    expect(selection2).toMatchObject({ index: 2, length: 0, anchor: 2, head: 2 });

    const selection3 = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ head: 2 });
      return editor.getSelection();
    });
    expect(selection3).toMatchObject({ index: 2, length: 0, anchor: 2, head: 2 });
  });

  test('it can fix selection out of range', async () => {
    const selection = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ index: 0, length: 10 });
      return editor.getSelection();
    });
    expect(selection).toMatchObject({ index: 0, length: 7 });

    const selection1 = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ anchor: 0, head: 10 });
      return editor.getSelection();
    });
    expect(selection1).toMatchObject({ anchor: 0, head: 7 });
  });

  test('setSection must provide parameters', async () => {
    const count = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      let errCnt = 0;
      try {
        editor.setSelection({});
      } catch (err) {
        errCnt++;
      }
      return errCnt;
    });
    expect(count).toEqual(1);
  });

  test('can setSelection to select node', async () => {
    const nodeName = await page.evaluate(() => {
      editor.setHTML(CARD_HTML);
      editor.setSelection({ index: 0, selectNode: true });
      return editor.getSelection().node.type.name;
    });
    expect(nodeName).toBe('card');
  });

  test('it can setContent', async () => {
    const html = await page.evaluate(() => {
      const json = {
        doc: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { align: 'left' },
              content: [{ type: 'text', text: '123' }],
            },
            { type: 'paragraph', attrs: { align: '' } },
          ],
        },
        selection: { type: 'text', anchor: 4, head: 4 },
      };
      editor.setContent(json);
      return editor.getHTML();
    });
    expect(html).toBe('<p>123</p>');
  });

  test('it can judge is empty', async () => {
    const isEmpty = await page.evaluate(() => {
      editor.setHTML(`<p></p>`);
      return editor.isEmpty;
    });
    expect(isEmpty).toBe(true);
  });

  test('it can judge is checkHasContentBefore when has no content before', async () => {
    const hasContentBefore = await page.evaluate(() => {
      editor.setHTML(`<p></p><p></p><p></p>`);
      return editor.checkHasContentBefore(0);
    });
    expect(hasContentBefore).toBe(false);
  });

  test('it can judge is checkHasContentBefore when has content before', async () => {
    const hasContentBefore = await page.evaluate(() => {
      editor.setHTML(`<p></p><p>123</p>`);
      return editor.checkHasContentBefore(4);
    });
    expect(hasContentBefore).toBe(true);
  });

  test('it can use CardCommand', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML(CARD_HTML);
      return editor.command.card.test();
    });
    expect(res).toBe('card');
  });

  test('it can addCommand', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.addCommand('test', { say: () => 'say' });
      return editor.command.test.say();
    });
    expect(res).toBe('say');
  });

  test('it can not addCommand without name', async () => {
    const res = await page.evaluate(() => {
      const length = Object.keys(editor.command).length;
      editor.addCommand('', { say: () => 'say' });
      return length === Object.keys(editor.command).length;
    });
    expect(res).toBe(true);
  });

  test('it can getCursorNode', async () => {
    const curNodeName = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      const curNode = editor.getCursorNode();
      return curNode.node.type.name;
    });
    expect(curNodeName).toBe('paragraph');
  });

  test('it can getCursorNode in range', async () => {
    const nodeName = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ index: 1, length: 2 });
      const curNode = editor.getCursorNode();
      return curNode.node.type.name;
    });
    expect(nodeName).toBe('paragraph');
  });

  test('it can not getCursorNode cross node', async () => {
    const nodeName = await page.evaluate(() => {
      editor.setHTML('<p>123</p><p>123</p>');
      editor.setSelection({ index: 1, length: 5 });
      return editor.getCursorNode();
    });
    expect(nodeName).toBe(false);
  });

  test('it can getExistedNode get basic type', async () => {
    const nodeLen = await page.evaluate(() => {
      editor.setHTML('<p>123</p><p>312</p>');
      return editor.getExistNodes('paragraph').length;
    });
    expect(nodeLen).toBe(3);
  });

  test('it can getExistedNode get Card', async () => {
    const nodeLen = await page.evaluate(() => {
      editor.setHTML(`${CARD_HTML}${CARD_HTML}`);
      return editor.getExistNodes('card').length;
    });
    expect(nodeLen).toBe(2);
  });

  test('it can getExistedMarks', async () => {
    const markLen = await page.evaluate(() => {
      editor.setHTML('<p><strong>1</strong>23</p><p><strong>312</strong></p>');
      editor.getExistMarks('none');
      return editor.getExistMarks('bold').length;
    });
    expect(markLen).toBe(2);
  });

  test('it can recognize different Mark when in same parent', async () => {
    const markLen = await page.evaluate(() => {
      editor.setHTML('<p><strong>1</strong>23<strong>312</strong></p>');
      return editor.getExistMarks('bold').length;
    });
    expect(markLen).toBe(2);
  });

  test('getExistMarks can return correct TextNode when contain different mark', async () => {
    const markText = await page.evaluate(() => {
      editor.setHTML('<p><strong>1<u>23</u>45<u>678</u>9</strong></p>');
      return editor.getExistMarks('bold')[0].node.text;
    });
    expect(markText).toBe('123456789');
  });

  test('getExistMarks can return correct TextNode when without text', async () => {
    const markCount = await page.evaluate(() => {
      editor.setHTML(`<p><strong>1${INLINE_CARD_HTML}2${INLINE_CARD_HTML}3</strong></p>`);
      return editor.getExistMarks('bold').length;
    });
    expect(markCount).toBe(1);
  });

  test('it can recognize same Mark when in different text Node', async () => {
    const markLen = await page.evaluate(() => {
      editor.setHTML('<p><strong>123<em>abc</em>31<u>2</u></strong></p>');
      return editor.getExistMarks('bold').length;
    });
    expect(markLen).toBe(1);
  });

  test('it can getText', async () => {
    const text = await page.evaluate(() => {
      editor.setHTML(`<p><strong>1</strong>23</p><p><strong>312</strong>${INLINE_CARD_HTML}</p>`);
      return editor.getText();
    });
    expect(text).toBe('123312');
  });

  test('it can getText with inline Card', async () => {
    const text = await page.evaluate(() => {
      editor.setHTML(`<p><strong>1</strong>23</p><p><strong>312</strong>${INLINE_CARD_TEXT_HTML}</p><p>321</p>`);
      return editor.getText();
    });
    expect(text).toBe('123312inline_card_text321');
  });

  test('it can getText with range', async () => {
    const text = await page.evaluate(() => {
      editor.setHTML(`<p>1${INLINE_CARD_HTML}1</p>`);
      return editor.getText({ index: 1, length: 3 });
    });
    expect(text).toBe('11');
  });

  test('it can getText with range when in separate node', async () => {
    const text = await page.evaluate(() => {
      editor.setHTML(`<p>1234567890098765432<strong>112345</strong>678900987654321</p>`);
      return editor.getText({ index: 20, length: 6 });
    });
    expect(text).toBe('112345');
  });

  test('it can getFormat', async () => {
    const format = await page.evaluate(() => {
      editor.setHTML(`<p><strong>1</strong>23</p>`);
      editor.setSelection({ index: 1, length: 0 });
      return editor.getFormat().bold;
    });
    expect(format).toBe(true);
  });

  test('it can getFormat with range', async () => {
    const format = await page.evaluate(() => {
      editor.setHTML(`<p><strong>1</strong>23</p>`);
      editor.setSelection({ index: 4, length: 0 });
      return editor.getFormat({ index: 1, length: 0 }).bold;
    });
    expect(format).toBe(true);
  });

  test('it can get nested Format', async () => {
    const format = await page.evaluate(() => {
      editor.setHTML(`<p><u><strong>123</strong></u></p>`);
      editor.setSelection({ index: 1, length: 0 });
      const activeFormat = editor.getFormat();
      return activeFormat.bold && activeFormat.underline;
    });
    expect(format).toBe(true);
  });

  test('it can get content Format', async () => {
    const format = await page.evaluate(() => {
      editor.setHTML(`<p><u><strong>123</strong></u></p>`);
      editor.setSelection({ index: 1, length: 3 });
      const activeFormat = editor.getFormat();
      return activeFormat.bold && activeFormat.underline;
    });
    expect(format).toBe(true);
  });

  test('it can get Format in nested node', async () => {
    const format = await page.evaluate(() => {
      editor.setHTML(`<ul><li><u><strong>123</strong></u></li></ul>`);
      editor.setSelection({ index: 3, length: 0 });
      const activeFormat = editor.getFormat();
      return activeFormat.bold && activeFormat.underline;
    });
    expect(format).toBe(true);
  });

  test('it can get right Format when selected all', async () => {
    const format = await page.evaluate(() => {
      editor.setHTML(`
        <p><u><strong>123</strong></u></p>
        <ul><li></li></ul>
        <blockquote><p></p></blockquote>
        <h1></h1>
      `);
      editor.setSelection({ index: 0, length: 30 });
      return editor.getFormat();
    });
    expect(format).toEqual({
      underline: true,
      bold: true,
      block_quote: {
        class: '',
      },
      bullet_list: {},
      header: {
        class: '',
        level: 1,
      },
    });
  });

  test('clearFormat can clear simple mark', async () => {
    const format = await page.evaluate(() => {
      editor.setHTML(`<p><u><strong>123</strong></u></p>`);
      editor.setSelection({ index: 0, length: 5 });
      editor.clearFormat();
      const activeFormat = editor.getFormat();
      return Boolean(activeFormat.bold || activeFormat.underline);
    });
    expect(format).toBe(false);
  });

  test('it can not undo when setHTML', async () => {
    const unDoable = await page.evaluate(() => {
      editor.setHTML('');
      return editor.undo();
    });
    expect(unDoable).toBe(false);
  });

  test('it can not redo when setHTML', async () => {
    const reDoable = await page.evaluate(() => {
      editor.setHTML('');
      return editor.redo();
    });
    expect(reDoable).toBe(false);
  });

  test('it can undo when setHTML with silent: false', async () => {
    const undo = await page.evaluate(() => {
      editor.setHTML('');
      editor.setHTML('<p>123</p>', { silent: false });
      return editor.undoable;
    });
    expect(undo).toBe(true);
  });

  test('undo can revert change', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('');
      editor.setHTML('<p>123</p>', { silent: false });
      editor.undo(true);
      return editor.getHTML();
    });
    expect(html).toBe('');
  });

  test('it can redo after undo', async () => {
    const redo = await page.evaluate(() => {
      editor.setHTML('');
      editor.setHTML('<p>123</p>', { silent: false });
      editor.undo(true);
      return editor.redoable;
    });
    expect(redo).toBe(true);
  });

  test('it can redo revert change', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('');
      editor.setHTML('<p>123</p>', { silent: false });
      editor.undo(true);
      editor.redo(true);
      return editor.getHTML();
    });
    expect(html).toBe('<p>123</p>');
  });

  test('it can listenBlur', async () => {
    const res = await page.evaluate(() => {
      let a = 1;
      const listen = () => a++;
      editor.on('blur', listen);
      editor.focus();
      editor.blur();
      editor.off('blur', listen);
      return a;
    });

    expect(res).toBe(2);
  });

  test('it can on and off Event', async () => {
    const res = await page.evaluate(() => {
      let a = 1;
      const listen = () => a++;
      editor.on('state-change', listen);
      editor.setSelection({ index: 1, length: 0 });
      editor.off('state-change', listen);
      return a;
    });

    expect(res).toBe(2);
  });
  test('it can travel doc', async () => {
    const res = await page.evaluate(() => {
      let nodeName = '';
      editor.setHTML('<p>123</p>');
      editor.setSelection({ index: 1, length: 3 });
      editor.nodesBetween(node => {
        nodeName = node.type.name;
        return false;
      });
      return nodeName;
    });

    expect(res).toBe('paragraph');
  });
  test('it can travel doc with range', async () => {
    const res = await page.evaluate(() => {
      let nodeName = '';
      editor.setHTML('<p>123</p><li>13</li>');
      editor.setSelection({ index: 1, length: 10 });
      editor.nodesBetween(
        node => {
          nodeName = node.type.name;
          return false;
        },
        { index: 0, length: 3 },
      );
      return nodeName;
    });

    expect(res).toBe('paragraph');
  });
});

describe('insert API test', () => {
  test('can insert single Node', async () => {
    const html1 = await page.evaluate(() => {
      editor.setHTML('');
      editor.insert('card');
      return editor.getHTML();
    });

    expect(html1).toEqual(CardView());

    const html2 = await page.evaluate(() => {
      editor.setHTML('');
      editor.insert(
        {
          type: 'header',
          content: [
            {
              type: 'text',
              content: 'header',
              marks: ['strike', { type: 'underline' }],
            },
            'inline_card',
          ],
        },
        0,
      );
      return editor.getHTML();
    });
    expect(html2).toEqual(`<h1><u><s>header</s></u>${InlineCardView}</h1>`);
  });
  test('can insert nested Node', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('');
      editor.insert({
        type: 'block_quote',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                content: '123',
                marks: ['none'],
              },
            ],
          },
          {
            type: 'none',
          },
        ],
      });
      return editor.getHTML();
    });
    expect(html).toEqual('<blockquote><p>123</p></blockquote>');
  });

  test('can insert into nested Node', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<blockquote><p>123</p></blockquote>');
      editor.insert('card', 6);
      return editor.getHTML();
    });
    expect(html).toBe(`<blockquote><p>123</p>${CardView()}</blockquote>`);
  });

  test('insert support addToHistory config', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.insert({ type: 'text', content: 'abc' }, { index: 4, addToHistory: false });
      editor.undo();
      return editor.getHTML();
    });
    expect(html).toBe(`<p>123abc</p>`);
  });

  test('it will after nested Node when can not contain', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<blockquote><p>123</p></blockquote>');
      editor.insert({ type: 'list_item', content: [{ type: 'text', content: '123' }] }, 2);
      return editor.getHTML();
    });
    expect(html).toBe(`<blockquote><p>123</p></blockquote><li>123</li>`);
  });

  test('insert can control the deleteSelection at same pos or not', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>123321</p>');
      editor.setSelection({ index: 1, length: 4 });
      editor.insert('inline_card');
      return editor.getHTML();
    });
    expect(html).toBe(`<p>${InlineCardView}21</p>`);
    const html1 = await page.evaluate(() => {
      editor.undo();
      editor.insert('inline_card', { deleteSelection: false });
      return editor.getHTML();
    });
    expect(html1).toBe(`<p>${InlineCardView}123321</p>`);
  });

  test('can insert at tail node with doc type node', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>1</p>');
      editor.setSelection({ index: 4 });
      editor.insert({ type: 'doc', content: ['card', 'card'] });
      return editor.getHTML();
    });
    expect(html).toBe(`<p>1</p>${CardView()}${CardView()}`);
  });

  test('it can insertText', async () => {
    const text = await page.evaluate(() => {
      editor.setHTML('');
      editor.insertText('123312');
      return editor.getText();
    });
    expect(text).toBe('123312');
  });

  test('it can insertText with format', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('');
      editor.insertText('123312', { bold: true, underline: {} }, { scrollIntoView: false });
      return editor.getHTML();
    });
    expect(html).toBe('<p><u><strong>123312</strong></u></p>');
  });

  test('it can insertText node format', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('');
      editor.insertText('123312', { header: true, laugh: false }, 0);
      return editor.getHTML();
    });
    expect(html).toBe('<h1>123312</h1>');
  });
  test('it can insertCard', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('');
      editor.insertCard('ss', {});
      editor.insertCard('card', undefined, 0);
      return editor.getHTML({});
    });
    expect(html).toBe(CardView());
  });
  test('it select Card after insert with card', async () => {
    await page.evaluate(() => {
      editor.setHTML('');
      editor.insertCard('card', { id: 'card' }, 0);
      editor.focus();
    });
    await page.keyboard.press('Backspace');
    const selectedNode = await page.evaluate(() => {
      editor.insertCard('card', { id: 'gg' });
      return Boolean(editor.view.state.selection.node);
    });
    expect(selectedNode).toBe(true);
  });
  test('it can insertCard using option', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('');
      editor.insertCard('card', undefined, { index: 0, scrollIntoView: false });
      return editor.getHTML();
    });
    expect(html).toBe(CardView());
  });

  test('it insert at same line when empty', async () => {
    const res1 = await page.evaluate(() => {
      editor.setHTML('');
      editor.insertCard('card', {}, { replaceEmpty: true });

      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res1.html).toBe(CardView());
    expect(res1.selection).toMatchObject({ index: 2, length: 0 });

    const res2 = await page.evaluate(() => {
      editor.setHTML(`<p></p>${CARD_HTML}`);
      editor.setSelection({ index: 1, scrollIntoView: false });
      editor.insertCard('card');

      return JSON.parse(
        JSON.stringify({
          html: editor.getHTML(),
          selection: editor.getSelection(),
        }),
      );
    });

    expect(res2.html).toBe(`${CardView()}${CardView()}`);
    // 选中下一个
    expect(res2.selection).toMatchObject({ index: 1, length: 1 });
  });

  test('it can not insertCard do not have', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML();
      editor.insertCard('car', {}, 0);
      return editor.getHTML();
    });
    expect(html).toBe('');
  });

  test('it can insert inline card in blockquote', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<blockquote><p>123</p></blockquote>');
      editor.insertCard('inline_card', {}, 2);
      return editor.getHTML();
    });
    expect(html).toBe(`<blockquote><p>${InlineCardView}123</p></blockquote>`);
  });

  test('it can insert card after list', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<ul><li>123</li></ul>`);
      editor.insertCard('card', {}, 2);
      return editor.getHTML();
    });
    expect(html).toBe(`<ul><li>123</li></ul>${CardView()}`);
  });

  test('it can insert inlineCard', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p></p>`);
      editor.insertCard('inline_card', {});
      return editor.getHTML();
    });
    expect(html).toBe(`<p>${InlineCardView}</p>`);
  });

  test('it can insert inlineCard in list_item', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<ul><li></li></ul>`);
      editor.insertCard('inline_card', {}, 2);
      return editor.getHTML();
    });
    expect(html).toBe(`<ul><li>${InlineCardView}</li></ul>`);
  });

  test('can insert inlineCard with paragraph', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(``);
      editor.insertInlineCardWithPara('ss', {}, 0);
      editor.insertInlineCardWithPara('inline_card', {}, 0);
      return editor.getHTML();
    });
    expect(html).toBe(`<p>${InlineCardView}</p>`);
  });

  test('can insert inlineCard with paragraph use options', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(``);
      editor.insertInlineCardWithPara('inline_card', {}, { index: 0, scrollIntoView: false });
      return editor.getHTML();
    });
    expect(html).toBe(`<p>${InlineCardView}</p>`);
  });
});

describe('replace API test', () => {
  test('can replace Node', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`${CARD_HTML}`);
      editor.replace('hr', { index: 0 });
      return editor.getHTML();
    });
    expect(html).toEqual('<hr class="ProseMirror-selectednode">');

    const html2 = await page.evaluate(() => {
      editor.replace(
        {
          type: 'header',
          content: [{ type: 'text', content: 'header' }],
        },
        0,
      );
      return editor.getHTML();
    });
    expect(html2).toEqual('<h1>header</h1>');
  });

  test('can replace text', async () => {
    const html = await page.evaluate(() => {
      editor.replace(
        {
          type: 'text',
          content: 'replace',
        },
        {
          index: 1,
          length: 6,
          scrollIntoView: false,
          focus: false,
        },
      );
      return editor.getHTML();
    });
    expect(html).toEqual('<h1>replace</h1>');
  });

  test('can replace text', async () => {
    const { html, isBold } = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.replace(
        {
          type: 'text',
          content: 'replace',
          marks: [
            {
              type: 'bold',
            },
          ],
        },
        {
          index: 1,
          length: 3,
          scrollIntoView: false,
          focus: false,
        },
      );
      editor.setSelection({ index: 2, length: 0 });
      return { html: editor.getHTML(), isBold: editor.isActive('bold') };
    });
    expect(html).toEqual('<p><strong>replace</strong></p>');
    expect(isBold).toBe(true);
  });

  test('replace support addToHistory config', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.replace({ type: 'text', content: 'abc' }, { index: 1, length: 3, addToHistory: false });
      editor.undo();
      return editor.getHTML();
    });
    expect(html).toBe(`<p>abc</p>`);
  });

  test('replace node when empty', async () => {
    const res1 = await page.evaluate(() => {
      editor.setHTML('');
      editor.replaceCard('card', {}, { replaceEmpty: true });

      return {
        html: editor.getHTML(),
        selection: editor.getSelection(),
      };
    });

    expect(res1.html).toBe(CardView());
    expect(res1.selection).toMatchObject({ index: 2, length: 0 });
  });

  test('it can replace Card', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(CARD_HTML);
      const attrs = { id: 'test' };
      editor.replaceCard('card', attrs, {
        index: 0,
        scrollIntoView: false,
        focus: false,
      });
      editor.replaceCard('card', attrs, 0);
      return editor.getHTML();
    });
    expect(html).toBe(CardView({ id: 'test' }));
  });

  test('it can not replace Card which not have', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(CARD_HTML);
      const attrs = { id: 'test' };
      editor.replaceCard('ss', attrs);
      return editor.getHTML();
    });
    expect(html).toBe(CardView());
  });

  test('replace support inheritMarks', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(`<p><em>1234</em></p>`);
      editor.setSelection({ index: 1, length: 3 });
      editor.replace('inline_card');
      return editor.getHTML();
    });

    const html1 = await page.evaluate(() => {
      editor.setHTML(`<p><em>1234</em></p>`);
      editor.setSelection({ index: 1, length: 3 });
      editor.replace('inline_card', { inheritMarks: false });
      return editor.getHTML();
    });
    expect(html).toBe('<p><em><a>inline_card</a>4</em></p>');
    expect(html1).toBe('<p><a>inline_card</a><em>4</em></p>');
  });
});

describe('update API test', () => {
  test('can update node attrs', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('<h1>123</h1>');
      editor.update({ level: 2 }, { index: 0, scrollIntoView: true, focus: true });
      return editor.getHTML();
    });
    expect(html).toEqual('<h2>123</h2>');
  });

  test('it can update Card', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(CARD_HTML);
      const attrs = { id: 'test' };
      editor.updateCardAttrs(0, { de: '' });
      editor.updateCardAttrs(0, attrs);
      return editor.getHTML();
    });
    expect(html).toBe(CardView({ id: 'test' }));
  });

  test('update support addToHistory config', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(CARD_HTML);
      const attrs = { id: 'test' };
      editor.update(attrs, { index: 0, addToHistory: false });
      editor.undo();
      return editor.getHTML();
    });
    expect(html).toBe(CardView({ id: 'test' }));
  });
});

describe('delete API test', () => {
  test('it can delete text', async () => {
    const text = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.delete(1, 2);
      return editor.text;
    });
    expect(text).toBe('3');
  });

  test('delete support addToHistory config', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML('');
      editor.setHTML('<p>123</p>', { silent: false });
      editor.delete(1, 3, { addToHistory: false });
      editor.undo();
      return editor.getHTML();
    });
    expect(html).toBe(``);
  });

  test('it can delete selected text', async () => {
    const text = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.setSelection({ index: 1, length: 3 });
      editor.delete();
      return editor.text;
    });
    expect(text).toBe('');
  });

  test('it can delete Card', async () => {
    const html = await page.evaluate(() => {
      editor.setHTML(CARD_HTML);
      editor.deleteCard(0);
      return editor.getHTML();
    });
    expect(html).toBe('');
  });
});

describe('shadow test', () => {
  test('can use insertShadow insert inline shadow', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('<p>1</p>');
      editor.insertShadow(
        {
          pos: 1,
          editable: true,
          shadow: dom => {
            dom.innerHTML = 'shadow';
            dom.className = 'shadow';
            return dom;
          },
          spec: {
            key: 'shadow',
          },
        },
        true,
      );
      return Boolean(document.querySelector('.shadow'));
    });
    expect(res).toBe(true);
  });
  test('can get shadow by spec func', async () => {
    const decoLen = await page.evaluate(() => {
      return editor.getShadows(spec => spec.key === 'shadow').length;
    });
    expect(decoLen).toBe(1);
  });
  test('can get shadow by index', async () => {
    const decoLen = await page.evaluate(() => {
      return editor.getShadows(undefined, 1, 10).length;
    });
    expect(decoLen).toBe(1);
  });

  test('can removeShadow', async () => {
    const res = await page.evaluate(() => {
      editor.insertShadow(
        {
          pos: 3,
          shadow: dom => {
            dom.innerHTML = 'shadow1';
            dom.className = 'shadow1';
            return dom;
          },
          editable: true,
          spec: {
            key: 'shadow1',
            onRemove: () => {
              console.log('onRemove');
            },
          },
        },
        true,
      );
      editor.removeShadow('shadow1');
      return Boolean(document.querySelector('.shadow1'));
    });
    const removePos = await page.evaluate(() => {
      editor.removeShadow('no-op');
      const { index } = editor.removeShadow('shadow');
      return index;
    });
    expect(res).toBe(false);
    expect(removePos).toBe(1);
  });
  test('can use keyboard to delete inline shadow', async () => {
    await page.evaluate(() => {
      editor.setSelection({ index: 1 });
      editor.insertShadow({
        shadow: dom => {
          dom.innerHTML = 'shadow';
          dom.className = 'shadow';
          return dom;
        },
        spec: {
          key: 'shadow',
          onRemove: () => {
            console.log('onRemove');
          },
        },
      });
      editor.setSelection({ index: 3, length: 0 });
    });
    await page.keyboard.press('Backspace');
    const res = await page.evaluate(() => {
      return editor.getHTML();
    });
    expect(res).toEqual(res);
  });
  test('can use insertShadow insert block shadow', async () => {
    const res = await page.evaluate(() => {
      editor.insertShadow({
        pos: 1,
        shadow: dom => {
          dom.innerHTML = 'shadow';
          dom.className = 'shadow';
          return dom;
        },
        spec: {
          key: 'shadow',
        },
      });
      editor.insertShadow({
        pos: 1,
        shadow: dom => {
          dom.innerHTML = 'shadow';
          dom.className = 'shadow';
          return dom;
        },
        spec: {
          key: 'shadow',
        },
      });
      return Boolean(document.querySelector('div .shadow'));
    });
    expect(res).toBe(true);
  });
  test('can use appendShadow append inline shadow', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('<p>123</p>');
      editor.appendShadow(
        {
          index: 1,
          length: 3,
          attrs: {
            nodeName: 'shadow',
          },
          spec: {
            key: 'shadow',
          },
        },
        true,
      );
      editor.appendShadow(
        {
          index: 1,
          length: 3,
          attrs: {
            nodeName: 'shadow',
          },
          spec: {
            key: 'shadow',
          },
        },
        true,
      );
      return Boolean(document.querySelector('shadow'));
    });
    expect(res).toBe(true);
    await page.evaluate(() => {
      editor.removeShadow('shadow');
    });
  });
  test('can use appendShadow append block shadow', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('{-- Card --}');
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
      return Boolean(document.querySelector('shadow div'));
    });
    expect(res).toBe(true);
  });

  test('can use isActive', async () => {
    const res = await page.evaluate(() => {
      editor.insertText('12345');
      editor.setSelection({ index: 0, length: 3 });
      editor.setFormat({ bold: true });
      editor.setSelection({ index: 0, length: 2 });
      const isBold = editor.isActive('bold');
      editor.setSelection({ index: 3, length: 2 });
      const isNotBold = !editor.isActive('bold');
      return isBold && isNotBold;
    });
    expect(res).toBe(true);
  });

  test('can use emit', async () => {
    const res = await page.evaluate(() => {
      let i = 0;
      editor.on('custom-add', () => {
        i++;
      });
      editor.emit('custom-add');
      return i === 1;
    });
    expect(res).toBe(true);
  });

  test('pasteContent support plainText or HTML', async () => {
    const res = await page.evaluate(() => {
      editor.setHTML('<p>test_paste_html</p>');
      return editor.getHTML();
    });
    expect(res).toBe('<p>test_paste_html</p>');

    const res1 = await page.evaluate(() => {
      editor.setHTML('');
      editor.pasteContent('<p>test_paste_html</p>');
      return editor.getHTML();
    });
    expect(res1).toBe('<p>match_paste_html</p>');

    const res2 = await page.evaluate(() => {
      editor.setHTML('');
      editor.pasteContent('<p>test_paste_text</p>', { plainText: true });
      return editor.getHTML();
    });
    expect(res2).toBe('<p>&lt;p&gt;match_paste_text&lt;/p&gt;</p>');
  });
});
