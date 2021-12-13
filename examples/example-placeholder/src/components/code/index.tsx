import React from 'react';

import { CodeIcon } from './icon';

const meta = {
}

const doc = '';

const data = {
    doc
}

async function initTools(editor: any, meta: any, data: any, key: string) {
    return new Promise((resolve) => {
        editor.dynamicPlugins.ready('menu.init', () => {
            editor.emit('menu.custom-item', {
                icon: <CodeIcon/>,
                content: 'Code',
                onClick(editor: any, index: number) {
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
    meta,
    data,
    initComp,
    initTools,
}