# ImagePlugin <!-- {docsify-ignore-all} -->

> [类型](/zh-cn/plugins/types)

```typescript
import { ImagePlugin } from '@syllepsis/access-react';

plugins: [
  new ImagePlugin({
      // 图片上传方法，接受一个'blob'或'file'，返回图片地址或者对象
      // 如果是从外部粘贴的图片，uploader入参会是一个string
      uploader: (img: Blob | File | string) => Promise<string | { src: string, width: number, height: number }>,
      onUploadError: (img: File | Blob | string, err: Event) => any, // 上传失败回调
      allowDomains: [string|Regexp] | ((domain: string) => boolean); // 可选，图片src允许的值，匹配不上会触发uploader(没有配置则允许所有)
      uploadType: 'blob'| 'file',// 可选，uploader接受的文件类型， 默认'blob'
      listenDrop: boolean, // 可选，监听外部文件drop事件，默认true
      listenPaste: boolean, // 可选，监听外部文件粘贴事件，默认true
      placeholder: string, // 可选（行内图片不支持），图片描述默认值
      maxLength: number, // 可选（行内图片不支持），图片描述最大长度，默认20
      uploadBeforeInsert: boolean, // 可选，上传完成后插入，默认false
      disableResize: boolean, // 可选，是否禁用缩放功能，默认false
      accept: string, // 可选，接受的文件类型
      disableAlign: boolean, // 可选（行内图片不支持），是否禁用图片对齐，默认false
      disableCaption: boolean, // 可选（行内图片不支持），是否禁用显示图片描述，默认false
      deleteFailedUpload: boolean, // 可选，自动删除上传失败的图片，默认false
      // 注意配置这个之后需要配置`layers`接管渲染，否则不会在`dom`里面渲染出来
      addAttributes: IUserAttrsConfig;
      uploadMaxWidth: number; // 可选，上传图片的限制宽度，naturalWidth大于这个宽度的图片会使用配置的值作为宽度（默认宽度375）；0代表不做限制
  }),
]
```

## 示例

[letter-space](https://codesandbox.io/embed/plugin-image-u6994?hidenavigation=1 ':include :type=iframe width=100% height=500px')
