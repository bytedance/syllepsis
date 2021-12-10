## [0.1.6](https://github.com/edeity/syllepsis/compare/v0.1.5...v0.1.6) (2021-12-10)


### 🎉 Features

* add example about placeholder plugins

## [0.1.5](https://github.com/edeity/syllepsis/compare/v0.1.4...v0.1.5) (2021-12-10)


### 🎉 Features

* add placeholder plugins

## [0.1.4](https://github.com/edeity/syllepsis/compare/v0.1.3...v0.1.4) (2021-12-09)


### 🐞 Bug Fixers

* Fix the problem that pictures cannot be inserted in the table;  table row self resizing when a card containing the width attr is inserted;

## [0.1.3](https://github.com/edeity/syllepsis/compare/v0.1.2...v0.1.3) (2021-12-09)


### 🐞 Bug Fixers

* **adapter:** duplicate props of `IEventHandler` and `EditorProps` will confilct, closes [#91](https://github.com/edeity/syllepsis/issues/91)

## [0.1.2](https://github.com/edeity/syllepsis/compare/v0.1.1...v0.1.2) (2021-12-02)


### 🐞 Bug Fixers

* **adapter:** updating the `placeholder` configuration does not take effect directly

## [0.1.1](https://github.com/edeity/syllepsis/compare/v0.1.0...v0.1.1) (2021-11-16)


### 🐞 Bug Fixers

* treat `paragraph` as a not defining `node`, closes [#86](https://github.com/edeity/syllepsis/issues/86)

# [0.1.0](https://github.com/edeity/syllepsis/compare/v0.0.22...v0.1.0) (2021-10-22)


### 🎉 Features

* **adapter:** `configurator` supports `registerController` method, closes [#80](https://github.com/edeity/syllepsis/issues/80)
* **adapter:** `configurator` supports `unregisterController` method
* **SylPlugin:** `SylPlugin` supports `asyncController` to be used to load `Controller` asynchronously
* **toolbar:** `tooltips` option supports `false` to disable `tooltip`
* **toolbarInline:** `toolbarInline` supports command `getEnable`


### 🐞 Bug Fixers

* ensure the dropdown menus of `color`, `background`, `emoji` display in visible area, closes [#84](https://github.com/edeity/syllepsis/issues/84)


### 🔨 Refactor

* **Controller:** remove `Controller` supports of `textMatcher`
* **toolbar:** renamed the `toolbar` command from `getAvaliable` to `getEnable`


### BREAKING CHANGE

* **Controller:** `Controller` no longer supports `textMatcher`
* **toolbar:** `toolbar` command no longer supports `getAvaliable`

## [0.0.22](https://github.com/edeity/syllepsis/compare/v0.0.21...v0.0.22) (2021-10-18)


### 🐞 Bug Fixers

* **adapter:** The result of `getHTML` contains extra `ProseMirror-trailingBreak`, closes [#81](https://github.com/edeity/syllepsis/issues/81)

## [0.0.21](https://github.com/edeity/syllepsis/compare/v0.0.20...v0.0.21) (2021-10-13)


### 🎉 Features

* **color:** open `color-picker` will set the active color
* **ImagePlugin:** support `renderFailed` to render node when image fails to load, closes [#75](https://github.com/edeity/syllepsis/issues/75)
* **plugin-basic:** provide default style file, closes [#74](https://github.com/edeity/syllepsis/issues/74)
* **StrikePlugin:** support `Mod-d` to toggle strike


### 🐞 Bug Fixers

* **access-react:** `color-picker` style compatible with `rtl`
* **ImagePlugin:** `disableCaption` did not remove `attrs.alt`, closes [#76](https://github.com/edeity/syllepsis/issues/76)
* **LetterSpacePlugin:** accept `0` as a avaliable value, closes [#78](https://github.com/edeity/syllepsis/issues/78)
* **UnderlinePlugin:** `Mod-u` does not toggle `underline`, closes [#79](https://github.com/edeity/syllepsis/issues/79)

## [0.0.20](https://github.com/edeity/syllepsis/compare/v0.0.19...v0.0.20) (2021-09-29)


### 🎉 Features

* **LinkPlugin:** ensure link tooltip will display in visible area, closes [#67](https://github.com/edeity/syllepsis/issues/67)


### 🐞 Bug Fixers

* **plugin-basic:** lost list type when paste content is from outside, closes [#68](https://github.com/edeity/syllepsis/issues/68)
* **TablePlugin:** ensure table menu display in visible area, closes [#72](https://github.com/edeity/syllepsis/issues/72)
* **TablePlugin:** menu closes at the wrong time to leave, closes [#71](https://github.com/edeity/syllepsis/issues/71)

## [0.0.19](https://github.com/edeity/syllepsis/compare/v0.0.18...v0.0.19) (2021-09-23)


### 🐞 Bug Fixers

* **access-react:** repalce link get error when there are multiple editor instances, closes [#65](https://github.com/edeity/syllepsis/issues/65)
* **ImagePlugin:** replace image hasn't trigger `uploader`, closes [#60](https://github.com/edeity/syllepsis/issues/60)
* **plugin-baisc:** paste list at head of `list_item` will replace parent node by mistake, closes [#59](https://github.com/edeity/syllepsis/issues/59)


### 🔨 Refactor

* remove default 'left' align of `paragraph` and `list_item` node, closes [#63](https://github.com/edeity/syllepsis/issues/63)

## [0.0.18](https://github.com/edeity/syllepsis/compare/v0.0.17...v0.0.18) (2021-09-22)


### 🐞 Bug Fixers

* **access-react:** toolbar button setFormat by mistake  when attrs is false and format is not activa, closes [#56](https://github.com/edeity/syllepsis/issues/56)

## [0.0.17](https://github.com/edeity/syllepsis/compare/v0.0.15...v0.0.17) (2021-09-17)


### 🎉 Features

* **adapter:** SylApi: support `dispatchEvent` for triggering events, closes [#49](https://github.com/edeity/syllepsis/issues/49)
* **adapter:** SylApi: support `pasteContent` to simulate paste behavior, closes [#43](https://github.com/edeity/syllepsis/issues/43)
* support `eventHandler` props to register `eventHandler`, closes [#44](https://github.com/edeity/syllepsis/issues/44)
* support `keymap` props to register `keymap`, closes [#52](https://github.com/edeity/syllepsis/issues/52)
* support config `scrollThreshold` and `scrollMargin`, closes [#54](https://github.com/edeity/syllepsis/issues/54)


### 🔨 Refactor

* **adapter:** change collect handler of custrom ctrl
* add `sourcesContent` to `.map` files, closes [#45](https://github.com/edeity/syllepsis/issues/45)
* **plugin-basic:** add `ignoretag` to attrs when there are no other attrs

## [0.0.15](https://github.com/edeity/syllepsis/compare/v0.0.14...v0.0.15) (2021-09-13)


### 🎉 Features

* **ImagePlugin:** support `renderLoading` props to rending loading node while uploading image, closes [#41](https://github.com/edeity/syllepsis/issues/41)


### 🐞 Bug Fixers

* **ImagePlugin:** Array configuration of `allowDomains` does not work, closes [#40](https://github.com/edeity/syllepsis/issues/40)

## [0.0.14](https://github.com/edeity/syllepsis/compare/v0.0.13...v0.0.14) (2021-09-09)


### 🎉 Features

* **access-react:** support define default item in toolbar value


### 🐞 Bug Fixers

* **ImagePlugin:** `deleteFailedUpload` not working when `uploadBeforeInsert` is true, closes [#38](https://github.com/edeity/syllepsis/issues/38)

## [0.0.13](https://github.com/edeity/syllepsis/compare/v0.0.12...v0.0.13) (2021-09-08)


### 🐞 Bug Fixers

* **adapter:** SylApi: `setFormat` remove the excluded marks by fault when using to clear mark, closes [#34](https://github.com/edeity/syllepsis/issues/34)
* **adapter:** SylApi: getHTML() returned prosemirror hack content, closes [#37](https://github.com/edeity/syllepsis/issues/37)
* **ImagePlugin:** attrs passed by `uploader` will not update node  when `src` is the same, closes [#35](https://github.com/edeity/syllepsis/issues/35)
* **plugin:** lost select style of img and link


### 🔨 Refactor

* **ImagePlugin:** reduce resize handler area

## [0.0.12](https://github.com/edeity/syllepsis/compare/v0.0.11...v0.0.12) (2021-09-02)


### 🎉 Features

* **access-react:** use `isMatchObject` instead of `string` to get the actived item of dropdown menu, closes [#31](https://github.com/edeity/syllepsis/issues/31)


### 🐞 Bug Fixers

* **ImagePlugin:** `addAttributes` not working on '.syl-image-wrapper', closes [#32](https://github.com/edeity/syllepsis/issues/32)


### 🔨 Refactor

* **adapter:** remove the dependency of `reflect-metadata`

## [0.0.11](https://github.com/edeity/syllepsis/compare/v0.0.10...v0.0.11) (2021-08-25)


### 🎉 Features

* **plugin-basic:** ImagePlugin: support `uploadMaxWidth` to limit width when upload
* **public-basic:** Audio/VideoPlugin: support `accept` props


### 🐞 Bug Fixers

* **plugin-basic:** the ratio is wrong  after change the width when no height  is passed, closes [#28](https://github.com/edeity/syllepsis/issues/28)

## [0.0.10](https://github.com/edeity/syllepsis/compare/v0.0.9...v0.0.10) (2021-08-24)


### 🎉 Features

* **adapter:** SylApi: emit support passing arguments
* **plugin-basic:** ImagePlugin: allowDomains props support function type, closes [#27](https://github.com/edeity/syllepsis/issues/27)


### 🐞 Bug Fixers

* **access-react:** locale not working for plugins with dropdown, closes [#24](https://github.com/edeity/syllepsis/issues/24)
* **adapter:** object attrs values are not stringify in the default toDOM, closes [#25](https://github.com/edeity/syllepsis/issues/25)


### 🔨 Refactor

* **access-react:** change active style in dropdown menu

## [0.0.9](https://github.com/edeity/syllepsis/compare/v0.0.8...v0.0.9) (2021-08-16)


### 🐞 Bug Fixers

* **access-react:** plugins that use dropdown haven't show name when in dropdown, closes [#22](https://github.com/edeity/syllepsis/issues/22)
* **plugin-basic:** default value config not working when set falsy value

## [0.0.8](https://github.com/edeity/syllepsis/compare/v0.0.7...v0.0.8) (2021-08-12)


### 🐞 Bug Fixers

* **adapter:** possible XSS when parsing HTML

## [0.0.7](https://github.com/edeity/syllepsis/compare/v0.0.6...v0.0.7) (2021-08-10)


### 🎉 Features

* **adapter:** SylApi: support `selectNode` in `setSelection` and return `node` in `getSelection`, closes [#18](https://github.com/edeity/syllepsis/issues/18)


### 🔨 Refactor

* **access-react:** close picker after change color

## [0.0.6](https://github.com/edeity/syllepsis/compare/v0.0.5...v0.0.6) (2021-08-05)


### 🎉 Features

* **access-react:** use a new ColorPick for color and background plugin


### 🐞 Bug Fixers

* **access-react:** dropdown menu is empty in 'toolbarInline', closes [#16](https://github.com/edeity/syllepsis/issues/16)

## [0.0.5](https://github.com/edeity/syllepsis/compare/v0.0.4...v0.0.5) (2021-08-03)


### 🐞 Bug Fixers

* **adapter:** SylApi: setFormat can't stored format, closes [#13](https://github.com/edeity/syllepsis/issues/13)
* **ImagePlugin:** lost caption after paste, closes [#14](https://github.com/edeity/syllepsis/issues/14)

## [0.0.4](https://github.com/edeity/syllepsis/compare/v0.0.3...v0.0.4) (2021-08-02)


### 🐞 Bug Fixers

* **access-react:** ImagePlugin: can't input caption, closes [#11](https://github.com/edeity/syllepsis/issues/11)
* **access-react:** ImagePlugin: resize container  can exceed the target
* **plugin-basic:** ImagePlugin: click on the image but sometimes get the wrong text selection

## [0.0.3](https://github.com/edeity/syllepsis/compare/v0.0.2...v0.0.3) (2021-07-30)


### 🐞 Bug Fixers

* **access-react:** ImagePlugin: sometimes stuck in rendering
* **plugin-basic:** ListItem: parsing error when only have one child element


### 🔨 Refactor

* **plugin-basic:** ImagePlugin: remove default width in correct size

## [0.0.2](https://github.com/edeity/syllepsis/compare/v0.0.2-alpha.0...v0.0.2) (2021-07-29)


### 🎉 Features

* **plugin-basic:** ImagePlugin: add parse of width and height in style


### 🐞 Bug Fixers

* **access-react:** ImagePlugin: align menu icons are not aligned
* **adapter:** SylApi: failed to setFormat with multi mark format

