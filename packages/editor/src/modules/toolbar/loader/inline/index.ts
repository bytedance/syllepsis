import { BaseModule, EventChannel, SylApi, Types } from '@syllepsis/adapter';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { AllSelection, NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { IRenderer } from '../../../../renderer';
import { IToolbarOption } from '../../..';
import { ToolbarLib } from '../..';

declare module '@syllepsis/adapter' {
  interface ISylApiCommand {
    toolbarInline?: {
      show: () => void;
      hide: () => void;
      getVisible: () => boolean;
      enable: () => void;
      disable: () => void;
      getEnable: () => boolean;
    };
  }
}

interface IToolbarInlineOption extends Omit<IToolbarOption, 'mount' | 'showNames'> {
  threshold?: { top?: number; left?: number; right?: number; bottom?: number }; // min thread
  judgeShow?: (editor: SylApi) => boolean;
  zIndex?: number;
}

interface IToolbarInlineProps {
  editor: SylApi;
  option: IToolbarInlineOption;
  visible: boolean;
  activeFormat: Types.StringMap<any>;
  toolbarLib: ToolbarLib;
}

const IGNORE_CLOSE_ATTRIBUTE = 'data-syl-toolbar';

// needs special treatment of rect, otherwise the value of top and bottom are the same
const getPosRect = (view: EditorView, pos: number) => {
  // CellSelection
  // @ts-ignore
  if (view.state.selection.$anchorCell) {
    return (view.domAtPos(pos).node as HTMLElement).getBoundingClientRect();
  }
  return view.coordsAtPos(pos);
};

/**
 * - positioning rules of InlineToolbar
 *  + vertical position is based on the selection area, horizon position is based on mouse position
 *  + display when there is text content, and display it at the top of the selection area first
 *  + When selecting across rows, it will be displayed above or below according to the position where the mouse is released
 *  + Drag to select. When the position where the mouse is released is too far from the selection, it will be displayed at the position where the mouse is released first, and keep the left and right positions
 *  + in other cases where there is a selection area but no `InlineToolbar`, move the mouse to appear, centered on the mouse position
 */
class ToolbarInlineLoader extends BaseModule<IToolbarInlineOption> {
  public bridge: IRenderer<IToolbarInlineProps>;
  private dom: HTMLElement;
  private _visible = true;
  private mousedown = false;
  private preferDir: 'up' | 'down' = 'up'; // stay above or below the selection
  private preferLeft: 'fixed' | 'auto' = 'auto'; // whether to recalculate the left position or fixed
  private _isEnable = true;

  // stored click element because document.activeElement not works well in safari
  private lastClickElement: Element | null = null;

  get isEnable() {
    return this._isEnable;
  }

  set isEnable(val) {
    if (val === this._isEnable) return;
    if (!val) this.visible = false;
    this._isEnable = val;
  }

  get visible() {
    return this._visible;
  }

  set visible(val) {
    if (!val && this._visible === val) return;
    this._visible = val;

    const newProps: Partial<IToolbarInlineProps> = { visible: val };
    if (val) {
      this.dom.style.display = 'block';
      newProps.activeFormat = this.updateFormat(false) as Types.StringMap<any>;

      // synchronize the displayed position when the state changes
      this.adapter.on(EventChannel.LocalEvent.ON_CHANGE, this.tracePos);
      this.adapter.view.dom.removeEventListener('mousemove', this.checkShow);
    } else {
      this.dom.style.display = 'none';

      this.adapter.off(EventChannel.LocalEvent.ON_CHANGE, this.tracePos);
      // in the case of undo, redo, paste, etc., determine whether it needs to be displayed
      this.adapter.view.dom.addEventListener('mousemove', this.checkShow);
    }

    // render the dom first, then update the props for achieve the animation
    requestAnimationFrame(() => this.bridge.setProps(newProps));
  }

  get threshold(): Required<Required<IToolbarInlineOption>['threshold']> {
    return {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      ...(this.option.threshold || {}),
    };
  }

  constructor(adapter: SylApi, originOption: IToolbarInlineOption) {
    super(adapter, { ...originOption });
    const option = { ...originOption };
    this.option = option;

    this.dom = document.createElement('div');
    adapter.root.appendChild(this.dom);
    this.dom.style.position = 'absolute';
    this.dom.style.userSelect = 'none';
    this.dom.style.display = 'none';
    this.dom.style.zIndex = `${option.zIndex || 100}`;
    this.visible = false;
    this.bridge = new option.RenderBridge(adapter, option.Component, this.dom, 'toolbarInline');

    this.bindEvent();
    this.render();

    adapter.addCommand('toolbarInline', {
      show: () => this.tracePos(undefined, true),
      hide: this.hide,
      getVisible: () => this.visible,
      getEnable: () => this.isEnable && this.adapter.editable,
      enable: this.enable,
      disable: this.disable,
    });
  }

  enable = () => {
    this.isEnable = true;
  };

  disable = () => {
    this.isEnable = false;
  };

  updateFormat(exec = true) {
    const activeFormat = this.adapter.getFormat();
    return exec ? this.bridge.setProps({ activeFormat }) : activeFormat;
  }

  show = () => {
    this.visible = true;
  };

  hide = () => {
    this.visible = false;
  };

  handleMouseUp = (e: any) => {
    // only handle the case where the mouse is pressed in the editor
    if (!this.mousedown) return;
    this.mousedown = false;
    this.tracePos(e, true);
  };

  handleMouseDown = (e: Event) => {
    const button = (e as MouseEvent).button;
    if (button !== 2) {
      this.mousedown = true;
      this.hide();
    }
  };

  tracePos = debounce((e?: MouseEvent, force?: boolean) => {
    if (!this.isEnable || !this.adapter.editable) {
      if (this.visible) this.visible = false;
      return;
    }
    if (this.mousedown) return;
    const { view } = this.adapter;
    const { state } = view;
    const { from, to, empty } = state.selection;

    if (
      empty ||
      !this.adapter.getText({ index: from, length: to - from }).trim() ||
      this.adapter.view.state.selection instanceof NodeSelection ||
      (this.option.judgeShow && !this.option.judgeShow(this.adapter))
    ) {
      this.hide();
      return;
    }

    const visible = this.visible;
    const dir = visible ? this.preferDir : undefined;
    this.show();
    this.dom.style.visibility = 'hidden';

    // calculate the position based on the width and height and the position on the screen, remember to consider the position of the editor itself
    requestAnimationFrame(() => {
      let { $head, $anchor } = state.selection;

      if (state.selection instanceof AllSelection) {
        $anchor = state.doc.resolve(1);
        let endPos = state.doc.nodeSize - 1;
        while (endPos--) {
          $head = state.doc.resolve(endPos);
          if ($head.node().isTextblock) break;
        }
        // display at the top when in table
        // @ts-ignore
      } else if (state.selection.$anchorCell) {
        const ranges = state.selection.ranges.sort((a, b) => a.$from.pos - b.$from.pos);
        $anchor = ranges[0].$from;
        $head = ranges[0].$to;
      }

      const { top: thresholdTop, left: thresholdLeft, right: thresholdRight, bottom: thresholdBottom } = this.threshold;
      const { top: headTop, left: headLeft, bottom: headBottom } = getPosRect(view, $head.pos);
      const { bottom: anchorBottom, top: anchorTop } = getPosRect(view, $anchor.pos);

      const topPos = Math.min(headTop, anchorTop); // the top position of the selection area
      const bottomPos = Math.max(headBottom, anchorBottom); // the bottom position of the selection area

      const { offsetHeight, offsetWidth, offsetLeft } = this.dom;
      const domOffsetLeft = offsetWidth / 2;
      const { top: editorTop, left: editorLeft, right: editorRight } = this.adapter.root.getBoundingClientRect();

      const maxTop = window.innerHeight - offsetHeight - thresholdBottom;
      const minLeft = thresholdLeft;
      const maxLeft = editorRight - editorLeft - offsetWidth - thresholdRight; // The largest left, related to `thresholdRight`
      const defaultLeft = headLeft - domOffsetLeft - editorLeft; // align the left of the head position in the center

      let computedTop = topPos - offsetHeight - 8;
      this.preferDir = 'up';
      // less than the `thresholdTop`, when selected across rows and not displayed, it will be judged according to the position of the head and anchor and displayed at the bottom
      if (
        computedTop < thresholdTop ||
        (dir !== 'up' && Math.abs(anchorBottom - headBottom) > 12 && $head.pos > $anchor.pos)
      ) {
        computedTop = bottomPos + 8;
        this.preferDir = 'down';
      }

      // exceed the `maxTop`, displayed on the top
      if (computedTop > maxTop) {
        computedTop = topPos - offsetHeight - 8;
        this.preferDir = 'up';
      }

      this.dom.style.top = `${computedTop - editorTop}px`;

      // MouseEvent or directly invoke
      if (e instanceof Event || !visible) {
        let target: any;
        let pageX: any;

        if (e instanceof Event) {
          target = e.target;
          pageX = e.pageX;
        } else {
          target = this.adapter.view.dom;
          pageX = domOffsetLeft;
        }

        if (this.adapter.view.dom.contains(target as HTMLElement)) {
          const mouseLeft = (visible ? offsetLeft + editorLeft : pageX - domOffsetLeft) - editorLeft; // mouse left position, if it is visible at this time, it should remain

          let computedLeft = defaultLeft;
          this.preferLeft = 'auto';

          // determine whether to use the cursor position or the mouse position(magic-number)
          if (Math.abs(mouseLeft - defaultLeft) >= 20) {
            computedLeft = mouseLeft;
            this.preferLeft = 'fixed';
          }

          if (computedLeft >= maxLeft) {
            this.preferLeft = 'auto';
            computedLeft = maxLeft;
          } else if (computedLeft <= minLeft) {
            this.preferLeft = 'auto';
            computedLeft = minLeft;
          }

          this.dom.style.left = `${computedLeft}px`;
        }
      } else if (force || this.preferLeft === 'auto') {
        this.preferLeft = 'auto';
        // force to adjust the position when refreshing, indenting, and undoing
        this.dom.style.left = `${Math.min(maxLeft, Math.max(minLeft, defaultLeft))}px`;
      }
      this.dom.style.visibility = '';
    });
  }, 20);

  // in other cases, check whether the toolbar needs to be displayed
  checkShow = throttle((e: any) => {
    if (this.visible || !this.adapter.isFocused) {
      return;
    }
    this.tracePos(e);
  }, 20);

  checkHide = debounce(() => {
    if (
      !this.adapter.isFocused &&
      this.lastClickElement &&
      !this.dom.contains(this.lastClickElement) &&
      !this.lastClickElement.closest(IGNORE_CLOSE_ATTRIBUTE)
    ) {
      this.hide();
    }
  }, 300);

  storedClick = (e: MouseEvent) => (this.lastClickElement = e.target as Element);

  bindEvent() {
    document.body.addEventListener('mouseup', this.handleMouseUp);
    document.body.addEventListener('click', this.storedClick);
    this.adapter.view.dom.addEventListener('mousedown', this.handleMouseDown);
    // do not trigger `mouseUp` when drop
    this.adapter.root.addEventListener('drop', this.handleMouseUp);
    this.adapter.on(EventChannel.LocalEvent.ON_BLUR, this.checkHide);
    this.adapter.on(EventChannel.LocalEvent.CONFIG_PLUGIN_CHANGE, this.render);
  }

  public setProps(option: IToolbarInlineOption) {
    this.option = { ...this.option, ...option };
    this.render();
  }

  public render = () => {
    this.bridge.setProps({
      editor: this.adapter,
      option: this.option,
      visible: this.visible,
      activeFormat: this.adapter.getFormat(),
      toolbarLib: new ToolbarLib({ editor: this.adapter, option: this.option }),
    });
  };

  public destructor() {
    document.body.removeEventListener('mouseup', this.handleMouseUp);
    document.body.removeEventListener('click', this.storedClick);
    this.adapter.view.dom.removeEventListener('mousedown', this.handleMouseDown);
    this.adapter.off(EventChannel.LocalEvent.ON_BLUR, this.checkHide);
    this.adapter.off(EventChannel.LocalEvent.CONFIG_PLUGIN_CHANGE, this.render);
    this.adapter.root.removeEventListener('drop', this.handleMouseUp);
    this.adapter.root.removeChild(this.dom);
    this.bridge.unmount();
  }
}

export { IToolbarInlineOption, IToolbarInlineProps, ToolbarInlineLoader };
