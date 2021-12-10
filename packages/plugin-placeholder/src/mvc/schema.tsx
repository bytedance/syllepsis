import { Card } from '@syllepsis/adapter';
import { addAttrsByConfig, IUserAttrsConfig } from '@syllepsis/plugin-basic';
import React from 'react';

import { inject } from '../helper/register';
import { getInjectApi, getUnitId } from './api';
import { PlaceholderMask } from './mask';
import { IPlaceholderData, PLACEHOLDER_KEY } from './types';

function PlaceholderTemplate(props: { attrs: any }) {
  return <div data-card-data={JSON.stringify(props.attrs)}/>;
}

interface IPlaceholderProps {
  addAttributes?: IUserAttrsConfig;
  components: any;
}

export class PlaceholderSchema extends Card<IPlaceholderData> {
  public props: IPlaceholderProps;
  public tagName = () => PLACEHOLDER_KEY;
  public name = PLACEHOLDER_KEY;
  public traceSelection = false;

  constructor(editor: any, props: IPlaceholderProps) {
    super(editor, props);
    inject(props.components, editor);
    addAttrsByConfig(props.addAttributes, this);
    this.props = props;
    editor.dynamicPlugins = getInjectApi(editor);
    editor.dynamicPlugins.ready('editor.init');
  }

  public parseDOM = [
    {
      tag: 'div',
      getAttrs: (dom: HTMLElement) => {
        if (dom.dataset.cardData) {
          const cardData = JSON.parse(dom.dataset.cardData);
          if (cardData && cardData.meta) {
            // create new id when create plugin (eg: copy & paste)
            cardData.meta.id = getUnitId();
            return cardData;
          }
        } else {
          return false;
        }
      }
    }
  ];

  public toDOM = (node: any) => ({
    0: 'div',
    1: {
      'data-card-data': JSON.stringify(node.attrs)
    }
  });

  public attrs = {
    meta: {},
    data: {},
  };

  public ViewMap = {
    template: PlaceholderTemplate,
    mask: PlaceholderMask
  };
}
