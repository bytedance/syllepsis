import { IToolbarOption } from '@syllepsis/editor';

import { Toolbar, ToolbarInline } from './toolbar';

const toolbar: Omit<IToolbarOption, 'RenderBridge'> = {
  menuDistance: 12,
  tools: [],
  icons: {},
  tooltips: {},
  showNames: {},
  Component: Toolbar,
};

const toolbarInline: Omit<IToolbarOption, 'RenderBridge'> = {
  menuDistance: 18,
  tipDirection: 'up',
  tipDistance: 18,
  tools: [],
  Component: ToolbarInline,
};

const moduleOption: Record<string, Omit<IToolbarOption, 'RenderBridge'>> = {
  toolbar,
  toolbarInline,
};

export { moduleOption };
