import { EditorState } from 'prosemirror-state';
import { dropPoint } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

type TDropRelatedEvent = 'dragover' | 'dragend' | 'drop' | 'dragleave';

type TDropCursorConfig = boolean | { width?: number; color?: string };

class DropCursorView {
  public editorView: EditorView;
  public class: string;
  public cursorPos: any;
  public element: any;
  public timeout: any;
  public config = { width: 1, color: '#000000' };
  public handlers: { name: TDropRelatedEvent; handler: any }[];

  constructor(editorView: EditorView, config: TDropCursorConfig = {}) {
    this.editorView = editorView;
    this.class = 'syl-drop-cursor';
    this.cursorPos = null;
    this.element = null;
    this.timeout = null;
    Object.assign(this.config, config);

    this.handlers = (['dragover', 'dragend', 'drop', 'dragleave'] as TDropRelatedEvent[]).map(name => {
      const handler = (e: any) => this[name](e);
      editorView.dom.addEventListener(name, handler);
      return { name, handler };
    });
  }

  destroy() {
    this.handlers.forEach(({ name, handler }) => this.editorView.dom.removeEventListener(name, handler));
  }

  update(editorView: EditorView, prevState: EditorState) {
    if (this.cursorPos !== null && prevState.doc !== editorView.state.doc) {
      this.updateOverlay();
    }
  }

  setCursor(pos: number | null) {
    if (pos === this.cursorPos) return;
    this.cursorPos = pos;
    if (pos === null) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    } else {
      this.updateOverlay();
    }
  }

  updateOverlay() {
    const $pos = this.editorView.state.doc.resolve(this.cursorPos);
    let rect;
    // do not drag from textblock (different cursor)
    if (!$pos.parent.inlineContent) {
      const before = $pos.nodeBefore;
      const after = $pos.nodeAfter;
      if (before || after) {
        const beforeDOM = this.editorView.nodeDOM(this.cursorPos - (before ? before.nodeSize : 0));
        const beforeRect = (beforeDOM as Element).getBoundingClientRect();
        let top = before ? beforeRect.bottom : beforeRect.top;
        if (before && after) {
          const curDOM = this.editorView.nodeDOM(this.cursorPos);
          if (curDOM) {
            const curRect = (curDOM as Element).getBoundingClientRect();
            top = (top + curRect.top) / 2;
          }
        }
        rect = {
          left: beforeRect.left,
          right: beforeRect.right,
          top: top - this.config.width / 2,
          bottom: top + this.config.width / 2,
        };
      }
    }
    if (!rect) {
      const coords = this.editorView.coordsAtPos(this.cursorPos);
      rect = {
        left: coords.left - this.config.width / 2,
        right: coords.left + this.config.width / 2,
        top: coords.top,
        bottom: coords.bottom,
      };
    }

    const parent = (this.editorView.dom as HTMLElement).offsetParent;
    if (!this.element && parent) {
      this.element = parent.appendChild(document.createElement('div'));
      if (this.class) this.element.className = this.class;
      this.element.style.cssText = `position: absolute; z-index: 50; pointer-events: none;background-color: ${this.config.color}`;
    }
    const parentRect =
      !parent || (parent === document.body && getComputedStyle(parent).position === 'static')
        ? { left: -pageXOffset, top: -pageYOffset }
        : parent.getBoundingClientRect();
    this.element.style.left = rect.left - parentRect.left + 'px';
    this.element.style.top = rect.top - parentRect.top + 'px';
    this.element.style.width = rect.right - rect.left + 'px';
    this.element.style.height = rect.bottom - rect.top + 'px';
  }

  scheduleRemoval(timeout: number) {
    clearTimeout(this.timeout!);
    this.timeout = setTimeout(() => this.setCursor(null), timeout);
  }

  dragover(event: DragEvent) {
    if (!(this.editorView as any).editable) return;
    const pos = this.editorView.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    });
    if (pos) {
      let target: number | null | undefined = pos.pos;
      if (this.editorView.dragging && this.editorView.dragging.slice) {
        target = dropPoint(this.editorView.state.doc, target, this.editorView.dragging.slice);
        if (typeof target !== 'number') target = pos.pos;
      }
      this.setCursor(target);
      this.scheduleRemoval(5000);
    }
  }

  dragend() {
    this.scheduleRemoval(20);
  }

  drop() {
    clearTimeout(this.timeout!);
    this.setCursor(null);
  }

  dragleave(event: DragEvent) {
    if (event.target === this.editorView.dom || !this.editorView.dom.contains(event.relatedTarget as Node)) {
      this.setCursor(null);
    }
  }
}

export { DropCursorView, TDropCursorConfig };
