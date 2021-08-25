import { IUserAttrsConfig } from '../../utils';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    image?: {
      insertImages: (files: File[]) => Promise<void>;
      updateImageUrl: (props: IUpdateImageProps) => Promise<void>;
      getConfiguration: () => Partial<ImageProps>;
    };
  }
}
interface IUpdateImageProps {
  getPos: () => number;
  attrs: ImageAttrs;
  state: any;
}

type TUploadDataType = File | Blob | string;
type TImageUploader = (
  file: TUploadDataType,
  state: { src: string },
) => Promise<string | { src: string; width?: number; height?: number; [key: string]: any }>;

interface ImageProps {
  uploader?: TImageUploader;
  allowDomains?: (RegExp | string)[] | ((domain: string) => boolean);
  listenDrop?: boolean;
  listenPaste?: boolean;
  uploadBeforeInsert?: boolean;
  uploadType?: 'file' | 'blob';
  disableResize?: boolean;
  disableAlign?: boolean;
  onUploadError?: (e: TUploadDataType, err: Event) => any;
  maxLength?: number;
  placeholder?: string;
  accept?: string;
  disableCaption?: boolean;
  addAttributes?: IUserAttrsConfig;
  deleteFailedUpload?: boolean;
  uploadMaxWidth?: number;
}

interface ImageAttrs {
  src: string;
  alt: string;
  name: string;
  width: number;
  height: number;
  align?: 'left' | 'center' | 'right';
}

export { ImageAttrs, ImageProps, IUpdateImageProps, TImageUploader, TUploadDataType };
