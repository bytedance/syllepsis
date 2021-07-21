# Writing components

Although `SylEditor` has provided plug-ins built-in, in most scenarios, developers want to import their own UI-libs. Following example will illustrate how to connect React components with the editor.

## Custom button

We want to achieve two functions:

- When **click** button, **style** will apply to **selection**.
- When **selecting** text, **highlight** button.

## Tips

1. Obtain `editor` reference through `getEditor`. 
2. When **click** button, use `editor.setFormat` to apply style.
3. Use `editor.on (eventName)` to listen event. When **selection changes** happened, use `editor.isActive` to obtain status, then **Highlight** button.

?> For more API instructions, please refer to the [API](/en/api) chapter

## Example

[custom-component](https://codesandbox.io/embed/custom-component-en-7cjre?hidenavigation=1 ':include :type=iframe width=100% height=500px')