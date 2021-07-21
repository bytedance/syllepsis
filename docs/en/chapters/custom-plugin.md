# Custom plugin

This demo shows that **how to custom your own Plugin.**

## Expected

1. **Markdown syntax**: when typing `~~text~~ `, automatically converted to strikethrough.
2. **Identify the source**: HTML Tags `<del> text</del>`, `<strike> text</strike>`, `<div style="text-decoration: line-through;">` can be recognized as strikethrough.
3. **Display:** All strikethrough are displayed with `<s>text</s>`
4. **Shortcut keys**: when presses `Ctrl + \` ( Or `Command + \` on Mac), apply strikethrough format.

## Tips

1. **Markdown syntax**: configure the `matcher` attribute (regular) of `textMatcher` to recognize text
2. **Identify the source**: configure the `parseDOM` attribute to declare which `HTML` data will be recognized as strikethrough
3. **Display**: configure the `toDOM` property, describe how to display data in the `DOM`
4. **Shortcut keys**: configure the `keymap` property, quickly register shortcut keys

Of course, the following code also mentions two types of Class: `Controller` and `Schema`. This is an MVC-like way of organizing code.

- `Controller`: generally related to **user interaction**
- `Schema`: generally related to the **editor data model**

## Example

Try:

1. Enter text
2. Press shortcut `Ctrl + \`, then enter text
3. Select text and press `Ctrl + \`

[custom-plugin](https://codesandbox.io/embed/custom-plugin-en-rwnk2?hidenavigation=1 ':include :type=iframe width=100% height=500px')