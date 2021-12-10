export async function initTools(editor: any) {
  const module = await import(/* webpackChunkName: "HoverMenu.chunk" */'./panel');
  await module.init(editor);
}
