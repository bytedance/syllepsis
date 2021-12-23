import { SylApi, SylController } from '@syllepsis/adapter';

import { imgData } from '../img/drag';

function getAble(event: DragEvent) {
  try {
    const node = event.target as HTMLElement;
    const templ = node.querySelector('templ div') as HTMLElement;
    if (templ && templ.dataset && templ.dataset.cardData) {
      const data = JSON.parse(templ.dataset.cardData);
      if (data.meta.able) {
        return data.meta.able;
      } else {
        return false;
      }
    }
  } catch {
    return false;
  }
}

function happenInPlaceHolder(node: HTMLElement) {
  let currNode: HTMLElement | null = node;
  let isPlaceHolder = false;
  let isProseMirror = false;
  while (currNode && !isPlaceHolder && !isProseMirror) {
    isPlaceHolder = currNode.classList.contains('placeholder-wrapper');
    isProseMirror = currNode.classList.contains('ProseMirror');
    currNode = currNode.parentElement;
  }
  return currNode && !isProseMirror && isPlaceHolder;
}

let isHappenInPlaceHolder: null | false | boolean = false;

function updateKeydown(node: HTMLElement) {
  isHappenInPlaceHolder = happenInPlaceHolder(node);
}

/**
 * rewriter event handler
 */
class PlaceholderController extends SylController {

  public eventHandler = {
    handleKeyDown(editor: SylApi, view: any, event: KeyboardEvent) {
      const node = event.target as HTMLElement;
      isHappenInPlaceHolder = happenInPlaceHolder(node);
      return false;
    },
    handleTextInput() {
      return !!isHappenInPlaceHolder;
    },
    handleDOMEvents: {
      dragstart: (editor: SylApi, view: any, event: DragEvent) => {
        const able = getAble(event);
        if (able) {
          // disable drag
          if (able.drag !== true) {
            event.preventDefault();
            return true;
          } else {
            const img = new Image();
            img.src = imgData;
            if (event.dataTransfer) {
              event.dataTransfer.setDragImage(img, 10, 10);
            }
            event.stopPropagation();
          }
        }
        return false;
      }
    },
  }
}

export {
  PlaceholderController,
  updateKeydown
}