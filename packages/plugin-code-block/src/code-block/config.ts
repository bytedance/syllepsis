import CodeMirror from 'codemirror';

interface ICodeBlockProps extends CodeMirror.EditorConfiguration {
  afterInsert?: any;
}

let config: ICodeBlockProps = {};

const setConfig = (customConfig: Partial<CodeMirror.EditorConfiguration>) =>
  (config = Object.assign(config, customConfig));

const PLUGIN_NAME = 'code_block';

export { config, ICodeBlockProps, PLUGIN_NAME, setConfig };
