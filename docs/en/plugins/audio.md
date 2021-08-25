# AudioPlugin <!-- {docsify-ignore-all} -->

> [Type](/en/plugins/types)

```typescript
import {AudioPlugin} from'@syllepsis/plugin-basic';

plugins: [
   new AudioPlugin({
     // Upload audio file and return audio address
     uploader: (file: File) => Promise.resolve({ src: string }),
     // Note that after configuring this, you need to configure `layers` to take over rendering,
     // otherwise it will not be rendered in `dom`
     addAttributes: IUserAttrsConfig; // Optional, Extend default attrs
     accept: string, // Optional, accepted file type
   })
]
```

## Example

[audio](https://codesandbox.io/embed/plugin-audio-4cgdq?hidenavigation=1 ':include :type=iframe width=100% height=500px')
