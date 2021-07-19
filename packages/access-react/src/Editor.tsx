import { SylApi } from '@syllepsis/adapter';
import { ISylEditorProps, SylEditorService } from '@syllepsis/editor';
import React from 'react';

import { moduleOption } from './modules/utils';
import { ReactRenderer } from './render-bridge';

class SylEditor extends React.Component<ISylEditorProps> {
  public mountDOM = React.createRef<HTMLDivElement>();
  public editor: SylApi | null = null;

  public componentDidMount() {
    if (!this.editor && this.mountDOM && this.mountDOM.current) {
      this.handleModule(this.props.module);
      this.editor = SylEditorService.init(this.mountDOM.current, this.props);
    }
  }

  private handleModule(modulesConfig: ISylEditorProps['module']) {
    if (modulesConfig) {
      Object.keys(modulesConfig).forEach(key => {
        if (!modulesConfig[key].option) return;
        modulesConfig[key].option = {
          RenderBridge: ReactRenderer,
          ...moduleOption[key],
          ...modulesConfig[key].option,
        };
      });
    }
  }

  public shouldComponentUpdate(nextProps: ISylEditorProps) {
    if (!this.editor || this.editor.isDestroy) return true;
    SylEditorService.updateConfig(this.editor, nextProps);
    return true;
  }

  public render() {
    return <div className="syl-editor" ref={this.mountDOM} style={{ position: 'relative' }} />;
  }

  public componentWillUnmount() {
    if (this.editor) {
      this.editor.uninstall();
    }
  }
}

export { SylEditor };
