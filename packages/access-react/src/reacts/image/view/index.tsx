import './style.css';

import { Image } from '@syllepsis/plugin-basic';

import { Card, InlineCard } from '../../../card';
import { ImageMask } from './mask';
import { ImageComponent, InlineImageComponent } from './template';

class ImageView extends Image {
  public ViewMap = {
    template: ImageComponent,
    mask: ImageMask
  };

  public NodeView = Card.prototype.NodeView;
}

class InlineImageView extends Image {
  public group = 'inline';
  public inline = true;

  public ViewMap = {
    template: InlineImageComponent,
    mask: ImageMask
  };

  public NodeView = InlineCard.prototype.NodeView;
}

export { ImageView, InlineImageView };
