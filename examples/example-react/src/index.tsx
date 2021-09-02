import {
  BackgroundPlugin,
  ColorPlugin,
  EmojiPlugin,
  ImagePlugin,
  LinkPlugin,
  SylEditor,
} from '@syllepsis/access-react';
import { SylApi } from '@syllepsis/adapter';
import { ToolbarInlineLoader, ToolbarLoader } from '@syllepsis/editor';
import {
  AlignCenterPlugin,
  AlignJustifyPlugin,
  AlignLeftPlugin,
  AlignRightPlugin,
  AudioPlugin,
  BlockQuotePlugin,
  BoldPlugin,
  BulletListPlugin,
  FontSizePlugin,
  FormatClearPlugin,
  FormatPainterPlugin,
  HeaderPlugin,
  HrPlugin,
  ItalicPlugin,
  LetterSpacePlugin,
  LineHeightPlugin,
  LineIndentPlugin,
  ListItemPlugin,
  OrderedListPlugin,
  ParagraphPlugin,
  RedoPlugin,
  SpaceAfterPlugin,
  SpaceBeforePlugin,
  SpaceBothPlugin,
  StrikePlugin,
  SubPlugin,
  SupPlugin,
  UnderlinePlugin,
  UndoPlugin,
  VideoPlugin,
} from '@syllepsis/plugin-basic';
import { CodeBlockPlugin } from '@syllepsis/plugin-code-block';
import { TablePlugin } from '@syllepsis/plugin-table';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

declare global {
  interface Window {
    editor: SylApi;
  }
}

const RichEditor = () => {
  const [plugins] = useState([
    new RedoPlugin(),
    new UndoPlugin(),
    new BoldPlugin(),
    new BlockQuotePlugin(),
    new ListItemPlugin({
      maxNestedLevel: 4,
      matchInnerTags: ['section', 'p'],
      allowedLineHeights: [],
      allowedSpaceBefores: [],
      allowedSpaceAfters: { default: true, value: 20 },
      allowedSpaceBoths: [],
    }),
    new BulletListPlugin(),
    new OrderedListPlugin(),
    new CodeBlockPlugin({ lineNumbers: false }),
    new HrPlugin(),
    new HeaderPlugin(),
    new ItalicPlugin(),
    new SubPlugin(),
    new SupPlugin(),
    new StrikePlugin(),
    new UnderlinePlugin(),
    new ParagraphPlugin({
      addMatchTags: ['section'],
      allowedAligns: ['left', 'center', 'right', 'justify'],
      allowedClass: [],
      allowedLineHeights: false,
      allowedLineIndents: [],
      allowedSpaceBefores: { default: true, value: 0 },
      allowedSpaceAfters: { default: true, value: 20 },
      allowedSpaceBoths: [],
    }),
    new FormatClearPlugin(),
    new FontSizePlugin({
      allowedValues: [12, 14, 16, { value: 17, default: true }, 18, 20, 24, 32],
      values: [12, 14, 16, { value: 17, default: true }, 18, 20, 24, 32],
      unit: 'px',
    }),
    new LetterSpacePlugin({
      allowedValues: [0, 0.5, 1, 1.5],
    }),
    new AlignLeftPlugin(),
    new AlignCenterPlugin(),
    new AlignRightPlugin(),
    new AlignJustifyPlugin(),
    new SpaceBeforePlugin({ values: [0, 4, 8, 12, 16, { value: 20, default: true }, 24, 28, 30] }),
    new SpaceAfterPlugin({ values: [0, 4, 8, 12, 16, { value: 20, default: true }, 24, 28, 30] }),
    new SpaceBothPlugin({ values: [0, 4, 8, 12, 16, { value: 20, default: true }, 24, 28, 30] }),
    new LineHeightPlugin({
      values: [1, 1.5, { value: 1.75, default: true }, 1.88, 2, 3],
    }),
    new LineIndentPlugin(),
    new FormatPainterPlugin(),
    new TablePlugin({
      button: {
        activeColor: '#FF0F0F',
        trigger: 'click',
      },
      columnResize: { handleWidth: 5, cellMinWidth: 24 },
      table: {
        allowTableNodeSelection: false,
        defaultCellWidth: 100,
        useTableHeader: false,
      },
    }),
    new ImagePlugin({
      allowDomains: [],
      uploader: f => {
        const width = 600 * Math.random();
        return Promise.resolve({
          src: typeof f === 'string' ? f : URL.createObjectURL(f),
          width,
        });
      },
      uploadMaxWidth: 500,
    }),
    new VideoPlugin({
      uploader: async file =>
        Promise.resolve({
          src: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
          title: file.name,
        }),
      addAttributes: {
        test: {
          default: 'test',
          getFromDOM: () => 'test',
          setDOMAttr: (val, attrs) => (attrs.test = val),
        },
      },
    }),
    new LinkPlugin({
      validateHref: href => {
        if (href.includes('http')) {
          return {
            error: false,
            href,
          };
        } else {
          return {
            error: true,
            text: 'got error',
            href,
          };
        }
      },
    }),
    new AudioPlugin({
      uploader: (file: File) =>
        Promise.resolve({
          src: URL.createObjectURL(file),
        }),
    }),
    new ColorPlugin(),
    new BackgroundPlugin(),
    new EmojiPlugin(),
  ]);

  const [module] = useState({
    toolbar: {
      Ctor: ToolbarLoader,
      option: {
        tools: [
          RedoPlugin.getName(),
          UndoPlugin.getName(),
          HeaderPlugin.getName(),
          BulletListPlugin.getName(),
          OrderedListPlugin.getName(),
          CodeBlockPlugin.getName(),
          BlockQuotePlugin.getName(),
          BoldPlugin.getName(),
          ItalicPlugin.getName(),
          UnderlinePlugin.getName(),
          StrikePlugin.getName(),
          FontSizePlugin.getName(),
          LetterSpacePlugin.getName(),
          BackgroundPlugin.getName(),
          FormatPainterPlugin.getName(),
          ColorPlugin.getName(),
          ImagePlugin.getName(),
          VideoPlugin.getName(),
          AudioPlugin.getName(),
          HrPlugin.getName(),
          LinkPlugin.getName(),
          SubPlugin.getName(),
          SupPlugin.getName(),
          EmojiPlugin.getName(),
          TablePlugin.getName(),
          [
            AlignLeftPlugin.getName(),
            AlignCenterPlugin.getName(),
            AlignRightPlugin.getName(),
            AlignJustifyPlugin.getName(),
          ],
          [
            SpaceBeforePlugin.getName(),
            SpaceAfterPlugin.getName(),
            SpaceBothPlugin.getName(),
            LineHeightPlugin.getName(),
            LineIndentPlugin.getName(),
          ],
        ],
      },
    },
    toolbarInline: {
      Ctor: ToolbarInlineLoader,
      option: {
        tools: [
          BoldPlugin.getName(),
          ItalicPlugin.getName(),
          UnderlinePlugin.getName(),
          StrikePlugin.getName(),
          '|',
          AlignLeftPlugin.getName(),
          HeaderPlugin.getName(),
          '|',
          [SpaceBeforePlugin.getName(), SpaceAfterPlugin.getName()],
          SpaceBothPlugin.getName(),
          {
            content: [OrderedListPlugin.getName(), BulletListPlugin.getName()],
            contentOption: { tipDirection: 'up' },
          },
          'color',
        ],
      },
    },
  });

  return (
    <>
      <SylEditor
        placeholder="please input..."
        content="<p><span style='color: #db4127;'>default content</span></p>"
        getEditor={editor => {
          window.editor = editor;
        }}
        plugins={plugins}
        module={module}
      />
    </>
  );
};

ReactDOM.render(<RichEditor />, document.querySelector('#editor'));
