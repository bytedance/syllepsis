import { IToolbar, SylApi, Types } from '@syllepsis/adapter';
import { IToolbarOption, TContent, TMoreContent, TOOL_TYPE, TTrigger } from '@syllepsis/editor';
import React from 'react';

import { IProp, MoreForToolbar } from './tools';
import { ButtonForToolbar } from './tools/button';
import { Divider } from './tools/divider';
import { SelectForToolbar } from './tools/select';

const noop = () => {};

enum ToolDisplay {
  HORIZON = 'horizon',
  VERTICAL = 'vertical',
}

type ToolbarType = 'static' | 'inline';

// check whether the content all include the format
const checkFormatAcross = (editor: SylApi, formatName: string) => {
  let hasFormat = true;
  let isTable = false;
  const isNode = Boolean(editor.view.state.schema.nodes[formatName]);
  editor.nodesBetween(node => {
    // if none, the format should be apply
    if (!hasFormat) return false;
    if (node.type.spec.tableRole) isTable = true;
    if (isTable) return false;
    // only care about the top node when isNode format
    if (isNode && node.isBlock && !node.type.spec.isolating) {
      hasFormat = node.type.name === formatName;
      return false;
    } else if (node.isText) {
      hasFormat = node.marks.some(mark => mark.type.name === formatName);
    }
  });
  return isTable || hasFormat;
};

const getGroupKey = (data: TMoreContent) => data.content.map(i => i.name).join('|');

const getToolDisplay = (type?: number) => (type ? ToolDisplay.HORIZON : ToolDisplay.VERTICAL);

// click event of button. `handler` provided by `controller` is prefer. (default is `setFormat`)
const getHandler = (toolbar: IToolbar, callback: IToolbarOption['onToolClick']) => (
  editor: SylApi,
  name?: string,
  attrs?: Types.StringMap<any>,
) => {
  if (!toolbar || !name) return noop;

  if (toolbar.handler) {
    toolbar.handler(editor, name, attrs);
  } else {
    // need to check whether the content all include the format when `attrs` is false and format activated
    editor.setFormat({
      [name]: attrs ? attrs : editor.isActive(name) ? (checkFormatAcross(editor, name) ? false : true) : attrs,
    });
  }

  callback && callback(editor, name);
};

let stamp = 1;
const uuid = () => `${stamp++}`;

interface IRenderSylButton {
  activeFormat: Types.StringMap<any>;
  content: TContent;
  editor: SylApi;
  option: IToolbarOption & Types.StringMap<any>;
  depth?: number; // used to check whether it is displayed in dropdown
  props?: Types.StringMap<any>;
  selectProps?: { trigger: TTrigger } & Types.StringMap<any>;
  buttonProps?: Types.StringMap<any>;
  toolbarType: ToolbarType;
  extra?: { groupKey?: string; config?: TMoreContent['contentOption'] }; // will be provided when in drop
}

const renderSylButton = ({
  activeFormat,
  content,
  editor,
  option,
  depth,
  toolbarType,
  selectProps,
  buttonProps,
  extra = {},
}: IRenderSylButton) => {
  const { name = '', type, toolbar, tooltip, showName } = content;
  const { onToolClick, tipDirection, tipDistance, menuDirection, menuDistance } = option;

  const active = Boolean(activeFormat[name!]);

  const prop: IProp = {
    name,
    toolbar: toolbar!,
    editor,
    showName,
    active,
    tooltip,
    toolbarType,
    tipDirection,
    tipDistance,
    attrs: active ? activeFormat[name] : false,
    display: getToolDisplay(depth),
    handler: getHandler(toolbar!, onToolClick),
  };

  let trigger = option.trigger;
  if (toolbar) {
    if (toolbarType === 'inline' && toolbar.inline && toolbar.inline.trigger) {
      trigger = toolbar.inline.trigger;
    } else if (toolbar.trigger) {
      trigger = toolbar.trigger;
    }
  }

  const { groupKey, config } = extra;

  switch (type) {
    case TOOL_TYPE.DIVIDER:
      return <Divider key={uuid()} />;
    case TOOL_TYPE.SELECT:
    case TOOL_TYPE.DROPDOWN:
      return (
        <SelectForToolbar
          key={`${type}-${name}`}
          trigger={trigger}
          type={type}
          menuDirection={menuDirection}
          menuDistance={menuDistance}
          groupKey={groupKey}
          {...prop}
          {...selectProps}
          {...config}
        />
      );
    case TOOL_TYPE.BUTTON:
    default:
      return <ButtonForToolbar key={`button-${name}`} {...prop} {...buttonProps} {...config} />;
  }
};

interface IRenderMoreButton {
  editor: SylApi;
  content: TMoreContent;
  depth: number;
  toolbarType: ToolbarType;
  option: IToolbarOption;
  groupKey: string;
  renderMenu: (content: Array<TMoreContent | TContent>, depth: number) => JSX.Element[];
}

// render content of dropdown
const renderMoreToolButton = ({
  editor,
  renderMenu,
  option,
  content,
  toolbarType,
  groupKey,
  depth,
}: IRenderMoreButton) => {
  const { menuDistance, menuDirection, trigger, tipDirection, tipDistance } = option;

  const { icon, content: contentItems, tooltip, name = '', trigger: cTrigger } = content;

  return (
    <MoreForToolbar
      trigger={cTrigger || trigger}
      toolbarType={toolbarType}
      name={name}
      icon={icon}
      editor={editor}
      key={name || groupKey || uuid()}
      display={getToolDisplay(depth)}
      tooltip={tooltip}
      menuDistance={content.menuDistance || menuDistance}
      groupKey={groupKey}
      menuDirection={content.menuDirection || menuDirection}
      tipDirection={content.tipDirection || tipDirection}
      tipDistance={content.tipDistance || tipDistance}
      renderMenu={() => renderMenu(contentItems, depth)}
    />
  );
};

export {
  getGroupKey,
  getHandler,
  getToolDisplay,
  noop,
  renderMoreToolButton,
  renderSylButton,
  ToolbarType,
  ToolDisplay,
  uuid,
};
