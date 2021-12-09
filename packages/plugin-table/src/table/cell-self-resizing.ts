import { Node as ProseMirrorNode } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { isInTable, TableMap } from 'prosemirror-tables';

const key = new PluginKey('tableCellSelfResizing');
const tableCellSelfResizing = () => new Plugin({
    key,
    appendTransaction(trs, oldState, state) {
      const { tr, selection } = state;
      try {
        // It is judged that the block card is added to the table
        if (oldState.doc.nodeSize < state.doc.nodeSize && isInTable(oldState) && isInTable(state)) {
          let width = 0;
          trs.some(item => {
            const steps = item.steps;
            if (steps.length) {
              return steps.some(step => {
                // @ts-ignore
                const { slice } = step;
                const { content } = slice;
                return content.content.some((val: ProseMirrorNode) => {
                  if (val.isBlock && val.type !== state.schema.nodes.paragraph && val.attrs.width) {
                    width = val.attrs.width;
                    return true;
                  }
                });
              });
            }
            return false;
          });
          if (width) {
            const $anchor = selection.$anchor;
            let depth = $anchor.depth;
            let cell = $anchor.pos;
            const $tableCell = state.doc.resolve(cell).node(3);
            const currentWidth = $tableCell.attrs.colwidth.reduce((res: number, cur: number) => {
              if (res > cur) return res;
              return cur;
            });

            while (depth > 1) {
              const $current = state.doc.resolve(cell).node();
              if ($current.type === state.schema.nodes.table_row) {
                break;
              }
              cell = state.doc.resolve(cell).before();
              depth = state.doc.resolve(cell).depth;
            }

            if (currentWidth < width) {
              const $cell = state.doc.resolve(cell);
              const table = $cell.node(-1), map = TableMap.get(table), start = $cell.start(-1);
              if (!$cell || !$cell.nodeAfter) return
              const col = map.colCount($cell.pos - start) + $cell.nodeAfter.attrs.colspan - 1;
              for (let row = 0; row < map.height; row++) {
                const mapIndex = row * map.width + col;
                if (row && map.map[mapIndex] === map.map[mapIndex - map.width]) continue;
                // @ts-ignore
                const pos = map.map[mapIndex], { attrs } = table.nodeAt(pos);
                const index = attrs.colspan === 1 ? 0 : col - map.colCount(pos);
                if (attrs.colwidth && attrs.colwidth[index] === width) continue;
                const colwidth = attrs.colwidth ? attrs.colwidth.slice() : zeroes(attrs.colspan);
                colwidth[index] = width;
                tr.setNodeMarkup(start + pos, undefined, setAttr(attrs, 'colwidth', colwidth));
              }
              return tr;
            }
          }
        }
      } catch (e) {
        console.error('cell-self-resizing error:', e);
      }
    },
  });

const zeroes = (n: number) => {
  const result = [];
  for (let i = 0; i < n; i++) result.push(0);
  return result;
}

const setAttr = (attrs: { [key: string]: any }, name: string, value: number) =>{
  const result: any = {};
  for (const prop in attrs) result[prop] = attrs[prop];
  result[name] = value;
  return result;
}

export { key, tableCellSelfResizing };
