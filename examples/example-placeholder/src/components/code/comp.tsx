import './comp.less';

import { basicSetup, EditorState } from '@codemirror/basic-setup'
import { indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { EditorView, keymap, ViewUpdate } from '@codemirror/view'
import React, { useRef, useEffect, useState, useImperativeHandle } from 'react';

interface ILazyProps {
    data: any,
    editor: any,
    update: (data: any) => void,
}

const Code = React.forwardRef((props: ILazyProps, ref: any) => {
    const { data, update } = props;
    const mountEl = useRef(null);
    const [globalView, setGlobalView] = useState(null);

    // 暴露给外界的接口
    useImperativeHandle(ref, () => ({
        getCopyData: async () => {
            return {
                html: `<pre><code>${globalView.state.doc.text.join('\n')}</code></pre>`
            };
        }
    }));

    useEffect(() => {
        const view = new EditorView({
            state: EditorState.create({
                doc: data.doc,
                extensions: [
                    basicSetup,
                    keymap.of([indentWithTab]),
                    javascript(),
                    EditorView.updateListener.of((v: ViewUpdate) => {
                        if (v.docChanged) {
                            const data = {
                                doc: view.state.doc.toString()
                            }
                            update(data);
                        }
                    })
                ]
            }),
            parent: mountEl.current
        })
        setGlobalView(view);
    }, []);
    return <div className={'code'} ref={mountEl}/>
});

// eslint-disable-next-line import/no-default-export
export default Code;
