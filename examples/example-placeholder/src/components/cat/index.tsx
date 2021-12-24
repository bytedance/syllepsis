import { IMeta } from '@syllepsis/plugin-placeholder';
import { IDynamicSylApi } from '@syllepsis/plugin-placeholder/dist/es/mvc/schema';
import React from 'react';

import { ExperimentIcon } from './icon';
import { avatar } from './icon/avatar';

const meta = {
  typo: {
    width: 600,
    height: 200,
  },
  able: {
    resize: true,
  },
};

const data = {
  name: 'Cat',
  desc: 'How bad could a kitty be?',
  role: 'Cheerleaders',
  avatar,
};

async function initTools(editor: IDynamicSylApi, meta: IMeta, data: any, key: string) {
  return new Promise((resolve) => {
    editor.dynamicPlugins.ready('menu.init', () => {
      editor.emit('menu.custom-item', {
        icon: <ExperimentIcon />,
        content: key,
        onClick(editor: IDynamicSylApi, index: number) {
          editor.dynamicPlugins.insertPlaceholder(key, meta, data, index);
        },
      });
      resolve('');
    });
  });
}

function initComp() {
  return () => import(/* webpackChunkName: "Demo.base.chunk" */'./comp');
}

export {
  meta,
  data,
  initComp,
  initTools,
};