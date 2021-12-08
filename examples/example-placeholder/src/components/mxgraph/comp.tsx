import './comp.less';

import cs from 'classnames';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { DownloadIcon, EditIcon } from './icon';

interface ILazyProps {
    data: any,
    editor: any,
    api: any,
    update: (data: any) => void,
    resize: (options: { width?: number, height: number }, updateData?: boolean) => void,
    fullscreen: boolean,
}

const transSvg2Png = (node: SVGSVGElement, width: number, height: number, type = 'png', padding = 0) => new Promise((resolve) => {
    const serializer = new XMLSerializer();
    const source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(node);
    const image = new Image();
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    const canvas = document.createElement('canvas');
    canvas.width = width + padding * 2;
    canvas.height = height + padding * 2;
    const context = canvas.getContext('2d');
    if (context) {
        context.fillStyle = '#fff';
        context.fillRect(0, 0, width + padding * 2, height + padding * 2);
        image.onload = function () {
            context.drawImage(image, padding, padding)
            const pngImage = new Image();
            pngImage.style.setProperty('width', width + 'px');
            pngImage.style.setProperty('height', height + 'px')
            pngImage.setAttribute('src', canvas.toDataURL(`image/${type}`));
            pngImage.onload = function () {
                resolve(pngImage);
            }
        }
    }
})

const Chart = React.forwardRef((props: ILazyProps, ref: any) => {
    const { editor, data, fullscreen, update, resize, api } = props;
    const mxGraphIframeRef = useRef(null);
    const mxGraphPreview = useRef(null);
    const [id] = useState('' + Date.now());

    // 暴露给外界的接口
    useImperativeHandle(ref, () => ({
        getActiveTools: () => {
            return [{
                content: '编辑',
                icon: <EditIcon/>,
                onClick: () => {
                    api.fullscreen(true);
                }
            },{
                content: '下载Svg',
                icon: <DownloadIcon/>,
                onClick: () => {
                    const svgDOM = mxGraphPreview.current.querySelector('svg');
                    const div = document.createElement('div');
                    div.innerHTML = svgDOM.outerHTML;
                    const copySvg = div.querySelector('svg');
                    copySvg.removeAttribute('style');
                    editor.dynamicPlugins.download(copySvg.outerHTML, 'download.svg');
                }
            },]
        },
        getCopyData: async () => {
            const html = mxGraphPreview.current.querySelector('svg');
            const copyDiv = document.createElement('div');
            copyDiv.innerHTML = html.outerHTML;
            const copySvg = copyDiv.querySelector('svg');
            // 不支持复制svg，需要将svg转换成图片
            const width = parseInt(copySvg.getAttribute('width'));
            const height = parseInt(copySvg.getAttribute('height'));
            copySvg.style.setProperty('transform', 'inherit');
            const png = await transSvg2Png(copySvg, width, height, 'png', 20);
            // 还原图片大小
            return {
                html: png
            }
        }
    }));

    function send(message) {
        mxGraphIframeRef?.current?.contentWindow?.postMessage(message);
    }

    useEffect(() => {
        function receiveMessage(event) {
            const cmd = event.data;
            if (cmd && cmd.method && cmd.method.indexOf('mxgraph') === 0) {
                // 要ID匹配才进入
                if (cmd.data.id !== id) {
                    return false;
                }
                switch (cmd.method) {
                    case 'mxgraph-esc': {
                        api.fullscreen(false);
                        break;
                    }
                    case 'mxgraph-ready': {
                        send({ method: 'setData', data });
                        send({ method: 'getSvg' });
                        break;
                    }
                    case 'mxgraph-getSvg': {
                        const { svg, xml } = cmd.data;
                        mxGraphPreview.current.innerHTML = svg;
                        // 调整大小
                        const svgDom = mxGraphPreview.current.querySelector('svg');
                        svgDom.style.setProperty('transform', `translate(-50%, -50%)`)
                        const padding = 20;
                        let height = parseInt(svgDom.getAttribute('height')) + padding * 2;
                        // 设置最小高度（同飞书）
                        height = Math.max(160, height);
                        resize({ height }, true);
                        update(xml);
                    }
                }
            }
        }
        window.addEventListener('message', receiveMessage);
        return () => {
            window.removeEventListener('message', receiveMessage);
        }
    }, []);

    useEffect(() => {
        if (!fullscreen) {
            // 每次退出全屏时，刷新下svg
            send({ method: 'getSvg' })
        } else {
            // 进入全屏时，将焦点移交到Iframe中
            mxGraphIframeRef.current.focus();
            send({ method: 'scrollToVisible' })
        }
    }, [fullscreen]);

    return <>
        <div className={cs('mx-graphic-preview', { 'fullscreen': fullscreen })} ref={mxGraphPreview}/>
        <iframe className={cs('mx-graphic-container', { 'fullscreen': fullscreen})}
                src={`/src/components/mxgraph/lib/index.html?id=${id}`} ref={mxGraphIframeRef}/>
    </>;
});

// eslint-disable-next-line import/no-default-export
export default Chart;