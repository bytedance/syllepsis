# ImagePlugin <!-- {docsify-ignore-all} -->

> [Type](/en/plugins/types)

```typescript
import {ImagePlugin} from'@syllepsis/access-react';

plugins: [
  new ImagePlugin({
      // Image upload method, accept a'blob' or'file', and return the image address or object
      // If it is a picture pasted from outside, uploader will be a string when entering the conference
      uploader: (img: Blob | File | string) => Promise<string | {src: string, width: number, height: number }>,
      onUploadError: (img: File | Blob | string, err: Event) => any, // upload failed callback
      allowDomains: [string|Regexp], // Optional, allowed src, the uploader won't be triggered if not match (all src are allowed without configuration)
      uploadType:'blob'|'file',// Optional, file type accepted by uploader, default'blob'
      listenDrop: boolean, // Optional, listen for external file drop events, default true
      listenPaste: boolean, // Optional, listen to external file paste events, default true
      placeholder: string, // Optional (inline pictures are not supported), the default value of picture description
      maxLength: number, // Optional (inline pictures are not supported), the maximum length of the picture description, the default is 20
      uploadBeforeInsert: boolean, // Optional, insert after uploaded, default false
      disableResize: boolean, // Optional, whether to disable the zoom function, the default is false
      accept: string, // Optional, accepted file type
      disableAlign: boolean, // Optional (inline pictures are not supported), whether to disable picture alignment, the default is false
      disableCaption: boolean, // Optional (inline pictures are not supported), whether to disable the display of picture descriptions, the default is false
      deleteFailedUpload: boolean, // Optional, automatically delete failed pictures, the default is false
      // Note that after configuring this, you need to configure `layers` to take over rendering, otherwise it will not be rendered in `dom`
      addAttributes: IUserAttrsConfig;
  }),
]
```

## Example

[letter-space](https://codesandbox.io/embed/plugin-image-u6994?hidenavigation=1 ':include :type=iframe width=100% height=500px')