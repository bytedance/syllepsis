import { SylApi, SylController, SylPlugin } from '@syllepsis/adapter';

const PLUGIN_NAME = 'undo';

class UndoController extends SylController {
  public name = PLUGIN_NAME;

  public toolbar = {
    handler: (editor: SylApi) => editor.undo()
  };
  public disable = (editor: SylApi) => !editor.undoable;
}

class UndoPlugin extends SylPlugin {
  public name = PLUGIN_NAME;
  public Controller = UndoController;
}

export { UndoPlugin };
