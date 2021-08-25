## [0.0.11](https://github.com/bytedance/syllepsis/compare/v0.0.10...v0.0.11) (2021-08-25)


### 🎉 Features

* **plugin-basic:** ImagePlugin: support `uploadMaxWidth` to limit width when upload
* **public-basic:** Audio/VideoPlugin: support `accept` props


### 🐞 Bug Fixers

* **plugin-basic:** the ratio is wrong  after change the width when no height  is passed, closes [#28](https://github.com/bytedance/syllepsis/issues/28)

## [0.0.10](https://github.com/bytedance/syllepsis/compare/v0.0.9...v0.0.10) (2021-08-24)


### 🎉 Features

* **adapter:** SylApi: emit support passing arguments
* **plugin-basic:** ImagePlugin: allowDomains props support function type, closes [#27](https://github.com/bytedance/syllepsis/issues/27)


### 🐞 Bug Fixers

* **access-react:** locale not working for plugins with dropdown, closes [#24](https://github.com/bytedance/syllepsis/issues/24)
* **adapter:** object attrs values are not stringify in the default toDOM, closes [#25](https://github.com/bytedance/syllepsis/issues/25)


### 🔨 Refactor

* **access-react:** change active style in dropdown menu

## [0.0.9](https://github.com/bytedance/syllepsis/compare/v0.0.8...v0.0.9) (2021-08-16)


### 🐞 Bug Fixers

* **access-react:** plugins that use dropdown haven't show name when in dropdown, closes [#22](https://github.com/bytedance/syllepsis/issues/22)
* **plugin-basic:** default value config not working when set falsy value

## [0.0.8](https://github.com/bytedance/syllepsis/compare/v0.0.7...v0.0.8) (2021-08-12)


### 🐞 Bug Fixers

* **adapter:** possible XSS when parsing HTML

## [0.0.7](https://github.com/bytedance/syllepsis/compare/v0.0.6...v0.0.7) (2021-08-10)


### 🎉 Features

* **adapter:** SylApi: support `selectNode` in `setSelection` and return `node` in `getSelection`, closes [#18](https://github.com/bytedance/syllepsis/issues/18)


### 🔨 Refactor

* **access-react:** close picker after change color

## [0.0.6](https://github.com/bytedance/syllepsis/compare/v0.0.5...v0.0.6) (2021-08-05)


### 🎉 Features

* **access-react:** use a new ColorPick for color and background plugin


### 🐞 Bug Fixers

* **access-react:** dropdown menu is empty in 'toolbarInline', closes [#16](https://github.com/bytedance/syllepsis/issues/16)

## [0.0.5](https://github.com/bytedance/syllepsis/compare/v0.0.4...v0.0.5) (2021-08-03)


### 🐞 Bug Fixers

* **adapter:** SylApi: setFormat can't stored format, closes [#13](https://github.com/bytedance/syllepsis/issues/13)
* **ImagePlugin:** lost caption after paste, closes [#14](https://github.com/bytedance/syllepsis/issues/14)

## [0.0.4](https://github.com/bytedance/syllepsis/compare/v0.0.3...v0.0.4) (2021-08-02)


### 🐞 Bug Fixers

* **access-react:** ImagePlugin: can't input caption, closes [#11](https://github.com/bytedance/syllepsis/issues/11)
* **access-react:** ImagePlugin: resize container  can exceed the target
* **plugin-basic:** ImagePlugin: click on the image but sometimes get the wrong text selection

## [0.0.3](https://github.com/bytedance/syllepsis/compare/v0.0.2...v0.0.3) (2021-07-30)


### 🐞 Bug Fixers

* **access-react:** ImagePlugin: sometimes stuck in rendering
* **plugin-basic:** ListItem: parsing error when only have one child element


### 🔨 Refactor

* **plugin-basic:** ImagePlugin: remove default width in correct size

## [0.0.2](https://github.com/bytedance/syllepsis/compare/v0.0.2-alpha.0...v0.0.2) (2021-07-29)


### 🎉 Features

* **plugin-basic:** ImagePlugin: add parse of width and height in style


### 🐞 Bug Fixers

* **access-react:** ImagePlugin: align menu icons are not aligned
* **adapter:** SylApi: failed to setFormat with multi mark format

