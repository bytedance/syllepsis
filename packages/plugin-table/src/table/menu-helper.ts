import { SylApi } from '@syllepsis/adapter';
import cloneDeep from 'lodash.clonedeep';
import { CellSelection } from 'prosemirror-tables';

import { IRect } from './table-context-menu';
import { canSplitCell, tableOperation } from './utils';

type TContextMenu =
  | string
  | {
      name: string;
      key: string;
      disable?: boolean | ((editor: SylApi) => boolean);
      tip?: string;
      callback: (editor: SylApi) => void;
    };

// dynamically change the context menu of the table
const formatMenu = (editor: SylApi, data: TContextMenu[]): TContextMenu[] => {
  const sel = editor.view.state.selection;
  const defaultMenus: TContextMenu[] = cloneDeep(data);
  let menus = defaultMenus.filter(menu => typeof menu === 'string' || menu.key !== 'mergeCells');
  if (sel instanceof CellSelection && sel.ranges.length > 1) {
    menus = defaultMenus.filter(menu => typeof menu === 'string' || menu.key !== 'splitCell');
  } else {
    if (!canSplitCell(editor)) {
      const index = menus.findIndex(menu => typeof menu !== 'string' && menu.key === 'splitCell');
      menus.splice(index, 2);
    }
    if (sel.from === sel.to) {
      menus = menus.map(values => {
        if (typeof values !== 'string' && (values.key === 'cut' || values.key === 'copy')) {
          return {
            ...values,
            disable: true,
          };
        }
        return values;
      });
    }
  }
  return menus;
};

interface CursorRect {
  clientY: number;
  clientX: number;
}

/**
 * @param cursorRect
 * @param domRect
 */
const calculateMenuPosition = (cursorRect: CursorRect, domRect: IRect) => {
  const { clientY, clientX } = cursorRect;
  const { width, height } = domRect;
  const prefixTop = (document.scrollingElement && document.scrollingElement.scrollTop) || 0;
  let top = clientY + prefixTop,
    left = clientX;
  if (clientY + height > window.innerHeight) {
    const offsetTop = 10;
    top = prefixTop - height + window.innerHeight - offsetTop;
    if (top < 0) top = 0;
  }

  if (clientX + width > window.innerWidth) {
    left = window.innerWidth - width;
  }

  return {
    top,
    left,
  };
};

interface ITableMenuLocale {
  cut: string;
  copy: string;
  paste: string;
  mergeCells: string;
  splitCell: string;
  addColumnBefore: string;
  addColumnAfter: string;
  addRowBefore: string;
  addRowAfter: string;
  deleteRow: string;
  deleteColumn: string;
  deleteTable: string;
}

const defaultMenuLocale: ITableMenuLocale = {
  cut: 'cut', // '剪切',
  copy: 'copy', // '复制',
  paste: 'paste', // '粘贴',
  mergeCells: 'merge cells', // '合并单元格',
  splitCell: 'split cell', // '拆分单元格',
  addColumnBefore: 'add column before', // '左边插入列',
  addColumnAfter: 'add column after', // '右边插入列',
  addRowBefore: 'add row before', // '上边插入行',
  addRowAfter: 'add row after', // '下边插入行',
  deleteRow: 'delete row', // '删除当前行',
  deleteColumn: 'delete column', // '删除当前列',
  deleteTable: 'delete table', // '删除表格',
};

interface ICreateMenuOptions {
  localeConfig?: ITableMenuLocale;
  menus?: TContextMenu[];
}

const createMenu = (options: ICreateMenuOptions): Array<TContextMenu> => {
  const { localeConfig = defaultMenuLocale, menus = defaultTableMenus } = options;
  const locale = Object.assign({}, defaultMenuLocale, localeConfig || {});

  return menus.map(menu => {
    if(typeof menu === 'string') return menu;
    const menuObject = menu as Exclude<TContextMenu, string>;
    const key = menuObject.key as keyof ITableMenuLocale;
    return {
      ...menu,
      name: locale[key] || menuObject.name,
    };
  });
};

const defaultTableMenus = [
  {
    name: defaultMenuLocale.cut,
    key: 'cut',
    callback: tableOperation.cut,
  },
  {
    name: defaultMenuLocale.copy,
    key: 'copy',
    callback: tableOperation.copy,
  },
  {
    name: defaultMenuLocale.paste,
    key: 'paste',
    disable: true,
    tip: `请使用 <b>${/Mac/.test(navigator.platform) ? '⌘+V' : 'Ctrl+V'}</b> 粘贴`,
    callback: () => {},
  },
  '|',
  {
    name: defaultMenuLocale.mergeCells,
    key: 'mergeCells',
    callback: tableOperation.mergeCells,
  },
  {
    name: defaultMenuLocale.splitCell,
    key: 'splitCell',
    callback: tableOperation.splitCells,
  },
  '|',
  {
    name: defaultMenuLocale.addColumnBefore,
    key: 'addColumnBefore',
    callback: tableOperation.addColumnBefore,
  },
  {
    name: defaultMenuLocale.addColumnAfter,
    key: 'addColumnAfter',
    callback: tableOperation.addColumnAfter,
  },
  {
    name: defaultMenuLocale.addRowBefore,
    key: 'addRowBefore',
    callback: tableOperation.addRowBefore,
  },
  {
    name: defaultMenuLocale.addRowAfter,
    key: 'addRowAfter',
    callback: tableOperation.addRowAfter,
  },
  '|',
  {
    name: defaultMenuLocale.deleteRow,
    key: 'deleteRow',
    callback: tableOperation.deleteRow,
  },
  {
    name: defaultMenuLocale.deleteColumn,
    key: 'deleteColumn',
    callback: tableOperation.deleteColumn,
  },
  {
    name: defaultMenuLocale.deleteTable,
    key: 'deleteTable',
    callback: tableOperation.deleteTable,
  },
];

export { calculateMenuPosition, canSplitCell, createMenu, defaultTableMenus, formatMenu, TContextMenu };
