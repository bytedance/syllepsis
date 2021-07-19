import { EditorState, Plugin, PluginKey, PluginSpec, Transaction } from 'prosemirror-state';
import { EditorProps } from 'prosemirror-view';

import { SylApi } from '../../api';
import { Types } from '../../libs';
import { SylController } from '../../schema/controller';

type TEventHandler = (adapter: SylApi, ...args: any[]) => boolean;

type TransEventHandler = (adapter: SylApi, data: any) => any;
interface IHandlersCenter {
  [K: string]: Array<TEventHandler | TransEventHandler>;
}

const transEvents = ['transformPastedHTML', 'transformPastedText', 'clipboardTextParser', 'transformPasted'];

const key = new PluginKey('customControl');

// transEvents means only transport one parameter
const transEventChain = (adapter: SylApi, handles: Array<TransEventHandler>, ...content: any) => {
  if (!adapter.view.editable) return content[0];
  return handles.reduce((_res, handle: (adapter: SylApi, data: any) => any) => {
    const res = handle(adapter, _res);
    return res;
  }, content[0]);
};
const chainEvent = (
  event: string,
  adapter: SylApi,
  handlers: Array<TEventHandler | TransEventHandler | Types.StringMap<any>>,
  ...args: any[]
): any => {
  if (transEvents.includes(event)) {
    return transEventChain(adapter, handlers as TransEventHandler[], ...args);
  }

  if (!adapter.view.editable) return false;
  return handlers.some(handler => (handler as TEventHandler)(adapter, ...args));
};

// use `chainEvent` to handle the `handler` group
const wrapEvent = (handlers: IHandlersCenter, adapter: SylApi) =>
  Object.keys(handlers).reduce((result, event) => {
    let handler;
    if (event === 'handleDOMEvents') {
      const collectHandlers = handlers[event].reduce((res, eventHandler) => {
        Object.keys(eventHandler).forEach(domEvent => {
          if (!res[domEvent]) {
            res[domEvent] = [(eventHandler as Types.StringMap<any>)[domEvent]];
          } else {
            res[domEvent].push((eventHandler as Types.StringMap<any>)[domEvent]);
          }
        });
        return res;
      }, {} as any);

      handler = Object.keys(collectHandlers).reduce((res, domEvent) => {
        res[domEvent] = (...args: any[]) => chainEvent(domEvent, adapter, collectHandlers[domEvent], ...args);
        return res;
      }, {} as any);
    } else {
      handler = (...args: any[]) => chainEvent(event, adapter, handlers[event] as Array<TEventHandler>, ...args);
    }
    result[event as keyof EditorProps] = handler;
    return result;
  }, {} as NonNullable<PluginSpec['props']>);

// group the `eventHandler` props
const collectProps = (propsList: Array<NonNullable<SylController['eventHandler']>>, adapter: SylApi) => {
  const handlers = propsList.reduce((res, props) => {
    Object.keys(props).forEach((event: any) => {
      if (Array.isArray(res[event])) {
        res[event].push(props[event as keyof SylController['eventHandler']]);
      } else {
        res[event] = [props[event as keyof SylController['eventHandler']]];
      }
    });
    return res;
  }, {} as IHandlersCenter);

  return wrapEvent(handlers, adapter);
};

const createPlugin = (spec: PluginSpec) =>
  new Plugin({
    key,
    ...spec,
  });

interface ICustomCtrlConfig {
  eventHandler?: SylController['eventHandler'];
  appendTransaction?: SylController['appendTransaction'];
}

const CreateCustomCtrlPlugin = (configs: Array<ICustomCtrlConfig>, adapter: SylApi) => {
  const allConfig = configs.reduce(
    (res, config) => {
      if (config.eventHandler) res.props.push(config.eventHandler);
      if (config.appendTransaction) res.appendTransaction.push(config.appendTransaction);
      return res;
    },
    { props: [], appendTransaction: [] } as {
      props: Array<NonNullable<ICustomCtrlConfig['eventHandler']>>;
      appendTransaction: Array<NonNullable<ICustomCtrlConfig['appendTransaction']>>;
    },
  );

  const customProps: PluginSpec = {};
  if (allConfig.props.length) customProps.props = collectProps(allConfig.props, adapter);
  if (allConfig.appendTransaction.length) {
    customProps.appendTransaction = (trs: Transaction[], oldState: EditorState, _newState: EditorState) => {
      let newState = _newState;
      const tr = newState.tr;
      let appended = false;
      allConfig.appendTransaction.forEach(handler => {
        const res = handler(tr, oldState, newState);
        if (res) {
          newState = _newState.applyInner(res);
          appended = true;
        }
      });
      if (appended) return tr;
    };
  }

  return createPlugin(customProps);
};

export { CreateCustomCtrlPlugin, ICustomCtrlConfig };
