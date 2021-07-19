import { SylApi, Types } from '@syllepsis/adapter';
import { IRenderer } from '@syllepsis/editor';
import React from 'react';
import ReactDOM from 'react-dom';

// ReactRenderer every card layer react instance correspond one
// to manage react life cycle
export class ReactRenderer<P = any> implements IRenderer<P> {
  public klass: React.ComponentType<P> | null;
  public props: P;
  public container: Element;
  public component: React.Component<P, any, any> | Element | null;
  public adapter: SylApi;

  constructor(adapter: SylApi, klass: React.ComponentType<P>, container: Element) {
    this.klass = klass;
    this.container = container;
    this.props = {} as P;
    this.component = null;
    this.adapter = adapter;
  }

  public replaceProps = (props: P, callback: Types.noop) => {
    this.props = {} as P;
    this.setProps(props, callback);
  };

  public setProps(partialProps: Partial<P>, callback: Types.noop) {
    if (this.klass === null) {
      console.warn(
        'setProps(...): Can only update a mounted or ' +
          'mounting component. This usually means you called setProps() on ' +
          'an unmounted component. This is a no-op'
      );
      return;
    }
    this.props = Object.assign({}, this.props, partialProps);
    const element = React.createElement(this.klass, this.props);
    this.component = ReactDOM.render(element, this.container, callback) || null;
  }

  public unmount() {
    if (!this.container) {
      console.warn('unmount(void):void: Can only unmount when container exist');
      return;
    }
    ReactDOM.unmountComponentAtNode(this.container);
    this.klass = null;
  }

  uninstall() {}
}
