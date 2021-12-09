// @ts-nocheck

describe('insert images in block', () => {
  it('It is used to test inserting images array in blockquote', async () => {
    await page.evaluate(async ()=> {
      editor.setHTML(`<blockquote><p>fdsafdsafdsa</p></blockquote>`);
      editor.setSelection({ index: 14, length: 0, anchor: 14, head: 14 });
      const dataURLtoFile = (dataurl: string, filename:string) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
      }
      const files: any = [];
      const blankSvg = `data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=`;
      files.push(dataURLtoFile(blankSvg, 'a.jpeg'));
      files.push(dataURLtoFile(blankSvg, 'b.jpeg'));
      await editor.command.image.insertImages(files);
    });
  // InsertImages is an asynchronous method, so need to wait 2s;
    await new Promise(resove => {
      setTimeout(() => {
        resove();
      }, 2 * 1000);
    });
    const res = await page.evaluate(() => {
      const html = editor.getHTML();
      // a.jpeg  must be before b.jpeg
      const posA = html.indexOf(`name="a.jpeg"`);
      const posB = html.indexOf(`name="b.jpeg"`);
      return posA < posB;
    });
    expect(res).toBe(true);
  });

})