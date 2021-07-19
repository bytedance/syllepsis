import { Mark, Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

interface IMappingNode {
  node: ProsemirrorNode;
  pos: number;
  mark?: Mark;
}

type nodesWalker = (
  resList: Array<IMappingNode>,
  node: ProsemirrorNode,
  pos: number,
  parent: ProsemirrorNode,
  index: number,
) => boolean;

const BWalker: nodesWalker = (resList, node, pos) => {
  resList.push({ node, pos });
  return false;
};
/**
 * @param {boolean|nodesWalker} walker true for deep traversal, false for only direct child nodes, or custom walker
 */
const getNodesBetween = (doc: ProsemirrorNode, from: number, to: number, walker: nodesWalker = BWalker) => {
  const nodes: Array<IMappingNode> = [];
  doc.nodesBetween(from, to, (node, pos, parent, index) => (walker as nodesWalker)(nodes, node, pos, parent, index));
  return nodes;
};

const getNodesBefore = (doc: ProsemirrorNode, pos: number) => getNodesBetween(doc, 0, pos);

const checkHasContent = (nodes: Array<IMappingNode>) =>
  nodes.some(({ node }) => node.type !== node.type.schema.topNodeType.contentMatch.defaultType || node.nodeSize !== 2);

const checkHasContentBefore = (doc: ProsemirrorNode, pos: number) => {
  // when the selection is at the head of the node, it's not the start of content, so -1
  const nodes = getNodesBefore(doc, pos > 0 ? pos - 1 : pos);
  return checkHasContent(nodes);
};

const getExistNodes = (doc: ProsemirrorNode, nodeName: string): Array<IMappingNode> => {
  const walker: nodesWalker = (res, curNode, pos) => {
    if (curNode.type.name === nodeName) {
      res.push({
        node: curNode,
        pos,
      });
    }
    return Boolean(curNode.content.childCount);
  };
  return getNodesBetween(doc, 0, doc.nodeSize - 2, walker);
};

// some nodes (break, etc.) have no text content and are replaced with spaces
const constructText = (node: ProsemirrorNode) => {
  if (node.textContent) return node.textContent;
  let len = node.nodeSize;
  let text = '';
  while (len--) {
    text += ' ';
  }
  return text;
};

const getExistMarks = (state: EditorState, markName: string) => {
  const markType = state.schema.marks[markName] as Mark;
  if (!markType) return [];
  let prevParent: ProsemirrorNode | undefined;
  let prevMark: Mark<any> | undefined;
  const walker: nodesWalker = (res, curNode, pos, parent) => {
    const cMark = curNode.marks.find(mark => mark.type.name === markName);
    if (curNode.isLeaf && curNode.marks.length && markType.isInSet(curNode.marks)) {
      if (parent !== prevParent || cMark !== prevMark) {
        res.push({
          pos,
          node: state.schema.text(constructText(curNode), curNode.marks),
          mark: cMark,
        });
      } else if (cMark === prevMark) {
        const newNode = state.schema.text(res[res.length - 1].node.textContent + constructText(curNode), curNode.marks);
        res[res.length - 1].node = newNode;
      }
    }
    prevParent = parent;
    prevMark = cMark!;
    return Boolean(curNode.content.childCount);
  };

  return getNodesBetween(state.doc, 0, state.doc.nodeSize - 2, walker);
};

interface ICursorNode {
  node: ProsemirrorNode;
  pos: number;
}

const getCursorNode = (view: EditorView, depth?: number) => {
  const { $from, $to } = view.state.selection;
  if ($from.parent !== $to.parent || $from.parent.type.name === 'doc') return false;
  return {
    pos: $from.before(depth),
    node: $from.node(depth),
  };
};

export { checkHasContentBefore, getCursorNode, getExistMarks, getExistNodes, ICursorNode, IMappingNode, nodesWalker };
