import { Card, LocalEvent, SylApi } from '@syllepsis/adapter';
import { addAttrsByConfig, IUserAttrsConfig } from '@syllepsis/plugin-basic';
import React from 'react';

import { DynamicApi, getInjectApi, getUnitId } from './api';
import { PlaceholderMask } from './mask';
import { IPlaceholderData, PLACEHOLDER_KEY } from './types';

function PlaceholderTemplate(props: { attrs: any }) {
  return <div data-card-data={JSON.stringify(props.attrs)}/>;
}

interface IPlaceholderProps {
  addAttributes?: IUserAttrsConfig;
  components: any;
}

export interface IDynamicSylApi extends SylApi {
  dynamicPlugins: DynamicApi
}

export class PlaceholderSchema extends Card<IPlaceholderData> {
  public props: IPlaceholderProps;
  public tagName = () => PLACEHOLDER_KEY;
  public name = PLACEHOLDER_KEY;
  public traceSelection = false;

  constructor(editor: SylApi, props: IPlaceholderProps) {
    super(editor, props);

    addAttrsByConfig(props.addAttributes, this);
    this.props = props;
    const dynamicPlugins = getInjectApi(editor);
    // @ts-ignore
    editor.dynamicPlugins = dynamicPlugins;
    dynamicPlugins.register.inject(props.components);
    dynamicPlugins.ready('editor.init');
    editor.on(LocalEvent.EDITOR_WILL_UNMOUNT, () => {
      dynamicPlugins.clear();
    })
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
