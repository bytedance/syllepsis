import './style.css';

import { IToolbarInlineProps, TMoreContent, TOOL_TYPE, ToolContent } from '@syllepsis/editor';
import cls from 'classnames';
import React, { ReactElement } from 'react';

import { getGroupKey, renderMoreToolButton, renderSylButton } from '../../utils';

class ToolbarInline extends React.Component<IToolbarInlineProps> {
  public renderTool = (
    content: ToolContent,
    depth = 0,
    extra?: { groupKey: string; config?: TMoreContent['contentOption'] },
  ): ReactElement => {
    switch (content.type) {
      case TOOL_TYPE.MORE: {
        const groupKey = getGroupKey(content as TMoreContent);
        return renderMoreToolButton({
          editor: this.props.editor,
          option: this.props.option,
          content: content as TMoreContent,
          depth,
          groupKey,
          toolbarType: 'inline',
          renderMenu: (tools, _depth) =>
            tools.map(tool =>
              this.renderTool(tool, _depth + 1, {
                groupKey,
                config: (content as TMoreContent).contentOption,
              }),
            ),
        });
      }
      default:
        return renderSylButton({
          editor: this.props.editor,
          option: this.props.option,
          activeFormat: this.props.activeFormat,
          content,
          depth,
          toolbarType: 'inline',
          extra,
        });
    }
  };

  render() {
    const { visible, editor, toolbarLib, option } = this.props;
    const { contents } = toolbarLib;
    const { className = '' } = option;

    return (
      <div
        className={cls('syl-toolbar-inline', {
          [className]: className,
          visible,
        })}
        onClick={() => editor.focus()}
      >
        {contents.map(content => this.renderTool(content))}
      </div>
    );
  }
}

export { ToolbarInline };
