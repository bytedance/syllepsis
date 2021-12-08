import React from 'react';

import { FlowIcon } from './icon';

const meta = {
    typo: {
        height: 160
    },
    able: {
        fullscreen: true,
    },
}

const data = '';

async function initTools(editor: any, meta: any, data: any, key: string) {
    return new Promise((resolve) => {
        editor.dynamicPlugins.ready('menu.init', () => {
            editor.emit('menu.custom-item', {
                icon: <FlowIcon/>,
                content: '流程图',
                onClick(editor: any, index: number) {
                    editor.dynamicPlugins.insertPlaceholder(key, meta, data, index);
                },
            });
            resolve('');
        });
    });
}

function initComp() {
    return () => import(/* webpackChunkName: "MxGraphic.chunk" */'./comp');
}

export {
    meta,
    data,
    initComp,
    initTools,
}