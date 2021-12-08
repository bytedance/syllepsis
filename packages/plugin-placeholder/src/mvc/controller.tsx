import { SylController } from '@syllepsis/adapter';

import { imgData } from '../img/drag';

function getAble(event: any) {
  try {
    const data = JSON.parse(event.target.querySelector('templ div').dataset.cardData);
    if (data.meta.able) {
      return data.meta.able;
    } else {
      return false;
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
    handleKeyDown(editor: any, view: any, event: any) {
      isHappenInPlaceHolder = happenInPlaceHolder(event.target);
      return false;
    },
    handleTextInput(editor: any) {
      return !!isHappenInPlaceHolder;
    },
    handleDOMEvents: {
      dragstart: (editor: any, view: any, event: any) => {
        const able = getAble(event);
        if (able) {
          // disable drag
          if (able.drag !== true) {
            event.preventDefault();
            return true;
          } else {
            const img = new Image();
            img.src = imgData;
            event.dataTransfer.setDragImage(img, 10, 10);
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