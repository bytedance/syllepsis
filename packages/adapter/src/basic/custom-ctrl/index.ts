import { EditorState, Plugin, PluginKey, PluginSpec, Transaction } from 'prosemirror-state';
import { EditorProps } from 'prosemirror-view';

import { SylApi } from '../../api';
import { Types } from '../../libs';
import { IEventHandler, SylController } from '../../schema';

type TEventHandler = (adapter: SylApi, ...args: any[]) => any;
type TransEventHandler = (adapter: SylApi, data: any) => any;
type THandlersCenter = Partial<Record<keyof IEventHandler, Array<TEventHandler | IEventHandler['handleDOMEvents']>>>;

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

const createPlugin = (spec: PluginSpec) =>
  new Plugin({
    key,
    ...spec,
  });

interface ICustomCtrlConfig {
  eventHandler?: IEventHandler;
  appendTransaction?: SylController['appendTransaction'];
}

const createCustomCtrlPluginSpec = (adapter: SylApi, configs: Array<ICustomCtrlConfig>) => {
  const eventHandlers: THandlersCenter = {};
  const appendTransactions: Array<NonNullable<SylController['appendTransaction']>> = [];

  const handleAppendTransaction = (trs: Transaction[], oldState: EditorState, _newState: EditorState) => {
    let newState = _newState;
    const tr = newState.tr;
    let appended = false;
    appendTransactions.forEach(handler => {
      const res = handler(tr, oldState, newState);
      if (res) {
        newState = _newState.applyInner(res);
        appended = true;
      }
    });
    if (appended) return tr;
  };

  const handleProps = () =>
    (Object.keys(eventHandlers) as Array<keyof IEventHandler>).reduce((result, event: keyof IEventHandler) => {
      let handler;
      // collect domEvent handlers and chain
      if (event === 'handleDOMEvents') {
        const collectHandlers = (eventHandlers[event] as Array<IEventHandler['handleDOMEvents']>).reduce(
          (res, domEventHandlerMap: IEventHandler['handleDOMEvents']) => {
            (Object.keys(domEventHandlerMap!) as Array<keyof HTMLElementEventMap>).forEach(domEvent => {
              if (!domEventHandlerMap) return;
              const domEventHandler = domEventHandlerMap[domEvent];
              if (!domEventHandler) return;
              if (!Array.isArray(res[domEvent])) {
                res[domEvent] = [domEventHandler];
              } else {
                res[domEvent].push(domEventHandler);
              }
            });
            return res;
          },
          {} as Record<keyof HTMLElementEventMap, Array<TEventHandler>>,
        );

        handler = (Object.keys(collectHandlers) as Array<keyof HTMLElementEventMap>).reduce(
          (res, domEvent: keyof HTMLElementEventMap) => {
            res[domEvent] = (...args: any[]) => chainEvent(domEvent, adapter, collectHandlers[domEvent], ...args);
            return res;
          },
          {} as any,
        );
      } else {
        // simple chain the custom event handler
        handler = (...args: any[]) => chainEvent(event, adapter, eventHandlers[event] as Array<TEventHandler>, ...args);
      }

      result[event as keyof EditorProps] = handler;
      return result;
    }, {} as NonNullable<PluginSpec['props']>);

  configs.forEach(config => {
    if (config.eventHandler) {
      const eventHandler = config.eventHandler;
      (Object.keys(eventHandler) as Array<keyof IEventHandler>).forEach((event: keyof IEventHandler) => {
        const handler = eventHandler[event];
        if (!handler) return;
        if (Array.isArray(eventHandlers[event])) {
          eventHandlers[event]!.push(handler);
        } else {
          eventHandlers[event] = [handler];
        }
      });
    }
    if (config.appendTransaction) appendTransactions.push(config.appendTransaction);
  });

  return {
    props: handleProps(),
    appendTransaction: handleAppendTransaction,
  };
};

const CreateCustomCtrlPlugin = (adapter: SylApi, customProps: Array<ICustomCtrlConfig>) =>
  createPlugin(createCustomCtrlPluginSpec(adapter, customProps));

export { CreateCustomCtrlPlugin, ICustomCtrlConfig };
