import './style.css';

import React from 'react';
import RModal from 'react-modal';

interface IModalProps {
  isOpen: boolean;
  onClose: (event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => void;
  children: any;
}

type IModalContentProps = Pick<IModalProps, 'children'>;

const Modal = ({ children, isOpen, onClose }: IModalProps) => (
  <RModal
    isOpen={isOpen}
    className="syl-modal"
    shouldFocusAfterRender
    onRequestClose={onClose}
    ariaHideApp={false}
    style={{
      content: {
        top: '20%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#fff',
        position: 'absolute',
        boxShadow:
          '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
        borderRadius: '4px',
      },
      overlay: {
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 6,
      },
    }}
  >
    {children}
  </RModal>
);
const ModalTitle = ({ children }: IModalContentProps) => <div className="syl-modal-title">{children}</div>;
const ModalContent = ({ children }: IModalContentProps) => <div className="syl-modal-content">{children}</div>;
const ModalFooter = ({ children }: IModalContentProps) => <div className="syl-modal-footer">{children}</div>;

export { Modal, ModalContent, ModalFooter, ModalTitle };
