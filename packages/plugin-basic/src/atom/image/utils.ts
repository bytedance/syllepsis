import { Types } from '@syllepsis/adapter';

import { getFixSize } from '../../utils';
import { ImageAttrs, ImageProps } from './types';

interface IImageSize {
  naturalWidth: number;
  naturalHeight: number;
  ratio: number;
}
const IMAGE_SIZE: Types.StringMap<IImageSize | Promise<IImageSize>> = {};

const getImageSize = async (src: string): Promise<IImageSize> => {
  if (IMAGE_SIZE[src]) return IMAGE_SIZE[src];
  IMAGE_SIZE[src] = new Promise(resolve => {
    const img = new window.Image();
    img.src = src;
    img.onload = e => {
      IMAGE_SIZE[src] = {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        ratio: img.naturalWidth / img.naturalHeight,
      };
      resolve(IMAGE_SIZE[src]);
    };
    img.onerror = () => {
      delete IMAGE_SIZE[src];
      resolve({ naturalWidth: 0, naturalHeight: 0, ratio: 0 });
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
const getSizeByRatio = (ratio: number, width?: number, height?: number) => {
  const res: { width?: number; height?: number } = {};

  if (!width && height) {
    res.width = getFixSize(height * ratio);
  } else if (width) {
    res.height = getFixSize(width / ratio);
  }

  return res;
};

// According to the `allowDomains`, If it does not meet the requirements, the upload operation needs to be triggered
const checkDomain = (src: string, config: ImageProps) => {
  const allowDomains = config.allowDomains;
  if (typeof allowDomains === 'function') return allowDomains(src);
  (allowDomains || [/./]).some(domain => {
    if (typeof domain === 'string') return src.includes(domain);
    return domain.test(src);
  });
};

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
  attrs: Partial<ImageAttrs>,
): { width?: number; height?: number } | Promise<{ width?: number; height?: number }> => {
  const { src, width, height } = attrs;
  if (width && height) return { width, height };
  return new Promise(async resolve => {
    const { naturalWidth, naturalHeight, ratio } = await getImageSize(src!);
    if (!naturalWidth || !naturalHeight || (!width && !height)) return resolve({});
    const res = getSizeByRatio(ratio, width, height);
    resolve(res);
  });
};

// keep the aspect ratio after uploading
const constructAttrs = async (oAttrs: Partial<ImageAttrs>, nAttrs: Partial<ImageAttrs>) => {
  if (nAttrs.width && nAttrs.height) return nAttrs;
  if (!nAttrs.width || !nAttrs.height) {
    const { ratio } = await getImageSize(nAttrs.src!);
    return ratio ? { ...nAttrs, ...getSizeByRatio(ratio, nAttrs.width, nAttrs.height) } : nAttrs;
  }
  // nAttrs do not provide width and height
  if (oAttrs.width && oAttrs.height) return nAttrs;
  if (!oAttrs.width || !oAttrs.height) {
    const { ratio } = await getImageSize(nAttrs.src!);
    return ratio ? { ...nAttrs, ...getSizeByRatio(ratio, oAttrs.width, oAttrs.height) } : nAttrs;
  }

  return {};
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
