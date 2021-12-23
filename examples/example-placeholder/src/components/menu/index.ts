import { IDynamicSylApi } from '@syllepsis/plugin-placeholder';

export async function initTools(editor: IDynamicSylApi) {
  const module = await import(/* webpackChunkName: "HoverMenu.chunk" */'./panel');
  await module.init(editor);
}
