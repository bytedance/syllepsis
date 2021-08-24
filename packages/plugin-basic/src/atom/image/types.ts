import { IUserAttrsConfig } from '../../utils';

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
}

interface ImageAttrs {
  src: string;
  alt: string;
  name: string;
  width: number;
  height: number;
  align?: 'left' | 'center' | 'right';
}

export { ImageAttrs, ImageProps, TImageUploader, TUploadDataType };
