import { Plugin } from 'prosemirror-state';

interface ICtrlPluginCtrl<T> {
  register: (props: T) => void;
  unregister: (props: T) => void;
}

class CtrlPlugin<T> extends Plugin {
  public ctrlCenter: ICtrlPluginCtrl<T>;

  constructor(spec: Plugin['spec'], ctrlCenter: ICtrlPluginCtrl<T>) {
    super(spec);
    this.props = spec.props!;
    this.ctrlCenter = ctrlCenter;
  }

  public registerProps = (props: T) => {
    this.ctrlCenter.register(props);
  };

  public unregisterProps = (props: T) => {
    this.ctrlCenter.unregister(props);
  };
}

export { CtrlPlugin };
