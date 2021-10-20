import { SylController, SylPlugin } from '../../../packages/adapter/dist/es';

class AsyncController extends SylController<any> {
  public command = {
    test: () => true,
  };
}

class AsyncControllerPlugin extends SylPlugin<any> {
  public name = 'async_controller';
  public asyncController = async () => AsyncController;
}

export { AsyncControllerPlugin };
