import React from 'react';

import { ExperimentIcon } from './icon';

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
  avatar: 'https://p26.toutiaoimg.com/large/pgc-image/e8cd855436bf4b15b4420c8e1b3503c0',
};

async function initTools(editor: any, meta: any, data, key: string) {
  return new Promise((resolve) => {
    editor.dynamicPlugins.ready('menu.init', () => {
      editor.emit('menu.custom-item', {
        icon: <ExperimentIcon />,
        content: key,
        onClick(editor: any, index: number) {
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