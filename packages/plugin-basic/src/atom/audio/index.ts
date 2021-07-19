import { BlockAtom, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpec, Node } from 'prosemirror-model';

import { addAttrsByConfig, getFromDOMByConfig, IUserAttrsConfig, setDOMAttrByConfig } from '../../utils';

interface IAudioAttrs {
  src: string;
  title: string;
  type: string;
  size: number | string;
}

interface IAudioProps {
  uploader: (file: File, editor: SylApi) => Promise<{ src: string; width?: number; height?: number }>;
  addAttributes?: IUserAttrsConfig;
  isInline?: boolean;
}

const NAME = 'audio';

class AudioController extends SylController<IAudioProps> {
  public name = NAME;

  public uploader: IAudioProps['uploader'] = async () =>
    Promise.reject('please provide uploader in controllerProps for audio');

  constructor(editor: SylApi, props: IAudioProps) {
    super(editor, props);
    if (props.uploader) this.uploader = props.uploader;
  }

  public toolbar = {
    icon: '',
    handler: (editor: SylApi) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'audio/*');
      input.setAttribute('style', 'display: none');
      document.body.appendChild(input);
      input.onchange = async e => {
        const { index } = editor.getSelection();
        const uploadRes = await Promise.all(
          Array.prototype.slice
            .call((e.target as HTMLInputElement).files)
            .map(async (file: File) => await this.uploader(file, editor)),
        );
        uploadRes.forEach((attrs, idx) => {
          if (!attrs) return;
          editor.insertCard(NAME, attrs, index + idx);
        });
        document.body.removeChild(input);
      };
      input.click();
    },
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
