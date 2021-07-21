# Import plugin

## Import bold plugin

The `<SylEditor/>` component only provides the base ability to edit pure text. To expand more, we need to import `plugins` from `@syllepsis/plugin-basic` and pass them to `plugins` props.

```jsx
// import the "bold" plugin
import {BoldPlugin} from'@syllepsis/plugin-basic';
// ...

export default function App() {
  // plugins props
  return <SylEditor plugins={[new BoldPlugin()]} />;
}
// ...
```

Now, our editor already has the **bold** ability.

## Example

Tips: Use shortcut: `Ctrl + B` (`Command + B` for macOS) to trigger bold style.

[use-plugin](https://codesandbox.io/embed/use-plugin-hkfgw?hidenavigation=1 ':include :type=iframe width=100% height=500px')