import { Card as BaseBlockCard, InlineCard as BaseInlineCard } from '@syllepsis/adapter';
import { AccessLayer } from '@syllepsis/editor';
import { ReactElement } from 'react';

import { ReactRenderer } from './render-bridge';

const Card = AccessLayer<ReactElement>(BaseBlockCard, ReactRenderer);
const InlineCard = AccessLayer<ReactElement>(BaseInlineCard, ReactRenderer);

export { Card, InlineCard };
