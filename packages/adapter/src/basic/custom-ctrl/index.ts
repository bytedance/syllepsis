import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { EditorProps, EditorView } from 'prosemirror-view';

import { SylApi } from '../../api';
import { Types } from '../../libs';
import { IEventHandler, SylController } from '../../schema';

type ValueOf<T> = T[keyof T];
type TEventHandler = (adapter: SylApi, ...args: any[]) => any;
type TransEventHandler = (adapter: SylApi, data: any) => any;
type TDomEventHandlersMap = Partial<
  Record<
    keyof NonNullable<IEventHandler['handleDOMEvents']>,
    Array<ValueOf<NonNullable<IEventHandler['handleDOMEvents']>>>
  >
>;
type THandlersCenter = Partial<
  Record<keyof Omit<IEventHandler, 'handleDOMEvents'>, Array<TEventHandler>> & { handleDOMEvents: TDomEventHandlersMap }
>;

const transEvents = ['transformPastedHTML', 'transformPastedText', 'clipboardTextParser', 'transformPasted'];

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

class CustomPlugin extends Plugin {
  public ctrlCenter: CustomCtrlCenter;

  constructor(spec: Plugin['spec'], ctrlCenter: CustomCtrlCenter) {
    super(spec);
    this.props = spec.props!;
    this.ctrlCenter = ctrlCenter;
  }

  public registerProps = (props: ICustomCtrlConfig | Array<ICustomCtrlConfig>) => {
    this.ctrlCenter.register(props);
  };

  public unregisterProps = (props: ICustomCtrlConfig | Array<ICustomCtrlConfig>) => {
    this.ctrlCenter.unregister(props);
  };
}
interface ICustomCtrlConfig {
  eventHandler?: IEventHandler;
  appendTransaction?: SylController['appendTransaction'];
}

const groupHandler = (target: any, key: string, handler: any) => {
  if (!Array.isArray(target[key])) target[key] = [];
  target[key].push(handler);
};

const filterHandler = (target: any, key: string, handler: any) => {
  if (!Array.isArray(target[key])) return;
  target[key] = target[key].filter((fn: any) => fn !== handler);
};

class CustomCtrlCenter {
  private adapter: SylApi;
  private appendTransactions: Array<NonNullable<SylController['appendTransaction']>> = [];
  private eventHandler: THandlersCenter = {};
  private props: EditorProps = {};

  // group appendTransaction handler
  private handleAppendTransaction = (trs: Transaction[], oldState: EditorState, _newState: EditorState) => {
    let newState = _newState;
    const tr = newState.tr;
    let appended = false;
    this.appendTransactions.forEach(handler => {
      const res = handler(tr, oldState, newState);
      if (res) {
        newState = _newState.applyInner(res);
        appended = true;
      }
    });
    if (appended) return tr;
  };

  private defaultDomEventHandler = (event: Event) =>
    this.adapter.view.someProp('handleDOMEvents', handlers => {
      const handler = handlers[event.type];
      return handler ? handler(this.adapter.view, event) || event.defaultPrevented : false;
    });

  private ensureProps = () => {
    const { view } = this.adapter;
    view.someProp('handleDOMEvents', (currentHandlers: EditorView['eventHandlers']) => {
      for (const type in currentHandlers) {
        if (!view.eventHandlers[type])
          view.dom.addEventListener(
            type,
            (view.eventHandlers[type] = (event: Event) => this.defaultDomEventHandler(event)),
          );
      }
    });
  };

  // assigned `this.props` according to `eventHandler`
  private handleProps = () => {
    (Object.keys(this.eventHandler) as Array<keyof IEventHandler>).reduce((result, event: keyof IEventHandler) => {
      let handler;
      // collect domEvent handlers and chain
      if (event === 'handleDOMEvents') {
        handler = (Object.keys(this.eventHandler.handleDOMEvents!) as Array<keyof TDomEventHandlersMap>).reduce(
          (res, domEvent: keyof TDomEventHandlersMap) => {
            res[domEvent] = (...args: any[]) =>
              chainEvent(domEvent, this.adapter, this.eventHandler.handleDOMEvents![domEvent] as any, ...args);
            return res;
          },
          {} as any,
        );
      } else {
        // simple chain the custom event handler
        handler = (...args: any[]) =>
          chainEvent(event, this.adapter, this.eventHandler[event] as Array<TEventHandler>, ...args);
      }

      result[event as keyof EditorProps] = handler;
      return result;
    }, this.props);
    this.ensureProps();
  };

  public register = (registerConfigs: ICustomCtrlConfig | Array<ICustomCtrlConfig>) => {
    let configs = registerConfigs;
    if (!Array.isArray(configs)) configs = [configs];
    configs.forEach(config => {
      if (config.appendTransaction) this.appendTransactions.push(config.appendTransaction);

      if (config.eventHandler) {
        const eventHandler = config.eventHandler;
        (Object.keys(eventHandler) as Array<keyof IEventHandler>).forEach((event: keyof IEventHandler) => {
          const handler = eventHandler[event];
          if (!handler) return;
          if (event === 'handleDOMEvents') {
            if (!this.eventHandler.handleDOMEvents) this.eventHandler.handleDOMEvents = {};
            const domEventHandler = handler as NonNullable<IEventHandler['handleDOMEvents']>;
            (Object.keys(domEventHandler) as Array<keyof NonNullable<IEventHandler['handleDOMEvents']>>).forEach(
              (key: keyof NonNullable<IEventHandler['handleDOMEvents']>) => {
                if (!domEventHandler[key]) return;
                groupHandler(this.eventHandler.handleDOMEvents, key, domEventHandler[key]);
              },
            );
          } else {
            groupHandler(this.eventHandler, event, handler);
          }
        });
      }
    });

    this.handleProps();
  };

  public unregister = (registerConfigs: ICustomCtrlConfig | Array<ICustomCtrlConfig>) => {
    let configs = registerConfigs;
    if (!Array.isArray(configs)) configs = [configs];
    configs.forEach(config => {
      if (config.appendTransaction) filterHandler(this, 'appendTransactions', config.appendTransaction);
      if (config.eventHandler) {
        (Object.keys(config.eventHandler) as Array<keyof IEventHandler>).forEach((key: keyof IEventHandler) => {
          if (key === 'handleDOMEvents') {
            (Object.keys(config.eventHandler!.handleDOMEvents!) as Array<keyof TDomEventHandlersMap>).forEach(
              (key: keyof TDomEventHandlersMap) => {
                if (!this.eventHandler.handleDOMEvents?.[key]) return;
                filterHandler(this.eventHandler.handleDOMEvents, key, config.eventHandler!.handleDOMEvents![key]);
              },
            );
          } else if (this.eventHandler[key]) {
            filterHandler(this.eventHandler, key, config.eventHandler![key]);
          }
        });
      }
    });

    this.handleProps();
  };

  constructor(adapter: SylApi, configs?: Array<ICustomCtrlConfig>) {
    this.adapter = adapter;
    if (configs) this.register(configs);
  }

  public spec: Plugin['spec'] = {
    key: new PluginKey('customControl'),
    props: this.props,
    appendTransaction: this.handleAppendTransaction,
  };
}

const CreateCustomCtrlPlugin = (adapter: SylApi, customProps: Array<ICustomCtrlConfig>) => {
  const ctrlCenter = new CustomCtrlCenter(adapter, customProps);
  return new CustomPlugin(ctrlCenter.spec, ctrlCenter);
};

export { CreateCustomCtrlPlugin, CustomPlugin, ICustomCtrlConfig };
