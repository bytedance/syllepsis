# Custom card plugin

## Card plugin？

when using [Notion](https://www.notion.so/product?fredir=1), it's easy to import elements  (such as video, audio, etc.), so do `Syllepsis`!

In most scenarios, we don't care about data inside element, but need to exchange data. For this business scenario, we abstracted it as a `Card`.

Like all plugins, cards also have `Schema` and `Controller`. `Controller` could replace with `React Component`, and we just need to describe `Schema`.

In other words, we need to declare:

1. What kind of data can be recognized as a card (`parseDOM`, `textMatcher`)
2. How card displayed (`toDOM`)

Following example contains a new attribute: `ViewMap`.

In `ViewMap`, `template` and `mask` need to be defined by default. 

- `mask`: how to render in editor
- `template`: how to display when upload (simplify data)

## Example

[card-plugin](https://codesandbox.io/embed/card-plugin-en-9s95l?hidenavigation=1 ':include :type=iframe width=100% height=500px')