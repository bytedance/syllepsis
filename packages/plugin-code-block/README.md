# @syllepsis/plugin-code-block

[official website](https://bytedance.github.io/syllepsis/)

`codemirror` combined with `syllepsis` can help you show and edit code in `syllepsis`.

```
import { CodeBlockPlugin } from '@syllepsis/plugin-code-block';

new CodeBlockPlugin({
  mode: string; // note that you should import the mode you specific from `codemirror/mode` by yourself. (default: javascript)
})
```
