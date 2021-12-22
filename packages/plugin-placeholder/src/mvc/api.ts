import ClipboardJS from 'clipboard';

import { getContentRefHandler } from '../comp/toolWrapper';
import { deepCopy } from '../helper';
import { defaultMeta, Register } from '../helper/register';
import { PLACEHOLDER_KEY } from './types';

// event happened
const happenedEvent: string[] = [];
let eventCb: {
  [key: string]: [value: () => void]
} = {};

// copy vars
let copyBtn: HTMLElement | null = null;
let copyHtml = '';
let copyText = '';
let shouldFilter = false;
let isAsyncCopy = false;

interface ICopyParams {
  node?: HTMLElement,
  text?: string,
  html?: string
}

let index = 0;

function getUnitId() {
  index++;
  return 'placeholder-' + index;
}

const PLACEHOLDER_ID_KEY = 'id';

const NOT_SUPPORT_PASTE_CARD = 'not support paste card on others editor';

/**
 * if event happened, will emit immediately
 * if not happened, will emit after event happened
 * @param eventName
 * @param callback
 */
function ready(eventName: string, callback?: () => void) {
  const isHappened = happenedEvent.indexOf(eventName) !== -1;

  if (callback) {
    if (isHappened) {
      callback();
    } else {
      // loading array
      eventCb[eventName] = eventCb[eventName] || [];
      eventCb[eventName].push(callback);
    }
  } else {
    if (!isHappened) {
      console.log('ready', eventName, 'happened');
      happenedEvent.push(eventName);
      if (eventCb[eventName]) {
        eventCb[eventName].forEach((eachCb) => {
          eachCb();
        })
      }
    }
  }
}

function clear() {
  happenedEvent.splice(0, happenedEvent.length);
  eventCb = {};
}

/**
 * copy by code
 * @param copyParams
 */
function copy(copyParams: ICopyParams) {
  const { node, html, text } = copyParams;
  if (node) {
    copyHtml = node.outerHTML || '';
    copyText = node.textContent || '';
  } else {
    copyHtml = html || '';
    copyText = text || '';
  }
  // fix: if text is empty, can not emit copy event
  if (copyHtml && !copyText) {
    copyText = NOT_SUPPORT_PASTE_CARD;
  }
  shouldFilter = true;
  copyBtn && copyBtn.click();
}

function isCard(node: HTMLElement) {
  return (node.getAttribute && node.getAttribute('__syl_tag') === 'true')
    || (node.dataset && node.dataset.cardData)
}

function isInputElement(node: HTMLElement) {
  return node.tagName === 'TEXTAREA' || node.tagName === 'INPUT' || node.contentEditable === 'true';
}

function download(data: string, name: string) {
  const link = document.createElement('a');
  const encodedData = encodeURIComponent(data);
  link.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
  link.setAttribute('download', name);
  link.click();
}

function getConfig(node: HTMLElement) {
  try {
    const templ = node.querySelector('templ');
    if (templ && templ.children) {
      // emit by click button
      const cardDataDiv = templ.children[0] as HTMLElement;
      if (cardDataDiv.dataset && cardDataDiv.dataset.cardData) {
        return JSON.parse(cardDataDiv.dataset.cardData)
      }
    } else if (node && node.dataset && node.dataset.cardData) {
      // emit by keyboard
      return JSON.parse(node.dataset.cardData)
    }
    return {};
  } catch {
    return {};
  }
}

function delay(callback: () => any) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const { html, text } = await callback();
      resolve({ html, text });
    });
  });
}

/**
 * filter card data
 * @param htmlString
 */
async function getFilterData(htmlString: string) {
  const element = document.createElement('div');
  element.style.setProperty('display', 'none');
  element.innerHTML = htmlString;
  document.body.append(element);
  let text = '';
  let html = '';
  let shouldAppendNextLine = false;
  // @ts-ignore
  for (const eachChild of element.childNodes) {
    let currElement = eachChild as HTMLElement;
    if (isCard(eachChild)) {
      const config = getConfig(eachChild);
      // remove mask div
      const mask = eachChild.querySelector('mask');
      if (mask) {
        eachChild.removeChild(mask);
      }
      const handle = getContentRefHandler(config.meta.id);
      // allow custom data
      if (handle && handle.getCopyData) {
        // fix: hack make sure getCopyData is sync
        const res = await delay(handle.getCopyData) as { text: any, html: any };
        const { text: resText, html: resHtml } = res;
        if (text) {
          text += '\n';
        }
        text += resText || NOT_SUPPORT_PASTE_CARD;
        // inject html
        if (resHtml) {
          const copyDiv = document.createElement('div');

          if (resHtml.nodeType === 1) {
            copyDiv.appendChild(resHtml)
          } else if (typeof resHtml === 'string') {
            copyDiv.innerHTML = resHtml;
          } else {
            console.error('unSupport html data', resHtml);
          }

          const templateDiv = eachChild.querySelector('templ');
          if (templateDiv) {
            const dataDiv = templateDiv.children[0];
            dataDiv.appendChild(copyDiv);
            currElement = dataDiv;
          } else {
            eachChild.innerHTML = copyDiv.outerHTML;
            currElement = eachChild;
          }
        }
        shouldAppendNextLine = true;
      } else {
        if (text) {
          text += '\n';
        }
        text += NOT_SUPPORT_PASTE_CARD;
        shouldAppendNextLine = true;
      }
    } else {
      if (shouldAppendNextLine) {
        text += '\n';
      }
      text += currElement.textContent;
    }
    // fix: cannot use eachChild.outerHTML，Lark is not support
    html += currElement.outerHTML;
  }
  return {
    text,
    html
  };
}

// prevent default copy event
initCopy();

function initCopy() {
  copyBtn = document.createElement('button');
  copyBtn.classList.add('copy-btn')
  copyBtn.style.setProperty('display', 'none');
  document.body.append(copyBtn);

  document.addEventListener('copy', async (e: ClipboardEvent) => {
    const container = document.querySelector('.ProseMirror');
    const node = e.target as HTMLElement;
    const shouldChange = container && e.target &&
      (shouldFilter || (!isInputElement(node) && container.contains(node)));
    // shouldFilter only effect once
    shouldFilter = false;
    if (e.clipboardData && shouldChange) {
      e.preventDefault();
      if (isAsyncCopy) {
        isAsyncCopy = false;
        e.clipboardData.setData('text/html', copyHtml);
        e.clipboardData.setData('text', copyText);
      } else {
        const pureHtml = e.clipboardData.getData('text/html');
        const pureText = e.clipboardData.getData('text');
        const _html = pureHtml || copyHtml;
        if (_html) {
          // hack: cannot write when event async , should emit twice
          const { text, html } = await getFilterData(_html);
          isAsyncCopy = true;
          copy({ text, html });
        } else {
          e.clipboardData.setData('text', pureText);
        }
      }
    }
  });

  (() => new ClipboardJS('.copy-btn', {
      text: function () {
        return copyText;
      }
    }))();
}

interface DynamicApi {
  insertPlaceholder: (name: string, _meta: any, data: any, index: number) => void,
  copy: (copyParams: ICopyParams) => void,
  ready: (eventName: string, callback?: () => void) => void,
  clear: () => void,
  isCard: (node: HTMLElement) => void,
  download: (data: string, name: string) => void,
  register: Register
}


/**
 * inject api
 * @param editor
 */
function getInjectApi(editor: any) {
  const api: DynamicApi = {
    insertPlaceholder: (name: string, _meta: any, data: any, index: number) => {
      const meta = Object.assign(deepCopy(defaultMeta), _meta);
      const newData = { meta, data };
      newData.meta[PLACEHOLDER_ID_KEY] = getUnitId();
      newData.meta.name = name;
      editor.insertCard(
        PLACEHOLDER_KEY, newData, { index: index || editor?.getSelection().index }
      );
    },
    copy,
    ready,
    clear,
    isCard,
    download,
    register: new Register(editor)
  }
  return api;
}

export {
  download,
  DynamicApi,
  getInjectApi,
  getUnitId,
  PLACEHOLDER_ID_KEY,
  ready
}