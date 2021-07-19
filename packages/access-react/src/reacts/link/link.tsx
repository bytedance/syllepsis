import './index.css';

import { SylApi } from '@syllepsis/adapter';
import { ILinkProps, Link, LinkController as BaseLinkController } from '@syllepsis/plugin-basic';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import React, { MouseEventHandler } from 'react';
import ReactDOM from 'react-dom';

import { InlineCard } from '../../card';
import { Modal, ModalContent, ModalFooter, ModalTitle } from '../../component/modal';

interface ILinkComponentState {
  showTooltip: boolean;
}
interface ILinkComponentProps {
  attrs: {
    href: string;
    text: string;
  };
  editor: SylApi;
  getBoundingClientRect: () => DOMRect;
}

interface ILinkTooltip extends ILinkComponentProps {
  hideTooltipWhenLeaveAsync: () => void;
  cancelHideTooltip: () => void;
}

const PLUGIN_NAME = 'link';

class LinkComponent extends React.PureComponent<ILinkComponentProps, ILinkComponentState> {
  public hiddenTooltipTimer: number | null = null;

  public state = {
    showTooltip: false,
  };

  public showTooltipOnHover = () => {
    if (!this.props.editor.editable) return;
    this.cancelHideTooltip();

    if (this.state.showTooltip === false) {
      this.setState({ showTooltip: true });
    }
  };

  public hideTooltipWhenLeaveAsync = () => {
    if (this.state.showTooltip === true) {
      this.hiddenTooltipTimer = window.setTimeout(() => this.setState({ showTooltip: false }), 300);
    }
  };

  public cancelHideTooltip = () => {
    if (typeof this.hiddenTooltipTimer === 'number') {
      window.clearTimeout(this.hiddenTooltipTimer);
      this.hiddenTooltipTimer = null;
    }
  };

  preventDefaultEvent: MouseEventHandler = e => {
    if (!this.props.editor.editable) return;
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  public render() {
    const { showTooltip } = this.state;

    return [
      <a
        key={`link-${this.props.attrs.text}`}
        href={this.props.attrs.href}
        target="_blank"
        rel="nofollow"
        onMouseEnter={this.showTooltipOnHover}
        onMouseLeave={this.hideTooltipWhenLeaveAsync}
        onClick={this.preventDefaultEvent}
      >
        {this.props.attrs.text}
      </a>,
      showTooltip &&
        ReactDOM.createPortal(
          <LinkTooltip
            key={`linktooltip-${this.props.attrs.text}`}
            hideTooltipWhenLeaveAsync={this.hideTooltipWhenLeaveAsync}
            cancelHideTooltip={this.cancelHideTooltip}
            {...this.props}
          />,
          this.props.editor.root,
        ),
    ];
  }
}

function LinkTooltip(props: ILinkTooltip) {
  const position = props.getBoundingClientRect();
  return (
    <span
      contentEditable={false}
      className="syl-link-tooltip-wrapper syl-link-tooltip"
      style={{
        top: position.top - 22 + 'px',
        left: position.left - 5 + 'px',
      }}
      onMouseEnter={props.cancelHideTooltip}
      onMouseLeave={props.hideTooltipWhenLeaveAsync}
    >
      <a href={props.attrs.href} target="_blank">
        {props.attrs.href}
      </a>
    </span>
  );
}

let LinkModalInstance: LinkModal;

class LinkSchema extends Link {
  public ViewMap = {
    template: LinkComponent,
  };

  public NodeView = InlineCard.prototype.NodeView;
}

enum InsertType {
  Insert = 'insert', // directly insert
  Replace = 'replace', // edit link
  Selection = 'selection', // replace with selection
}

interface ILinkModalState {
  open: boolean;
  text: string;
  href: string;
  pos: number;
  insertType: InsertType;
  errorText: string;
}

interface ILinkModalProps {
  insert: (attrs: any) => void;
  editor: SylApi;
  validateHref?: ILinkProps['validateHref'];
}

class LinkModal extends React.PureComponent<ILinkModalProps, ILinkModalState> {
  public state = {
    open: false,
    text: '',
    href: '',
    pos: 0,
    insertType: InsertType.Insert,
    errorText: '',
  };

  public handleClickOpen = () => {
    this.setState({ open: true });
  };

  public handleClose = () => {
    this.setState({ open: false });
  };

  public handleConfirm = () => {
    const { text, href, insertType, pos } = this.state;
    const { editor, validateHref } = this.props;
    if (!editor) return;
    let newHref = href;
    if (validateHref) {
      const { error, text: result, href: hrefAfterValidate } = validateHref(href);
      if (error === false) {
        newHref = hrefAfterValidate || href;
      } else if (result) {
        this.setState({
          errorText: result,
        });
        return;
      }
    }
    const { index, length } = editor.getSelection();
    switch (insertType) {
      case InsertType.Insert:
        this.props.insert({ text, href: newHref });
        break;
      case InsertType.Replace:
        editor.updateCardAttrs(pos, { text, href: newHref });
        break;
      case InsertType.Selection:
        editor.replace({ type: PLUGIN_NAME, attrs: { text, href: newHref } }, { index, length });
        break;
      default:
        break;
    }
    setTimeout(() => {
      editor.focus();
      editor.setSelection({ index: index + 1, length: 0 });
    });
    this.setState({ open: false });
  };

  public onEnterKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13 || e.key === 'Enter') this.handleConfirm();
  };

  public render() {
    const { text, href, insertType, errorText } = this.state;
    const { editor } = this.props;
    const locale = editor.configurator.getLocaleValue(PLUGIN_NAME);
    return (
      <Modal isOpen={this.state.open} onClose={this.handleClose}>
        <ModalTitle>
          {insertType === InsertType.Replace
            ? locale.editLinkTitle || '插入链接'
            : locale.insertLinkTitle || '修改链接'}
        </ModalTitle>
        <ModalContent>
          <input
            placeholder={locale.textPlaceholder || '链接文字'}
            name="text"
            value={text}
            onChange={e =>
              this.setState({
                text: e.target.value,
              })
            }
            autoFocus={true}
            onKeyUp={this.onEnterKeyup}
          />
          <input
            placeholder={locale.linkPlaceholder || '链接地址'}
            name="href"
            value={href}
            onChange={e =>
              this.setState({
                href: e.target.value,
              })
            }
            onKeyUp={this.onEnterKeyup}
          />
          <div className="form-explain">{errorText ? errorText : ''}</div>
        </ModalContent>
        <ModalFooter>
          <button onClick={this.handleClose} color="primary" type="button">
            {locale.cancelText || '取消'}
          </button>
          <button onClick={this.handleConfirm} color="primary" type="button">
            {locale.okText || '确认'}
          </button>
        </ModalFooter>
      </Modal>
    );
  }
}

class LinkController extends BaseLinkController {
  public modal: LinkModal | null = null;
  public modalContainer: HTMLElement;
  public eventHandler = {
    handleClickOn(
      editor: SylApi,
      view: EditorView,
      pos: number,
      node: ProsemirrorNode,
      nodePos: number,
      event: MouseEvent,
    ) {
      if (!editor.editable) return false;
      if (node.type.name === PLUGIN_NAME) {
        // debugger;
        event.preventDefault();
        const { href, text } = node.attrs;
        LinkModalInstance.setState({
          text,
          href,
          pos,
          insertType: InsertType.Replace,
          open: true,
          errorText: '',
        });
      }
      return false;
    },
  };
  public toolbar = {
    className: PLUGIN_NAME,
    tooltip: PLUGIN_NAME,
    handler: (editor: SylApi) => {
      if (this.modal) {
        const selectionObj = window.getSelection();
        const text = selectionObj ? selectionObj.toString() : '';
        let insertType: InsertType = InsertType.Insert;
        if (text) {
          insertType = InsertType.Selection;
        }
        this.modal.setState({
          text,
          insertType,
          open: true,
          href: '',
          pos: 0,
          errorText: '',
        });
      }
    },
  };

  constructor(editor: SylApi, props: any) {
    super(editor, props);

    const extraDom = (
      <LinkModal
        ref={el => {
          if (el) {
            this.modal = el;
            LinkModalInstance = el;
          }
        }}
        validateHref={this.validateHref}
        insert={this.insert}
        editor={editor}
      />
    );
    this.modalContainer = document.createElement('div');
    document.body.appendChild(this.modalContainer);
    ReactDOM.render(extraDom, this.modalContainer);
  }

  editorWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.modalContainer);
  }
}

export { ILinkProps, LinkController, LinkSchema };
