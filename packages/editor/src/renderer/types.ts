import { SylApi, Types } from '@syllepsis/adapter';

type ReplacePropsCallback = Types.noop;
type SetPropsCallback = ReplacePropsCallback;

interface IRenderer<Props> {
  props: Props;
  container: Element;
  adapter: SylApi;
  /**
   * this reset cache props then render component
   * @param props
   * @param callback
   */
  replaceProps(props: Props, callback?: ReplacePropsCallback): void;
  /**
   * this update props then update component
   * @param partialProps
   * @param callback
   */
  setProps(partialProps: Partial<Props>, callback?: SetPropsCallback): void;
  /**
   * this remove component from dom
   */
  unmount(): void;
  /**
   * this remove component from dom && remove self from manager
   */
  uninstall(): void;
}

export { IRenderer };
