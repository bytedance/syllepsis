import { Types } from '@syllepsis/adapter';

import { getFixSize } from '../../utils';
import { ImageAttrs, ImageProps } from './types';

interface IImageSize {
  naturalWidth: number;
  naturalHeight: number;
}
const IMAGE_SIZE: Types.StringMap<IImageSize | Promise<IImageSize>> = {};

const getImageSize = async (src: string): Promise<{ naturalWidth: number; naturalHeight: number }> => {
  if (IMAGE_SIZE[src]) return IMAGE_SIZE[src];
  IMAGE_SIZE[src] = new Promise(resolve => {
    const img = new window.Image();
    img.src = src;
    img.onload = e => {
      IMAGE_SIZE[src] = { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
      resolve(IMAGE_SIZE[src]);
    };
    img.onerror = () => {
      delete IMAGE_SIZE[src];
      resolve({ naturalWidth: 0, naturalHeight: 0 });
    };
  });

  return IMAGE_SIZE[src];
};

const getImageFileList = (files: FileList) =>
  Array.prototype.slice.call(files || '').filter(file => file.type.includes('image'));

// get the image file selected by the input
const getInputImageFiles = (event: any) => {
  if (!event.target.files) return [];
  return getImageFileList(event.target.files);
};

// calculate the height or width value according to the original image's aspect ratio
const getSizeByRatio = (ratio: number, defaultWith: number, width?: number, height?: number) => {
  const res: { width?: number; height?: number } = {};

  if (!width && !height) {
    res.width = defaultWith;
    res.height = getFixSize(defaultWith / ratio);
  } else if (!width && height) {
    res.width = getFixSize(height * ratio);
  } else if (width) {
    res.height = getFixSize(width / ratio);
  }
  return res;
};

// According to the `allowDomains`, If it does not meet the requirements, the upload operation needs to be triggered
const checkDomain = (src: string, config: ImageProps) =>
  (config.allowDomains || [/./]).some(domain => {
    if (typeof domain === 'string') return src.includes(domain);
    return domain.test(src);
  });

// image file to be display needs converted to ObjectURL, here it is reversed, for uploading
const transformBlobFromObjectURL = async (url: string): Promise<Blob> =>
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = e => {
      if (xhr.status === 200) resolve(xhr.response);
      else reject();
    };
    xhr.onerror = e => reject(e);
    xhr.send();
  });

// deal with the lack of width and height of the paste, obtain the original image's aspect ratio and then calculate
const correctSize = (
  attrs: ImageAttrs,
  defaultWidth: number,
): { width?: number; height?: number } | Promise<{ width?: number; height?: number }> => {
  const { src, width, height } = attrs;

  if (width && height) return { width, height };
  return new Promise(async resolve => {
    const { naturalWidth, naturalHeight } = await getImageSize(src);
    if (!naturalWidth || !naturalHeight) resolve({});
    else {
      const ratio = naturalWidth / naturalHeight;
      const res = getSizeByRatio(ratio, defaultWidth, width, height);
      resolve(res);
    }
  });
};

// keep the aspect ratio after uploading
const constructAttrs = (oAttrs: Partial<ImageAttrs>, nAttrs: Partial<ImageAttrs>, defaultWidth: number) => {
  let attrs: { width?: number; height?: number } = {};
  if ((!nAttrs.width || !nAttrs.height) && oAttrs.height && oAttrs.width) {
    const ratio = oAttrs.width / oAttrs.height;
    attrs = getSizeByRatio(ratio, defaultWidth, nAttrs.width, nAttrs.height);
  }
  return { ...oAttrs, ...nAttrs, ...attrs };
};

export {
  checkDomain,
  constructAttrs,
  correctSize,
  getImageFileList,
  getImageSize,
  getInputImageFiles,
  getSizeByRatio,
  transformBlobFromObjectURL,
};
