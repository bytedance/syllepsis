import { IDynamicSylApi, IMeta } from '@syllepsis/plugin-placeholder';
import React from 'react';

import { CodeIcon } from './icon';

const meta = {};

const doc = '';

const data = {
  doc,
};

async function initTools(editor: IDynamicSylApi, meta: IMeta, data: any, key: string) {
  return new Promise((resolve) => {
    editor.dynamicPlugins.ready('menu.init', () => {
      editor.emit('menu.custom-item', {
        icon: <CodeIcon />,
        content: 'Code',
        onClick(editor: IDynamicSylApi, index: number) {
          editor.dynamicPlugins.insertPlaceholder(key, meta, data, index);
        },
      });
      resolve('');
    });
  });
}

function initComp() {
  return () => import(/* webpackChunkName: "Code.chunk" */'./comp');
}

export {
  data,
  initComp,
  initTools,
  meta,
};