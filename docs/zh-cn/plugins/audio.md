# AudioPlugin <!-- {docsify-ignore-all} -->

> [类型](/zh-cn/plugins/types)

```typescript
import { AudioPlugin } from '@syllepsis/plugin-basic';

plugins: [
  new AudioPlugin({
    // 上传音频文件，返回音频地址
    uploader: (file: File) => Promise.resolve({ src: string }),
    // 注意配置这个之后需要配置`layers`接管渲染，否则不会在`dom`里面渲染出来
    addAttributes: IUserAttrsConfig; // 可选，扩展默认attrs
    accept: string, // 可选，接受的文件类型
    uploadBeforeInsert: boolean, // 可选，上传完成后插入，默认true
  })
]
```

## 示例

[audio](https://codesandbox.io/embed/plugin-audio-4cgdq?hidenavigation=1 ':include :type=iframe width=100% height=500px')
