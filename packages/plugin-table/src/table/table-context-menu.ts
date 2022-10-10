import { SylApi } from '@syllepsis/adapter';
import { NodeType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { CellSelection, isInTable } from 'prosemirror-tables';
import { EditorView } from 'prosemirror-view';

import { NODE_NAME } from './const';
import { calculateMenuPosition, createMenu, formatMenu, TContextMenu } from './menu-helper';
import { closestCell } from './utils';

interface IRect {
  width: number;
  height: number;
}
interface IOptions {
  menus: TContextMenu[];
  editor: SylApi;
  editorView: EditorView;
}

const isInCellSelection = (sel: CellSelection, pos: number) =>
  sel.ranges.some(({ $from, $to }) => pos >= $from.pos && pos <= $to.pos);

class ContextMenuComponent {
  $container: HTMLElement;
  props: IOptions;
  originMenus: TContextMenu[];
  constructor(options: IOptions) {
    this.$container = document.createElement('div');
    this.props = options;
    this.originMenus = options.menus;
    this.bindEvent();
  }

  updateProps(options: Partial<IOptions>) {
    this.props = {
      ...this.props,
      ...options,
    };
    this.create();
  }

  updateMenu() {
    const localeConfig = this.props.editor.configurator.getLocaleValue('table');

    this.updateProps({
      menus: formatMenu(this.props.editor, createMenu({ localeConfig, menus: this.originMenus })),
      editorView: this.props.editorView,
    });
  }

  bindEvent() {
    this.props.editor.root.addEventListener('contextmenu', this._contextmenu, true);
    this.props.editor.root.addEventListener('mousedown', this.preventMouseDown, true);
  }

  unBindEvent() {
    this.props.editor.root.removeEventListener('contextmenu', this._contextmenu, true);
    this.props.editor.root.removeEventListener('mousedown', this.preventMouseDown, true);
  }

  preventMouseDown = (e: MouseEvent) => {
    if (e.button === 2) {
      let $dom = e.target && (e.target as HTMLElement).parentElement;
      while ($dom && this.props.editorView.dom.contains($dom)) {
        if ($dom.tagName === 'TABLE') {
          e.preventDefault();
          break;
        }
        $dom = $dom.parentElement;
      }
    }
  };

  _contextmenu = (e: MouseEvent) => {
    const { editorView } = this.props;
    const { selection, doc, tr } = editorView.state;
    const $dom = e.target && (e.target as HTMLElement).parentElement;
    if (!$dom || !editorView.dom.contains($dom)) return this.hide();
    const pos = editorView.posAtDOM($dom, 0);
    const $pos = doc.resolve(pos);
    const contextNode = $pos.node(1);
    if (!contextNode || contextNode.type.name !== NODE_NAME.TABLE) return this.hide();
    // if it is not in the CellSelection, right click to set a CellSelection
    if (!(selection instanceof CellSelection) || !isInCellSelection(selection, pos)) {
      const selectedCell = closestCell($pos);
      if (selectedCell) {
        // @ts-ignore
        tr.setSelection(CellSelection.create(doc, selectedCell.from));
        editorView.dispatch(tr);
      }
    }
    e.preventDefault();
    e.stopPropagation();
    this.updateMenu();
    this.show(e);
  };

  create = () => {
    this.$container.classList.add('table-context-wrap');
    const child = this._getMenus();
    if (this.$container.children.length) {
      this.$container.removeChild(this.$container.children[0]);
    }
    this.$container.appendChild(child);
  };

  _getMenus() {
    const { menus, editor } = this.props;
    const $dom = document.createElement('ul');
    $dom.classList.add('table-context-menu');
    if (menus && menus.length) {
      menus.forEach(menu => {
        let child: HTMLElement = document.createElement('li');
        if (typeof menu !== 'string') {
          const { name, callback, disable, tip } = menu;
          child.textContent = name;
          const disableFn = typeof disable === 'function' ? disable : () => disable;
          if (disableFn(editor)) {
            child.setAttribute('disable', '1');
          }
          if (tip) {
            child.classList.add('syl-menu-cell', 'pop-tip-left');
            const $span = document.createElement('span');
            $span.innerHTML = tip;
            child.appendChild($span);
          }
          child.onclick = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
            this.hide();
            callback(editor);
            editor.focus();
          };
        } else {
          child = document.createElement('div');
          child.classList.add('menu-split');
        }

        $dom.appendChild(child);
      });
    }
    return $dom;
  }

  private toolbarInlineStatus = false;

  show(e: MouseEvent) {
    const $menu = this.$container;
    $menu.style.display = 'block';
    $menu.style.position = 'absolute';
    const editorDom = document.body;
    if (editorDom && !editorDom.contains(this.$container)) {
      editorDom.appendChild(this.$container);
    }
    const rect: IRect = {
      width: this.$container.clientWidth,
      height: this.$container.clientHeight,
    };
    const cursorRect = {
      clientY: e.clientY,
      clientX: e.clientX,
    };
    const { top, left } = calculateMenuPosition(cursorRect, rect);
    $menu.style.top = `${top}px`;
    $menu.style.left = `${left}px`;
    if (this.props.editor.command.toolbarInline) {
      this.toolbarInlineStatus = this.props.editor.command.toolbarInline.getEnable();
      this.props.editor.command.toolbarInline.disable();
    }
  }

  hide = () => {
    const $menu = this.$container;
    if ($menu && $menu.style) {
      $menu.style.display = 'none';
      if (this.props.editor.command.toolbarInline && this.toolbarInlineStatus) {
        this.props.editor.command.toolbarInline.enable();
      }
    }
  };
}

class TableContextMenu {
  editor: SylApi;
  view: EditorView;
  $contextMenuComponent: ContextMenuComponent;
  type: NodeType;

  constructor(editor: SylApi, editorView: EditorView, menus: TContextMenu[]) {
    this.editor = editor;
    this.view = editorView;
    this.type = editorView.state.schema.nodes[NODE_NAME.TABLE];
    this.$contextMenuComponent = new ContextMenuComponent({
      editor,
      editorView,
      menus,
    });

    this.view.dom.addEventListener('click', this.$contextMenuComponent.hide);
  }

  update(view: EditorView, prevState: EditorState) {
    if (!isInTable(view.state)) this.$contextMenuComponent.hide();
  }

  destroy() {
    this.$contextMenuComponent.unBindEvent();
    this.view.dom.removeEventListener('click', this.$contextMenuComponent.hide);
  }
}

export { IRect, TableContextMenu };
