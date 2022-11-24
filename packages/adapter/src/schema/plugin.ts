import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { SylApi } from '../api';
import { EventChannel } from '../event';
import { getMetadata, ISylPluginConfig, ISylPluginProps, Types } from '../libs';
import { BaseCard } from './card';
import { META } from './const';
import { SylController } from './controller';
import { Formattable, SchemaMeta } from './schema';
import { getSchemaType } from './utils';

interface ISylCommand {
  [key: string]: (state: EditorState, dispatch: EditorView['dispatch'], adapter: SylApi, ...args: any[]) => any;
}

type FormattableType = new (editor: SylApi, props: any) => Formattable<any>;
type ControllerType = new (editor: SylApi, props: any) => SylController<any>;

// process SylPlugin.Schema, sort out `NodeView`, `Schema instance`, and node definition (`meta`)
const schemaMetaFactory = (Schema: FormattableType, adapter: SylApi, props: Types.StringMap<any>) => {
  const type = getSchemaType(Schema);
  !type && console.error('has no type of', Schema.name);

  const $schema = new Schema(adapter, props);
  const meta = new SchemaMeta(type, $schema.name, $schema);
  return {
    view: $schema.NodeView || null,
    schema: $schema,
    // Deprecated getMetadata will be remove in the future
    meta: getMetadata(META, Schema) ? getMetadata(META, Schema) : meta,
  };
};

class SylPlugin<T = any> {
  public name = '';
  public $controller: SylController<any> | null = null;
  public $schema: Formattable | BaseCard | null = null;
  public $schemaMeta: SchemaMeta<any> | null = null;
  public $NodeView: Formattable['NodeView'] | null = null;
  public Controller: ControllerType = SylController;
  public asyncController: (() => Promise<ControllerType>) | null = null;
  public Schema: FormattableType | null = null;
  private editor: SylApi | null = null;
  private props: T | null = null;
  private controllerUnmountEvent = () => {};

  private handleAsyncController = async () => {
    if (!this.asyncController || !this.editor) return;
    const Controller = await this.asyncController();
    this.editor.configurator.registerController(this.name, Controller);
  };

  static getName() {
    return new this().name;
  }

  constructor(props?: T) {
    if (props) {
      this.props = props;
    }
  }

  public registerController = (Constructor = this.Controller, props?: T) => {
    if (!this.editor) return;
    this.Controller = Constructor;
    this.$controller = new Constructor(this.editor, props || this.props || {});
    if (!this.$controller.name) this.$controller.name = this.name;
    this.controllerUnmountEvent = this.$controller.editorWillUnmount.bind(this.$controller);
    this.editor.on(EventChannel.LocalEvent.EDITOR_WILL_UNMOUNT, this.controllerUnmountEvent);
  };

  public unregisterController = () => {
    if (!this.editor || !this.$controller) return;
    this.editor.off(EventChannel.LocalEvent.EDITOR_WILL_UNMOUNT, this.controllerUnmountEvent);
    this.controllerUnmountEvent = () => {};
    this.$controller = null;
  };

  public init(editor: SylApi, options: ISylPluginProps) {
    this.editor = editor;
    this.props = { ...this.props, ...options.controllerProps } as T;

    if (this.Controller) this.registerController(this.Controller, this.props);
    if (this.asyncController) this.handleAsyncController();

    if (this.Schema) {
      const { view, schema, meta } = schemaMetaFactory(this.Schema, this.editor, this.props);
      this.$schema = schema;
      this.$NodeView = view;
      if (this.$NodeView) {
        if (options.layers) (this.$schema as BaseCard).layers = options.layers;
      }
      this.$schemaMeta = meta;
    }
  }
}

class SylUnionPlugin<T = any> {
  public name = '';
  public props: T | null = null;

  static getName() {
    return new this().name;
  }

  constructor(props?: T) {
    if (props) {
      this.props = props;
    }
  }

  public install(editor: SylApi, props: ISylPluginProps['controllerProps']) {
    return this.init(editor, { ...this.props, ...props });
  }

  public init(
    editor: SylApi,
    props: ISylPluginProps['controllerProps'],
  ): {
    nativePlugins?: Plugin[];
    sylPlugins?: ISylPluginConfig[];
  } {
    return {};
  }
}

export { ISylCommand, SylPlugin, SylUnionPlugin };
