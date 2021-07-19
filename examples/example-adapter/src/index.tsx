import { SylApi, SylConfigurator } from '@syllepsis/adapter';

declare global {
  interface Window {
    editor: SylApi;
  }
}

window.editor = new SylApi(new SylConfigurator(document.querySelector('#editor') as HTMLElement, []), {});
