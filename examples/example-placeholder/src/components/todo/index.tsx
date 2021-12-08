import React from 'react';

import { TodoIcon } from './icon';

const meta = {
    typo: {
        adapt: true,
    },
    able: {
        history: true
    }
}

const data = {} // first render

async function initTools(editor: any, meta: any, data: any, key: string) {
    return new Promise((resolve) => {
        editor.dynamicPlugins.ready('menu.init', () => {
            editor.emit('menu.custom-item', {
                icon: <TodoIcon/>,
                content: '任务清单',
                onClick(editor: any, index: number) {
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
    meta,
    data,
    initComp,
    initTools
}