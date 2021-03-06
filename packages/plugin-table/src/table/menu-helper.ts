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
      disable?: boolean;
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
  cut: 'cut', // '??????',
  copy: 'copy', // '??????',
  paste: 'paste', // '??????',
  mergeCells: 'merge cells', // '???????????????',
  splitCell: 'split cell', // '???????????????',
  addColumnBefore: 'add column before', // '???????????????',
  addColumnAfter: 'add column after', // '???????????????',
  addRowBefore: 'add row before', // '???????????????',
  addRowAfter: 'add row after', // '???????????????',
  deleteRow: 'delete row', // '???????????????',
  deleteColumn: 'delete column', // '???????????????',
  deleteTable: 'delete table', // '????????????',
};

const createMenu = (localeConfig: ITableMenuLocale): Array<TContextMenu> => {
  const locale = Object.assign({}, defaultMenuLocale, localeConfig);

  return [
    {
      name: locale.cut,
      key: 'cut',
      callback: tableOperation.cut,
    },
    {
      name: locale.copy,
      key: 'copy',
      callback: tableOperation.copy,
    },
    {
      name: locale.paste,
      key: 'paste',
      disable: true,
      tip: `????????? <b>${/Mac/.test(navigator.platform) ? '???+V' : 'Ctrl+V'}</b> ??????`,
      callback: () => {},
    },
    '|',
    {
      name: locale.mergeCells,
      key: 'mergeCells',
      callback: tableOperation.mergeCells,
    },
    {
      name: locale.splitCell,
      key: 'splitCell',
      callback: tableOperation.splitCells,
    },
    '|',
    {
      name: locale.addColumnBefore,
      key: 'addColumnBefore',
      callback: tableOperation.addColumnBefore,
    },
    {
      name: locale.addColumnAfter,
      key: 'addColumnAfter',
      callback: tableOperation.addColumnAfter,
    },
    {
      name: locale.addRowBefore,
      key: 'addRowBefore',
      callback: tableOperation.addRowBefore,
    },
    {
      name: locale.addRowAfter,
      key: 'addRowAfter',
      callback: tableOperation.addRowAfter,
    },
    '|',
    {
      name: locale.deleteRow,
      key: 'deleteRow',
      callback: tableOperation.deleteRow,
    },
    {
      name: locale.deleteColumn,
      key: 'deleteColumn',
      callback: tableOperation.deleteColumn,
    },
    {
      name: locale.deleteTable,
      key: 'deleteTable',
      callback: tableOperation.deleteTable,
    },
  ];
};

export { calculateMenuPosition, canSplitCell, createMenu, formatMenu, TContextMenu };
