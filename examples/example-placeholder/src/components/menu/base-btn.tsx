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
    icon: <CopyIcon/>,
    content: '复制',
    onClick: function (editor: any, index: number) {
      const $para = getCurrPara(editor, index);
      if ($para) {
        editor.dynamicPlugins.copy({ node: $para });
        message.success('复制成功');
      } else {
        message.error('复制失败，请联系相关人员');
      }
    }
  },
  {
    icon: <CutIcon/>,
    content: '剪切',
    onClick: function (editor: any, index: number, length: number) {
      const $para = getCurrPara(editor, index);
      if ($para) {
        editor.dynamicPlugins.copy({ node: $para });
        editor.delete(index, length);
        editor.setSelection({ index });
        message.success('剪切成功');
      } else {
        message.error('剪切失败，请联系相关人员');
      }
    }
  },
  {
    icon: <DeleteIcon/>,
    content: '删除',
    onClick: function (editor: any, index: number, length: number) {
      editor.delete(index, length);
      console.log('delete', index, length);
      editor.setSelection({ index });
      message.success('删除成功');
    }
  }
]

export {
  baseMenu
}