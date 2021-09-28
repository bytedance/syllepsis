import './style.css';

import { EventChannel, SylApi } from '@syllepsis/adapter';
import debounce from 'lodash.debounce';

import { NODE_NAME } from '../../const';
import { closestTable } from '../../utils';

interface IMenuConfig {
  row?: number;
  column?: number;
  cellWith?: number;
  margin?: number;
  defaultColor?: string;
  activeColor?: string;
  trigger?: 'click' | 'hover';
}

interface ISelectedArea {
  row: number;
  column: number;
}

const DEFAULT_TIP = 'rows & columns'; // '选择表格行列数'
const DEFAULT_CONFIG: Required<IMenuConfig> = {
  row: 7,
  column: 7,
  cellWith: 16,
  margin: 2,
  defaultColor: '#F2F2F2',
  activeColor: '#B2D1FF',
  trigger: 'hover',
};

const Cell = (color = '#b2d1ff', width = 16, margin: number) => {
  const blockWidth = width + margin * 2;
  return `'data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" x="${margin}" y="${margin}" viewBox="0 0 ${blockWidth} ${blockWidth}" width="${blockWidth}" height="${blockWidth}"><rect width="${width}" height="${width}" fill="${color}"/></svg>`,
  )}'`;
};

class TableButton {
  private $button: HTMLElement;
  private editor: SylApi;

  // wrapper DOM of menu
  private $wrapper: HTMLElement = document.createElement('div');
  // tip DOM for row & columns
  private $tip: HTMLElement = document.createElement('div');
  private $size: HTMLElement = document.createElement('div');
  private $cellList: HTMLElement = document.createElement('div');
  // background color dom
  private $back: HTMLElement = document.createElement('div');
  // highlight color dom
  private $cover: HTMLElement = document.createElement('div');

  private onSelected: (area: ISelectedArea) => any;
  private menuConfig: Required<IMenuConfig>;

  private _visible = false;

  // not that the `blockWidth` contains margin
  private blockWidth = 0;

  constructor(editor: SylApi, _btn: string | Element, onSelected: (area: ISelectedArea) => any, config?: IMenuConfig) {
    this.editor = editor;
    let btn = _btn;
    if (typeof btn === 'string') {
      btn = document.querySelector(btn)!;
    }
    this.onSelected = onSelected;
    this.menuConfig = Object.assign({}, DEFAULT_CONFIG, config);
    this.blockWidth = this.menuConfig.cellWith + this.menuConfig.margin * 2;
    this.$button = btn as HTMLElement;
    if (!this.$button) return;
    this.$button.classList.add('table-menu-button-before');
    this.renderMenu();
    this.bindEvent();
  }

  get triggerEvent() {
    return this.menuConfig.trigger === 'hover' ? 'mouseenter' : 'click';
  }

  get isInList() {
    return this.$button.className.includes('horizon');
  }

  get visible() {
    return this._visible;
  }

  set visible(vis: boolean) {
    this._visible = vis;
    if (vis) {
      let style = 'position: absolute;display: block;z-index: 99;';
      // vertical button
      if (this.isInList) {
        const top = this.$button.offsetHeight;
        style += `transform: translate(-105%, -${top}px)`;
      }
      this.$wrapper.setAttribute('style', style);
    } else {
      this.$wrapper.setAttribute('style', 'display: none;');
    }
  }

  // the selected area
  private _selectedArea = { row: 0, column: 0 };

  get selectedArea() {
    return this._selectedArea;
  }

  set selectedArea({ row, column }) {
    this.$cover.style.height = `${row * this.blockWidth}px`;
    this.$cover.style.width = `${column * this.blockWidth}px`;

    if (row && column) this.$size.innerText = `${row} x ${column}`;
    else this.$size.innerText = '';

    this._selectedArea = { row, column };
  }
  private renderMenu() {
    const { cellWith, defaultColor, activeColor, row, column, margin } = this.menuConfig;

    this.$wrapper.classList.add('syl-table-menu-wrapper');

    const $tipWrapper = document.createElement('div');
    $tipWrapper.classList.add('syl-table-menu-tip-wrapper');
    this.$wrapper.setAttribute('style', 'display: none;');
    this.$tip.classList.add('syl-table-menu-tip');
    this.$size.classList.add('syl-table-menu-size-tip');
    this.setTip();

    $tipWrapper.appendChild(this.$tip);
    $tipWrapper.appendChild(this.$size);
    this.$wrapper.appendChild($tipWrapper);

    this.$cellList.classList.add('syl-table-menu-list');
    this.$cellList.setAttribute('style', `width: ${column * this.blockWidth}px;height: ${row * this.blockWidth}px;`);
    this.$back.classList.add('syl-table-menu-back');
    this.$cover.classList.add('syl-table-menu-cover');

    this.$back.setAttribute(
      'style',
      `width: 100%;height: 100%;background-image: url(${Cell(defaultColor, cellWith, margin)});`,
    );
    this.$cover.setAttribute(
      'style',
      `position: absolute;top: 0;background-image: url(${Cell(activeColor, cellWith, margin)});`,
    );

    this.$cellList.appendChild(this.$back);
    this.$cellList.appendChild(this.$cover);

    this.$wrapper.appendChild(this.$cellList);
    this.$button.appendChild(this.$wrapper);
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.visible) return;
    const { offsetX, offsetY } = e;
    this.selectedArea = {
      row: Math.ceil(offsetY / this.blockWidth),
      column: Math.ceil(offsetX / this.blockWidth),
    };
  };

  private onAreaClick = (e: Event) => {
    this.onSelected(this.selectedArea);
    this.closeMenu();
    this.menuConfig.trigger === 'click' && e.stopPropagation();
  };

  private closeMenu = debounce(() => {
    this.hideMenu();
    this.selectedArea = { row: 0, column: 0 };
  }, 100);

  private onButtonMouseLeave = (e: MouseEvent) => {
    const related = e.relatedTarget as Node;
    if (!this.$wrapper.contains(related)) {
      this.closeMenu();
    }
  };

  private showMenu = (e: MouseEvent) => {
    if (this.triggerEvent === 'click' && this.isInList) e.stopPropagation();
    if (closestTable(this.editor.view.state.selection.$from)) return;
    this.editor.focus();
    this.visible = true;
  };

  private hideMenu = () => {
    this.visible = false;
  };

  public unMount() {
    this.unBindEvent();
    this.$wrapper.remove();
  }

  private setTip = () => {
    const locale = this.editor.configurator.getLocaleValue(NODE_NAME.TABLE) || {};
    this.$tip.innerText = locale.menuTip || DEFAULT_TIP;
  };

  private bindEvent() {
    if (!this.$button) return;
    this.$button.addEventListener(this.triggerEvent, this.showMenu);
    this.$button.addEventListener('mouseleave', this.onButtonMouseLeave);
    this.$cellList.addEventListener('click', this.onAreaClick);
    this.$cellList.addEventListener('mousemove', this.onMouseMove);
    this.editor.on(EventChannel.LocalEvent.LOCALE_CHANGE, this.setTip);
  }

  private unBindEvent() {
    if (this.$button) {
      this.$button.removeEventListener(this.triggerEvent, this.showMenu);
      this.$button.removeEventListener('mouseleave', this.onButtonMouseLeave);
    }
    if (this.$cellList) {
      this.$cellList.removeEventListener('click', this.onAreaClick);
      this.$cellList.removeEventListener('mousemove', this.onMouseMove);
    }
    this.editor.off(EventChannel.LocalEvent.LOCALE_CHANGE, this.setTip);
  }
}

export { DEFAULT_CONFIG as BUTTON_DEFAULT_CONFIG, IMenuConfig, TableButton };
