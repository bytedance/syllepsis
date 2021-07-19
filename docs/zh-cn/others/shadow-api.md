# shadowAPI

shadow，可以理解为**影子**一样的文档内容。
插入的内容**不会对文档的结构化数据造成影响**，也**不会影响文档历史堆栈**，仅仅是对视图的一种**装饰**。

> 注意：插入的节点在获取数据时不会被保存，仅作展示使用

主要提供了三个 API

- `insertShadow`
- `appendShadow`
- `removeShadow`。

下面简单举几个例子如何使用 API。

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
// 插入shadow
insertShadow(
  data: {
    pos?: number;
    editable?: boolean;
    shadow: IDecoState['data']['shadow'];
    spec: IDecoState['data']['spec'];
  },
  inline?: boolean
): void;

// 移除shadow
removeShadow(key: string): {
  index: number;
  length: number;
  spec: {
    [key: string]: any;
  };
} | undefined;

// 装饰节点
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

## 插入不影响历史堆栈内容

可作为上传内容时的**占位符**：上传完成后替换节点。如此，撤销、重做不会导致重新进入上传状态，比如**上传图片**的时候：

![上传图片](/_media/shadow-api-01.gif)

```jsx
// 插入shadow
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
    key: 'image',
  },
});

// 上传完成后移除shadow
const shadowInfo = props.adapter.removeShadow('image');
if (shadowInfo) props.adapter.insertCard('image', { ...props.attrs }, shadowInfo.index);
```

## 装饰节点

光标移入需要改变节点展示方式，却不需更改文档数据。如：**标题编辑时，有底色**

![编辑底色](/_media/shadow-api-02.gif)

```typescript
editor.on(EventChannel.LocalEvent.SELECTION_CHANGED, () => {
  const cursorInfo = this.editor?.getCursorNode();
  if (cursorInfo && cursorInfo.node.type.name === 'header') {
    this.editor?.appendShadow({
      index: cursorInfo.pos,
      length: cursorInfo.node.nodeSize,
      attrs: {
        class: 'shadow',
      },
      spec: {
        key: 'shadow',
      },
    });
  } else {
    this.editor?.removeShadow('shadow');
  }
});
```

## 插入提示性内容

编辑时特有的内容，比如：**显示当前段落文字长度**

![显示文字长度](/_media/shadow-api-03.gif)

```typescript
editor.on(EventChannel.LocalEvent.SELECTION_CHANGED, () => {
  const cursorInfo = editor.getCursorNode();
  if (cursorInfo && cursorInfo.node.type.name === 'paragraph') {
    editor.removeShadow('count');
    editor.insertShadow(
      {
        pos: cursorInfo.pos + cursorInfo.node.nodeSize - 1,
        shadow: (dom, view) => {
          dom.innerHTML = cursorInfo.node.textContent.length;
          dom.style = 'font-size: 12px; color: red';
          return dom;
        },
        spec: {
          key: 'count',
        },
      },
      true,
    );
  } else {
    editor.removeShadow('count');
  }
});
```
