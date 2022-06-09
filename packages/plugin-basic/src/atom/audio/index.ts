import { BlockAtom, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node } from 'prosemirror-model';

import {
  addAttrsByConfig,
  createFileInput,
  getFromDOMByConfig,
  IUserAttrsConfig,
  setDOMAttrByConfig,
  simpleUploadHandler,
} from '../../utils';

interface IAudioAttrs {
  src: string;
  title: string;
  type: string;
  size: number | string;
}

interface IAudioProps {
  uploader: (file: File, editor: SylApi) => Promise<{ src: string; width?: number; height?: number }>;
  uploadBeforeInsert?: boolean;
  addAttributes?: IUserAttrsConfig;
  accept?: string;
  isInline?: boolean;
}

const NAME = 'audio';

class AudioController extends SylController<IAudioProps> {
  public name = NAME;
  private input: HTMLInputElement;

  public uploader: IAudioProps['uploader'] = async () =>
    Promise.reject('please provide uploader in controllerProps for audio');

  constructor(editor: SylApi, props: IAudioProps) {
    super(editor, props);
    if (props.uploader) this.uploader = props.uploader;
    this.input = createFileInput({
      multiple: false,
      accept: props.accept || 'audio/*',
      onChange: this.onChange,
      getContainer: () => editor.root,
    });
  }

  private onChange = async (e: Event) =>
    simpleUploadHandler({
      name: NAME,
      target: e.target as HTMLInputElement,
      editor: this.editor,
      uploadBeforeInsert: this.props.uploadBeforeInsert !== false,
      uploader: this.uploader,
      getAttrs: (src, file) => ({ src, type: file.type, size: file.size, name: file.name }),
    });

  public toolbar = {
    icon: '',
    handler: (editor: SylApi) => this.input.click(),
  };

  public editorWillUnmount = () => {
    this.editor.root.removeChild(this.input);
  };
}

class Audio extends BlockAtom<IAudioAttrs> {
  public props: IAudioProps;
  constructor(editor: SylApi, props: IAudioProps) {
    super(editor, props);
    this.props = props;
    addAttrsByConfig(props.addAttributes, this);
    if (props.isInline) {
      this.inline = true;
      this.group = 'inline';
    }
  }

  public name = 'audio';

  public parseDOM = [
    {
      tag: 'audio',
      getAttrs: (dom: HTMLAudioElement) => {
        let src = dom.getAttribute('src') || '';
        const title = dom.getAttribute('title') || '';
        const size = dom.dataset.size || 0;
        let type;
        const sourceEls = dom.querySelectorAll('source') as NodeListOf<HTMLSourceElement>;
        ([].slice.call(sourceEls) as HTMLSourceElement[]).some(el => {
          src = el.getAttribute('src') || '';
          type = el.getAttribute('type') || '';
          if (src) return true;
        });
        if (!src) return false;
        const formattedAttrs = { src, title, type, size };
        getFromDOMByConfig(this.props.addAttributes, dom, formattedAttrs);
        return formattedAttrs;
      },
    },
  ];
  public attrs = {
    src: {
      default: '',
    },
    type: {
      default: '',
    },
    title: {
      default: '',
    },
    size: {
      default: 0,
    },
  };
  public toDOM = (node: Node) => {
    const { src, type, size, title } = node.attrs;
    const attrs = { controls: 'true', 'data-size': size, title };
    setDOMAttrByConfig(this.props.addAttributes, node, attrs);
    const renderSpec = ['audio', attrs, ['source', { src, type }]] as DOMOutputSpec;
    if (this.inline) return renderSpec;

    return ['div', { class: 'syl-audio-wrapper', align: 'center' }, renderSpec] as DOMOutputSpec;
  };
}

class AudioPlugin extends SylPlugin<IAudioProps> {
  public name = NAME;
  public Controller = AudioController;
  public Schema = Audio;
}

export { Audio, AudioController, AudioPlugin, IAudioAttrs, IAudioProps };
