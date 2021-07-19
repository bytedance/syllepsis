import { SylApi, SylController, SylPlugin } from '@syllepsis/adapter';

const PLUGIN_NAME = 'redo';

class UndoController extends SylController {
  public name = PLUGIN_NAME;

  public toolbar = {
    handler: (editor: SylApi) => editor.redo()
  };
  public disable = (editor: SylApi) => !editor.redoable;
}

class RedoPlugin extends SylPlugin {
  public name = PLUGIN_NAME;
  public Controller = UndoController;
}

export { RedoPlugin };
