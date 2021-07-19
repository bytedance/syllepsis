import {
  BoldPlugin,
  BulletListPlugin,
  HrPlugin,
  ListItemPlugin,
  OrderedListPlugin,
  ParagraphPlugin,
  FontSizePlugin,
} from '../../../packages/plugin-basic/dist/es';
import { createEditor } from '../../helpers/createEditor';
import { ModuleCtor } from '../../helpers/modules';
import { AudioPlugin } from '../../helpers/plugins/block-card-audio';
import { ImagePlugin } from '../../helpers/plugins/block-card-image';
import { VideoPlugin } from '../../helpers/plugins/block-card-video';

const editor = createEditor(
  '<h1>Header</h1>',
  undefined,
  document.querySelector('#editor') as HTMLElement,
  [
    BulletListPlugin,
    OrderedListPlugin,
    BoldPlugin,
    HrPlugin,
    new ParagraphPlugin({
      addMatchTags: ['section'],
      allowedAligns: ['left', 'center', 'right', 'justify'],
      allowedClass: ['syl'],
      allowedLineHeights: false,
      allowedLineIndents: [],
      allowedSpaceBefores: [4, { default: true, value: 8 }, 16],
      allowedSpaceAfters: { default: true, value: 20 },
      allowedSpaceBoths: [4, 8, 16],
      addAttributes: {
        test: {
          default: '',
          getFromDOM(dom) {
            return dom.getAttribute('test');
          },
          setDOMAttr(val, attrs) {
            val && (attrs.test = val);
          },
        },
      },
    }),
    new ListItemPlugin({
      maxNestedLevel: 2,
      matchInnerTags: ['section', 'p'],
      allowedLineHeights: [],
      allowedSpaceBefores: [4, { default: true, value: 8 }, 16],
      allowedSpaceAfters: { default: true, value: 20 },
      allowedSpaceBoths: [4, 8, 16],
    }),
    new ImagePlugin({
      uploader: async (url: any) => {
        if (url.includes('delete')) {
          throw new Error('delete');
        }
        return { src: 'test.com' };
      },
      deleteFailedUpload: true,
      allowDomains: [/test\.com/],
      addAttributes: {
        image: {
          default: '',
          getFromDOM(dom) {
            return dom.getAttribute('image');
          },
          setDOMAttr(val, attrs) {
            val && (attrs.image = val);
          },
        },
      },
    }),
    new VideoPlugin({
      uploader: (() => {}) as any,
      addAttributes: {
        video: {
          default: '',
          getFromDOM(dom) {
            return dom.getAttribute('video');
          },
          setDOMAttr(val, attrs) {
            val && (attrs.video = val);
          },
        },
      },
    }),
    new AudioPlugin({
      uploader: (() => {}) as any,
      addAttributes: {
        audio: {
          default: '',
          getFromDOM(dom) {
            return dom.getAttribute('audio');
          },
          setDOMAttr(val, attrs) {
            val && (attrs.audio = val);
          },
        },
      },
    }),
    new FontSizePlugin({
      unit: 'px',
      allowedValues: [24],
    }),
  ],
  {
    desc: {
      Ctor: ModuleCtor,
      option: {
        text: 'init',
      },
    },
  },
);

window.editor = editor;
