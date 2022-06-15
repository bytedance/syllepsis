import { SylApi } from '@syllepsis/adapter';

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
) => Promise<string | { src?: string; width?: number; height?: number; [key: string]: any }>;

interface ImageProps {
  /**
   * Image upload method, accept a'blob' or'file', and return the image address or object
   * If it is a picture pasted from outside, uploader will be a 'string' when entering the conference
   */
  uploader?: TImageUploader;
  /** allowed src, the uploader won't be triggered if not match (all src are allowed without configuration) */
  allowDomains?: (RegExp | string)[] | ((domain: string) => boolean);
  /** listen for external file drop events, default true */
  listenDrop?: boolean;
  /** listen to external file paste events, default true */
  listenPaste?: boolean;
  /**  insert file to editor after uploaded, default false */
  uploadBeforeInsert?: boolean;
  /** file type accepted by uploader, default is 'blob' */
  uploadType?: 'file' | 'blob';
  /** whether to disable the zoom function, the default is false */
  disableResize?: boolean;
  /** (inline pictures are not supported), whether to disable picture alignment, the default is false */
  disableAlign?: boolean;
  /** upload failed callback */
  onUploadError?: (e: TUploadDataType, err: Event) => any;
  /** (inline pictures are not supported), the maximum length of the picture description, the default is 20 */
  maxLength?: number;
  /** (inline pictures are not supported), the default value of picture description */
  placeholder?: string;
  /** accepted file type */
  accept?: string;
  /** (inline pictures are not supported), whether to disable the display of picture descriptions, default is false */
  disableCaption?: boolean;
  addAttributes?: IUserAttrsConfig;
  /** automatically delete failed pictures, the default is false */
  deleteFailedUpload?: boolean;
  /** default upload image limit width. When naturalWidth is exceed will use the config value (default is 375). 0 represent no limit. */
  uploadMaxWidth?: number;
  /** This method will be invoked during the process of uploading the picture, which is used to override the default loading node */
  renderLoading?: (props: IUpdateImageProps & { editor: SylApi }) => any;
  /** This method will be invoked after the process of uploading the picture is failed, which is used to override the default failed node */
  renderFailed?: false | ((props: IUpdateImageProps & { editor: SylApi; reUpload: () => Promise<void> }) => any);
  /** check if file should insert to editor, false means don't insert */
  checkBeforeInsert?: (f: File) => Promise<boolean>;
  /** the max width of img, 0 means not limit, the default value is `editor.view.dom.scrollWidth - 40` */
  maxWidth?: number;
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
