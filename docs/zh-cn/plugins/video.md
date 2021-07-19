# VideoPlugin <!-- {docsify-ignore-all} -->

> [类型](/zh-cn/plugins/types)

```typescript
import { VideoPlugin } from '@syllepsis/plugin-basic';

plugins: [
  new VideoPlugin({
    // 上传视频文件，返回视频地址，宽高信息
    uploader: (file: File) => Promise.resolve({ src: string, width: number, height: number }),
    // 注意配置这个之后需要配置`layers`接管渲染，否则不会在`dom`里面渲染出来
    addAttributes: IUserAttrsConfig; // 扩展默认attrs
  })
]
```

## 示例

[video](https://codesandbox.io/embed/plugin-video-qr40c?hidenavigation=1 ':include :type=iframe width=100% height=500px')
