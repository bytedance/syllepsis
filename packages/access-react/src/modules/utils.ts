import { IToolbarOption } from '@syllepsis/editor';

import { Toolbar, ToolbarInline } from './toolbar';

const toolbar: Omit<IToolbarOption, 'RenderBridge'> = {
  menuDirection: 'down-start',
  menuDistance: 4,
  tools: [],
  icons: {},
  tooltips: {},
  showNames: {},
  Component: Toolbar
};

const toolbarInline: Omit<IToolbarOption, 'RenderBridge'> = {
  menuDirection: 'up',
  menuDistance: 18,
  tipDirection: 'up',
  tipDistance: 18,
  tools: [],
  Component: ToolbarInline
};

const moduleOption: Record<string, Omit<IToolbarOption, 'RenderBridge'>> = {
  toolbar,
  toolbarInline
};

export { moduleOption };
