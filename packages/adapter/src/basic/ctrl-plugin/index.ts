import { Plugin } from 'prosemirror-state';

interface ICtrlPluginCtrl<T> {
  register: (props: T, prioritized?: boolean) => void;
  unregister: (props: T) => void;
}

interface ICtrlPlugin<T> extends Plugin {
  registerProps: (props: T, prioritized?: boolean) => void;
  unregisterProps: (props: T) => void;
}

const createCtrlPlugin = <T>(spec: Plugin['spec'], ctrlCenter: ICtrlPluginCtrl<T>) => {
  const ctrlPlugin = new Plugin(spec) as ICtrlPlugin<T>;
  Object.assign(ctrlPlugin, { props: spec.props });
  ctrlPlugin.registerProps = (props: T, prioritized?: boolean) => ctrlCenter.register(props, prioritized);
  ctrlPlugin.unregisterProps = (props: T) => ctrlCenter.unregister(props);

  return ctrlPlugin;
};

export { createCtrlPlugin, ICtrlPlugin };
