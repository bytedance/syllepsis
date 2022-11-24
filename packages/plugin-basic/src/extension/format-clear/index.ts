import { SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import isEqual from 'lodash.isequal';
import { Mark } from 'prosemirror-model';

const PLUGIN_NAME = 'format_clear';

const filterMark = (marks: Mark[]) => marks.filter(mark => !mark.type.spec.notClear);

class FormatClearController extends SylController {
  public isDisable = false;

  public toolbar = {
    className: PLUGIN_NAME,
    tooltip: PLUGIN_NAME,
    handler(editor: SylApi) {
      editor.clearFormat();
    },
  };

  public keymap = {
    'Mod-e': (editor: SylApi) => {
      if (this.isDisable) return false;
      editor.clearFormat();
      return true;
    },
  };

  public disable = (editor: SylApi) => {
    const { storedMarks, selection } = editor.view.state;
    const { $from } = selection;

    // storedMarks are prefer than $from.marks
    if (storedMarks && filterMark(storedMarks.slice()).length) return false;
    if (!storedMarks && filterMark($from.marks().slice()).length) return false;

    const marks = [];
    editor.nodesBetween(node => {
      if (marks.length) return false;
      if (node.inlineContent && !isEqual(node.attrs, node.type.defaultAttrs)) {
        marks.push(true);
      }
      if (node.isInline && node.marks.length) {
        marks.push(...filterMark(node.marks.slice()));
      }
      return undefined;
    });

    this.isDisable = !marks.length;
    return this.isDisable;
  };
}

class FormatClearPlugin extends SylPlugin {
  public name = PLUGIN_NAME;
  public Controller = FormatClearController;
}

export { FormatClearController, FormatClearPlugin };
