import './index.less';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { ErrorIcon, SuccessIcon } from './icon';

enum MessageType {
  SUCCESS= 'success',
  ERROR = 'error',
}

interface IMessageProps {
  type: MessageType,
  content: string,
}

const time = 2500;

const Message = (props: IMessageProps) => {
  const { type, content } = props;
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setActive(true);
    }, 0)

    setTimeout(() => {
      setActive(false);
    }, time - 300)
  }, [])

  return <span className={`message ${type} ${ active ? 'active' : ''}`}>
    <span className="icon">
      {
        type === MessageType.SUCCESS ? <SuccessIcon/>: <ErrorIcon/>
      }

    </span>
    <span className="content">{ content }</span>
  </span>
}


const toast = (type: MessageType, content: string) => {
  const panel = document.createElement('div');
  panel.classList.add('message-wrapper')
  document.body.appendChild(panel);
  ReactDOM.render(<Message type={type} content={content}/>, panel);
  setTimeout(() => {
    ReactDOM.unmountComponentAtNode(panel);
    document.body.removeChild(panel);
  }, time)
}

const success = (content: string) => toast(MessageType.SUCCESS, content)

const error = (content: string) => toast(MessageType.ERROR, content)

const message = {
  success, error
}

export {
  message
}