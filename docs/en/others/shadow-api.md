# shadowAPI

Shadow can be understood as the content of a document like **shadow**.
The inserted content will not affect the structured data of the document, nor will it affect the document history stack. It is just a decoration of the view.

> Note: The inserted node will not be saved when the data is obtained, it is only used for display

Mainly provides three APIs

- `insertShadow`
- `appendShadow`
- `removeShadow`.

Following examples explain that how to use the API.

```typescript
interface IDecoState {
  data: {
    attrs?:{
      class?: string | null;
      style?: string | null;
      nodeName?: string | null;
      [key: string]: string | null | undefined;
    },
    shadow?: (dom: HTMLElement, view: EditorView, getPos: () => number) => HTMLElement;
    spec: {
      key: string;
      [k: string]: any;
    };
  };
}
// insert shadow
insertShadow(
  data: {
    pos?: number;
    editable?: boolean;
    shadow: IDecoState['data']['shadow'];
    spec: IDecoState['data']['spec'];
  },
  inline?: boolean
): void;

// remove shadow
removeShadow(key: string): {
  index: number;
  length: number;
  spec: {
    [key: string]: any;
  };
} | undefined;

// Decoration node
appendShadow(
  data: {
    index: number;
    length: number;
    attrs?: IDecoState['data']['attrs'];
    spec: IDecoState['data']['spec'];
  },
  inline?: boolean
): void;
```

## not affect history stack

Can be used as a **placeholder** when uploading content: replace the node after uploading. In this way, undo or redo will not lead to re-entering the upload state, such as when **uploading a picture**:

![Upload image](/_media/shadow-api-01.gif)

```jsx
// insert shadow
editor.insertShadow({
  shadow: (dom, view, getPos) => {
    ReactDOM.render(
      <Image
        attrs={{ ... }}
      />,
      dom,
    );
    return dom;
  },
  spec: {
    key:'image',
  },
});

// Remove shadow after upload is complete
const shadowInfo = props.adapter.removeShadow('image');
if (shadowInfo) props.adapter.insertCard('image', {...props.attrs }, shadowInfo.index);
```

## Decoration node

The cursor movement needs to change the node display mode, but does not need to change the document data. Such as: **When editing the title, there is a background color**

![Edit background color](/_media/shadow-api-02.gif)

```typescript
editor.on(EventChannel.LocalEvent.SELECTION_CHANGED, () => {
  const cursorInfo = this.editor?.getCursorNode();
  if (cursorInfo && cursorInfo.node.type.name ==='header') {
    this.editor?.appendShadow({
      index: cursorInfo.pos,
      length: cursorInfo.node.nodeSize,
      attrs: {
        class:'shadow',
      },
      spec: {
        key:'shadow',
      },
    });
  } else {
    this.editor?.removeShadow('shadow');
  }
});
```

## Insert informative content

Unique content during editing, such as: **Display the text length of the current paragraph**

![Display text length](/_media/shadow-api-03.gif)

```typescript
editor.on(EventChannel.LocalEvent.SELECTION_CHANGED, () => {
  const cursorInfo = editor.getCursorNode();
  if (cursorInfo && cursorInfo.node.type.name ==='paragraph') {
    editor.removeShadow('count');
    editor.insertShadow(
      {
        pos: cursorInfo.pos + cursorInfo.node.nodeSize-1,
        shadow: (dom, view) => {
          dom.innerHTML = cursorInfo.node.textContent.length;
          dom.style ='font-size: 12px; color: red';
          return dom;
        },
        spec: {
          key:'count',
        },
      },
      true,
    );
  } else {
    editor.removeShadow('count');
  }
});
```