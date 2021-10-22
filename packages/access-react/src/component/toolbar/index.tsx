import './index.css';

import { EventChannel, SylApi } from '@syllepsis/adapter';
import { ToolbarInlineLoader } from '@syllepsis/editor';
import React, { useCallback, useEffect, useState } from 'react';

import { List, Popper } from '../../component';
import { ToolbarInline } from '../../modules/toolbar/render/inline';
import { ButtonForToolbar } from '../../modules/toolbar/tools';
import { ToolDisplay } from '../../modules/toolbar/utils';
import { ReactRenderer } from '../../render-bridge';
import { Modal, ModalContent, ModalFooter, ModalTitle } from '../modal';

interface ButtonProp {
  modal?: JSX.Element;
  // dropdown content
  panel?: JSX.Element;
  editor?: SylApi;
  type?: string;
  tooltip?: string;
  disabled?: boolean;
  active?: boolean;
  display?: ToolDisplay;
  icon: JSX.Element;
  content?: string;
  isStatic?: boolean;
  onClick?: (editor?: SylApi) => any;
}

const ToolbarButton = (props: ButtonProp) => {
  const { modal, panel, editor, onClick, type, tooltip, disabled, active, display, icon, content, isStatic } = props;
  if (!editor) return null;

  const [attrActive, setAttrActive] = useState<boolean>(false);
  const [panelActive, setPanelActive] = useState<boolean>(false);
  const [modalActive, setModalActive] = useState<boolean>(false);
  let buttonRef: HTMLElement;

  const updateStatus = useCallback(() => {
    if (type) {
      const currFormat = editor?.getFormat();
      if (currFormat) {
        setAttrActive(currFormat[type]);
      }
    }
  }, [attrActive, editor]);

  const toggleState = useCallback(() => {
    onClick && onClick(editor);
    if (type) {
      const currFormat = editor?.getFormat();
      if (currFormat) {
        const antiFormat = !currFormat[type];
        editor?.setFormat({ [type]: antiFormat });
        updateStatus();
      }
    }
  }, [attrActive, editor]);

  const onModalClose = useCallback(() => {
    modalActive && setModalActive(false);
  }, [modalActive]);

  const onPanelClose = useCallback(
    (event, forceClose) => {
      if ((panelActive && !buttonRef.contains(event.target)) || forceClose) {
        setPanelActive(false);
      }
    },
    [panelActive],
  );

  const triggerActive = useCallback(() => {
    if (panel) {
      setPanelActive(!panelActive);
    } else if (modal) {
      setModalActive(!modalActive);
    }
  }, [modalActive, panelActive]);

  useEffect(() => {
    editor?.on(EventChannel.LocalEvent.ON_CHANGE, updateStatus);
    editor?.on(EventChannel.LocalEvent.SELECTION_CHANGED, updateStatus);
    return () => {
      editor?.off(EventChannel.LocalEvent.SELECTION_CHANGED, updateStatus);
      editor?.off(EventChannel.LocalEvent.ON_CHANGE, updateStatus);
    };
  }, [editor]);

  const toolbarConfig = {
    icon,
    disable: () => !!disabled,
  };

  return (
    <>
      <ButtonForToolbar
        active={active || attrActive || panelActive || modalActive}
        attrs={false}
        display={display || ToolDisplay.VERTICAL}
        editor={editor}
        handler={() => {
          toggleState();
          triggerActive();
        }}
        name={''}
        showName={content || ''}
        tipDirection={'up'}
        tipDistance={10}
        toolbar={toolbarConfig}
        toolbarType={isStatic ? 'static' : 'inline'}
        tooltip={tooltip}
        getRef={ref => {
          if (ref) {
            buttonRef = ref;
          }
        }}
      />
      {panel && (
        <Popper children={''} content={React.cloneElement(panel, { onClose: onPanelClose })} isOpen={panelActive} />
      )}
      {!panel && (
        <Modal isOpen={modalActive} onClose={onModalClose}>
          {React.isValidElement(modal) && React.cloneElement(modal as React.ReactElement, { onClose: onModalClose })}
        </Modal>
      )}
    </>
  );
};

const ToolbarWrapper = (props: { editor?: SylApi; children: React.ReactNode }) => {
  const { editor, children } = props;
  if (!editor) return null;
  const injectChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { editor });
    }
  });
  return <div className="syl-toolbar">{injectChildren}</div>;
};

const InlineToolbarWrapper = (props: { editor?: SylApi; tools: string[] }) => {
  const { editor, tools } = props;
  const [Toolbar, setToolbar] = useState<null | ToolbarInlineLoader>(null);
  useEffect(() => {
    if (editor) {
      const toolbarInlineLoader = new ToolbarInlineLoader(editor, {
        Component: ToolbarInline,
        RenderBridge: ReactRenderer,
        tools,
      });
      setToolbar(toolbarInlineLoader);
    }
  }, [editor]);
  return Toolbar;
};

const ModalPanel = (props: {
  title: string;
  children: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}) => {
  const { title, children, okText, cancelText, onOk, onCancel, onClose } = props;
  const handleOk = () => {
    onOk && onOk();
    onClose && onClose();
  };
  const handleCancel = () => {
    onCancel && onCancel();
    onClose && onClose();
  };
  return (
    <>
      {title && <ModalTitle>{title}</ModalTitle>}
      <ModalContent>{children}</ModalContent>
      {(onOk || onCancel) && (
        <ModalFooter>
          {onOk && <button onClick={handleOk}>{okText || 'Ok'}</button>}
          {onCancel && <button onClick={handleCancel}>{cancelText || 'cancel'}</button>}
        </ModalFooter>
      )}
    </>
  );
};

const DropDownPanel = (props: { children: React.ReactNode; onClose?: () => void }) => {
  const { children, onClose } = props;
  useEffect(() => {
    onClose && window.addEventListener('click', onClose);
    return () => {
      onClose && window.removeEventListener('click', onClose);
    };
  }, []);
  const injectChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child);
    }
  });
  return <div className="syl-dropdown-panel">{injectChildren}</div>;
};

const DropDownList = (props: {
  children: React.ReactNode;
  editor?: SylApi;
  onClose?: (event: MouseEvent, forceClose?: boolean) => void;
}) => {
  const { children, editor, onClose } = props;
  useEffect(() => {
    onClose && window.addEventListener('click', onClose);
    return () => {
      onClose && window.removeEventListener('click', onClose);
    };
  }, []);
  const injectChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        editor,
        display: ToolDisplay.HORIZON,
        isStatic: true,
        onClick: (event: MouseEvent) => {
          onClose && onClose(event, true);
        },
      });
    }
  });
  return <List className="static">{injectChildren}</List>;
};

export { DropDownList, DropDownPanel, InlineToolbarWrapper, ModalPanel, ToolbarButton, ToolbarWrapper };
