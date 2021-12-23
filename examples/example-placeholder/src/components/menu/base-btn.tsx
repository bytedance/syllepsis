import { message } from 'antd';
import React from 'react';

import { CopyIcon, CutIcon, DeleteIcon } from './icon';
import { getValidParaNode, isRoot } from './panel';

function getCurrPara(editor: any, index: number) {
  const node = editor.view.domAtPos(index).node;
  if (!node || isRoot(node)) {
    return editor.view.nodeDOM(index);
  }
  return getValidParaNode(node).node;
}

const baseMenu = [
  {
    icon: <CopyIcon />,
    content: 'Copy',
    onClick: function(editor: any, index: number) {
      const $para = getCurrPara(editor, index);
      if ($para) {
        editor.dynamicPlugins.copy({ node: $para });
        message.success('Copy Success');
      } else {
        message.error('Copy Failure');
      }
    },
  },
  {
    icon: <CutIcon />,
    content: 'Cut',
    onClick: function(editor: any, index: number, length: number) {
      const $para = getCurrPara(editor, index);
      if ($para) {
        editor.dynamicPlugins.copy({ node: $para });
        editor.delete(index, length);
        editor.setSelection({ index });
        message.success('Cut Success');
      } else {
        message.error('Cut Failure');
      }
    },
  },
  {
    icon: <DeleteIcon />,
    content: 'Delete',
    onClick: function(editor: any, index: number, length: number) {
      editor.delete(index, length);
      console.log('delete', index, length);
      editor.setSelection({ index });
      message.success('Delete Success');
    },
  },
];

export {
  baseMenu,
};