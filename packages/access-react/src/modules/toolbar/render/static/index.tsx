import './style.css';

import { EventChannel } from '@syllepsis/adapter';
import { IToolbarStaticProps, TCustomContent, TMoreContent, TOOL_TYPE, ToolContent } from '@syllepsis/editor';
import debounce from 'lodash.debounce';
import React from 'react';

import { CustomButton } from '../../tools';
import { getGroupKey, renderMoreToolButton, renderSylButton } from '../../utils';

interface IToolbarState {
  activeFormat: any;
}
class Toolbar extends React.Component<IToolbarStaticProps, IToolbarState> {
  public autoUpdate: () => any;

  constructor(props: IToolbarStaticProps) {
    super(props);

    this.state = {
      activeFormat: {},
    };
    this.autoUpdate = debounce(() => this.updateFormats(), 300, {
      leading: true,
    });
  }

  public componentDidMount() {
    this.props.editor.on(EventChannel.LocalEvent.ON_CHANGE, this.autoUpdate);
  }

  public updateFormats = () => {
    const format = this.props.editor.getFormat();
    if (!format) return;
    this.setState({
      activeFormat: format,
    });
  };

  public renderCustomTool = (content: TCustomContent) => (
    <CustomButton key={`custom-${content.name}`} {...content} editor={this.props.editor} />
  );

  public renderTool = (
    content: ToolContent,
    depth = 0,
    extra?: { groupKey: string; config?: TMoreContent['contentOption'] },
  ): JSX.Element => {
    switch (content.type) {
      case TOOL_TYPE.CUSTOM: {
        return this.renderCustomTool(content as TCustomContent);
      }
      case TOOL_TYPE.MORE: {
        const groupKey = getGroupKey(content as TMoreContent);
        return renderMoreToolButton({
          editor: this.props.editor,
          content: content as TMoreContent,
          depth,
          option: this.props.option,
          toolbarType: 'static',
          groupKey,
          renderMenu: (tools, _depth) =>
            tools.map(tool =>
              this.renderTool(tool, _depth + 1, {
                groupKey,
                config: (content as TMoreContent).contentOption,
              }),
            ),
        });
      }
      default: {
        return renderSylButton({
          editor: this.props.editor,
          option: this.props.option,
          activeFormat: this.state.activeFormat,
          content,
          toolbarType: 'static',
          depth,
          extra,
        });
      }
    }
  };

  public componentDidCatch(error: Error) {
    this.props.editor.onError(error);
  }

  public render() {
    const { contents, editor } = this.props.toolbarLib;
    return (
      <div className="syl-toolbar" onClick={e => !e.cancelable && editor.focus()}>
        {contents.map(content => this.renderTool(content))}
      </div>
    );
  }
}

export { Toolbar };
