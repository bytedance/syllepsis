import { Transaction } from 'prosemirror-state';

type Dispatch = (tr: Transaction) => void;

const isObjectURL = (url: string) => url.startsWith('blob');

const addLink = (link: string) => {
  const head = document.head || document.getElementsByTagName('head')[0] || document.body;
  const styleSheet = document.createElement('link');
  styleSheet.rel = 'stylesheet';
  styleSheet.href = link;
  head.appendChild(styleSheet);
};

export { addLink, Dispatch, isObjectURL };
