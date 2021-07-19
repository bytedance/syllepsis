## Q：Chrome89+行首输入中文多出第一个字符？

**A：** 升级`prosemirror-view`版本至`^1.17.4`，注意不要引入多个`prosemirror-view`。

## Q：点击设置列表样式没有效果？

**A：** 看下是不是项目中引入了`reset.css`或者`nomrlize.css`重置了`ol`和`ul`的样式，或者考虑引入这个文档提供的`css`文件。

## Q：为什么我的卡片渲染不出来？

**A：** 可以查看下卡片的 `SylPlugin` 是否有`name`属性。

## Q：插件有哪些配置项，如图片，视频，音频上传等？

**A：** 目前提供的组件支持的配置可以在[插件](/zh-cn/plugins/README)章节了解，如[图片](/zh-cn/plugins/image)、[视频](/zh-cn/plugins/video)。

## Q：如何获取已有的节点的数据？

**A：** 块级元素可以使用[`getExistNodes`](/zh-cn/api?id=getexistnodes)，行内元素（文字样式等）使用[`getExistMarks`](/zh-cn/api?id=getexistmarks)。

## Q：为什么 setHTML 未触发'text-change'？

A：[setHTML](/zh-cn/api?id=sethtml)的`silent`参数控制是否触发事件，`silent`为`true`时不触发（默认值），如需触发请更改为`false`。

## Q：如何设置选中卡片的样式？

**A：** 在最外层加上类名，通过样式控制选中效果。

## Q：是否支持 SSR 渲染？

**A：** 编辑器作为一个重度依赖浏览器的组件，在非浏览器环境加载这个组件收益微乎其乎，可以考虑通过懒加载的方式引入。

## Q：如何配置图片支持粘贴，拖拽上传？

**A：** 参考[imagePlugins](/zh-cn/plugins/image)。若粘贴的图片未触发上传，确认是否配置了`allowDomains`，若没有配置，则允许任意域名，不会触发上传。

## Q：如何设置为只读模式？

**A：** 拿到编辑器实例后，调用`disable`方法进入只读模式，调用`enable`恢复编辑模式。或者在接入层传入 `disable={true}`
