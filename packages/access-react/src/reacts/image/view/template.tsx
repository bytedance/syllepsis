import { IViewMapProps } from '@syllepsis/editor';
import { ImageAttrs } from '@syllepsis/plugin-basic';
import React from 'react';

const InlineImageComponent = (props: IViewMapProps<ImageAttrs>) => {
  const { alt, src, width, height, name } = props.attrs;
  return (
    <img
      src={src}
      // @ts-ignore
      name={name}
      alt={alt || ''}
      width={+width.toFixed(2) || 'auto'}
      height={+height.toFixed(2) || 'auto'}
    />
  );
};

const ImageComponent = (props: IViewMapProps<ImageAttrs>) => {
  const { alt, align } = props.attrs;
  return (
    <div className="syl-image-wrapper" {...(align ? { align: align } : {})}>
      <span className={'syl-image-fixer'} style={{ display: 'inline-block' }}>
        {InlineImageComponent(props)}
        {alt && alt.length > 0 && <p className="syl-image-caption">{props.attrs.alt || ''}</p>}
      </span>
    </div>
  );
};

export { ImageComponent, InlineImageComponent };
