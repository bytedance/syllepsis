import { IDynamicSylApi, IMeta } from '@syllepsis/plugin-placeholder';
import React from 'react';

import { TodoIcon } from './icon';

const meta = {
  typo: {
    adapt: true,
  },
  able: {
    history: true,
  },
};

const data = {}; // first render

async function initTools(editor: IDynamicSylApi, meta: IMeta, data: any, key: string) {
  return new Promise((resolve) => {
    editor.dynamicPlugins.ready('menu.init', () => {
      editor.emit('menu.custom-item', {
        icon: <TodoIcon />,
        content: 'Todo quadrant',
        onClick(editor: IDynamicSylApi, index: number) {
          editor.dynamicPlugins.insertPlaceholder(key, meta, data, index);
        },
      });
      resolve('');
    });
  });
}

function initComp() {
  return () => import(/* webpackChunkName: "Todo.chunk" */'./comp');
}

export {
  data,
  initComp,
  initTools,
  meta,
};