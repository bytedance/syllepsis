# [0.0.0](https://github.com/bytedance/syllepsis/compare/v0.1.64-alpha.2...v0.0.0) (2023-12-27)


### 🐞 Bug Fixers

* test ci
* test ci

## [0.1.63](https://github.com/bytedance/syllepsis/compare/v0.1.62...v0.1.63) (2023-03-08)


### 🎉 Features

* **Adapter:** Support `clickSpacingToInsertLine` configuration to co… (#230), closes [#230](https://github.com/bytedance/syllepsis/issues/230) [#229](https://github.com/bytedance/syllepsis/issues/229)

## [0.1.62](https://github.com/bytedance/syllepsis/compare/v0.1.61...v0.1.62) (2023-01-12)


### 🎉 Features

* **InlineToolbar:** Support for rendering custom buttons (#218), closes [#218](https://github.com/bytedance/syllepsis/issues/218)

## [0.1.61](https://github.com/bytedance/syllepsis/compare/v0.1.60...v0.1.61) (2023-01-06)


### 🐞 Bug Fixers

* **Adapter:** `inline-leaf` shortcut not inheriting marks (#216), closes [#216](https://github.com/bytedance/syllepsis/issues/216) [#215](https://github.com/bytedance/syllepsis/issues/215)

## [0.1.60](https://github.com/bytedance/syllepsis/compare/v0.1.59...v0.1.60) (2022-11-30)


### 🐞 Bug Fixers

* **ImagePlugin:** Disable editing operations on the image until the upload is successful (#213), closes [#213](https://github.com/bytedance/syllepsis/issues/213) [#211](https://github.com/bytedance/syllepsis/issues/211)

## [0.1.59](https://github.com/bytedance/syllepsis/compare/v0.1.58...v0.1.59) (2022-11-14)


### 🐞 Bug Fixers

* **ListItemPlugin:** Error merging adjacent isolating nodes(#204), closes [#204](https://github.com/bytedance/syllepsis/issues/204)

## [0.1.58](https://github.com/bytedance/syllepsis/compare/v0.1.57...v0.1.58) (2022-11-11)


### 🐞 Bug Fixers

* **BasicCtrl:** Difficulty triggering auto-insert paragraph when clicking between tables (#203), closes [#203](https://github.com/bytedance/syllepsis/issues/203) [#201](https://github.com/bytedance/syllepsis/issues/201)

## [0.1.57](https://github.com/bytedance/syllepsis/compare/v0.1.56...v0.1.57) (2022-10-11)


### 🎉 Features

* **AlignPlugin:** Support `inclusive` configuration to include related nodes (#197), closes [#197](https://github.com/bytedance/syllepsis/issues/197) [#196](https://github.com/bytedance/syllepsis/issues/196)
* **SylApi:** When `insert` into an `isolating` node, a valid text block node will be appended to th


### 🐞 Bug Fixers

* **SylApi:** When `insert` an acceptable node type in a nested node, it was inserted in the wrong position, closes [#195](https://github.com/bytedance/syllepsis/issues/195)

## [0.1.56](https://github.com/bytedance/syllepsis/compare/v0.1.55...v0.1.56) (2022-10-10)


### 🎉 Features

* **TablePlugin:** Support `menus` to configure custom context menu (#194), closes [#194](https://github.com/bytedance/syllepsis/issues/194)


### 🐞 Bug Fixers

* **Toolbar:** The `enable` state of the toolbar is out of sync with the initial `disable` props

## [0.1.55](https://github.com/bytedance/syllepsis/compare/v0.1.54...v0.1.55) (2022-09-30)


### 🐞 Bug Fixers

* **SylApi:** `setFormat` doesn't prevserve the acceptable nodes (#193), closes [#193](https://github.com/bytedance/syllepsis/issues/193) [#191](https://github.com/bytedance/syllepsis/issues/191)

## [0.1.53](https://github.com/bytedance/syllepsis/compare/v0.1.52...v0.1.53) (2022-09-21)


### 🐞 Bug Fixers

* **ImagePlugin:** Sometimes it uploads twice after insert (#188), closes [#188](https://github.com/bytedance/syllepsis/issues/188)

## [0.1.52](https://github.com/bytedance/syllepsis/compare/v0.1.51...v0.1.52) (2022-09-20)


### 🐞 Bug Fixers

* **ImagePlugin:** Upload handler isn't triggered when pasting files (#187), closes [#187](https://github.com/bytedance/syllepsis/issues/187)

## [0.1.51](https://github.com/bytedance/syllepsis/compare/v0.1.50...v0.1.51) (2022-08-22)


### 🐞 Bug Fixers

* **VideoPluign/AudioPlugin:** The return type validation of `uploader` doesn't accept values other t

## [0.1.50](https://github.com/bytedance/syllepsis/compare/v0.1.49...v0.1.50) (2022-08-18)


### 🐞 Bug Fixers

* **SylApi:** Duplicate nodes when toggle nested nodes

## [0.1.49](https://github.com/bytedance/syllepsis/compare/v0.1.48...v0.1.49) (2022-08-18)


### 🐞 Bug Fixers

* **SylApi:** Can't toggle between nodes that can and cannot nest themselves, closes [#167](https://github.com/bytedance/syllepsis/issues/167)

## [0.1.48](https://github.com/bytedance/syllepsis/compare/v0.1.47...v0.1.48) (2022-08-16)


### 🐞 Bug Fixers

* **LinkPlugin:** The default title of the `Link Modal` is revsersed when editing and inserting

## [0.1.47](https://github.com/bytedance/syllepsis/compare/v0.1.46...v0.1.47) (2022-08-15)


### 🐞 Bug Fixers

* **SylApi:** `replace` ignores marks configuration when `inheritMarks` is true, closes [#176](https://github.com/bytedance/syllepsis/issues/176)

## [0.1.46](https://github.com/bytedance/syllepsis/compare/v0.1.45...v0.1.46) (2022-08-11)


### 🎉 Features

* **ImagePlugin:** Upload file from clipboard when there is only a single image and the src of image, closes [#174](https://github.com/bytedance/syllepsis/issues/174)

## [0.1.45](https://github.com/bytedance/syllepsis/compare/v0.1.44...v0.1.45) (2022-07-24)


### 🎉 Features

* **plugin-basic:** Support `transparent` configuration in `ColorPlugin` and `BackgroundPlugin`


### 🐞 Bug Fixers

* **BackgroundPlugin:** Lost hex style alpha value, closes [#161](https://github.com/bytedance/syllepsis/issues/161)

## [0.1.44](https://github.com/bytedance/syllepsis/compare/v0.1.43...v0.1.44) (2022-07-19)


### 🎉 Features

* **HeaderPlugin:** Support `addAttributes` configuration in `HeaderPlugin`

## [0.1.42](https://github.com/bytedance/syllepsis/compare/v0.1.41...v0.1.42) (2022-06-23)


### 🐞 Bug Fixers

* **LinkPlugin:** Can't update the content of link in some cases

## [0.1.40](https://github.com/bytedance/syllepsis/compare/v0.1.39...v0.1.40) (2022-06-16)


### 🐞 Bug Fixers

* **ImagePlugin:** Resize the width can overflow the default `maxWidth`

## [0.1.39](https://github.com/bytedance/syllepsis/compare/v0.1.38...v0.1.39) (2022-06-15)


### 🐞 Bug Fixers

* **InlineImagePlugin:** Wrong HTML content was returned while loading

## [0.1.38](https://github.com/bytedance/syllepsis/compare/v0.1.37...v0.1.38) (2022-06-15)


### 🎉 Features

* **ImagePlugin:** Support `maxWidth` config


### 🤚 Reverts

* Revert "feat(ImagePlugin): Support `resizeMargin` config in `ImagePlugin`"

## [0.1.37](https://github.com/bytedance/syllepsis/compare/v0.1.36...v0.1.37) (2022-06-14)


### 🎉 Features

* **ImagePlugin:** Support `resizeMargin` config in `ImagePlugin`

## [0.1.36](https://github.com/bytedance/syllepsis/compare/v0.1.35...v0.1.36) (2022-06-13)


### 🎉 Features

* **Configurator:** Support set `keepMarks` in props to decide whether to keep marks after split in, closes [#145](https://github.com/bytedance/syllepsis/issues/145)

## [0.1.35](https://github.com/bytedance/syllepsis/compare/v0.1.34...v0.1.35) (2022-06-09)


### 🎉 Features

* **VideoPlugin/AudioPlugin:** Support `uploadBeforeInsert` config in `VideoPlugin` and `AudioPlugin (#149), closes [#149](https://github.com/bytedance/syllepsis/issues/149)

## [0.1.34](https://github.com/bytedance/syllepsis/compare/v0.1.33...v0.1.34) (2022-06-06)


### 🐞 Bug Fixers

* **SylEditor:** Edit state doesn't update correctly with props `disable` (#148), closes [#148](https://github.com/bytedance/syllepsis/issues/148) [#147](https://github.com/bytedance/syllepsis/issues/147)

## [0.1.33](https://github.com/bytedance/syllepsis/compare/v0.1.32...v0.1.33) (2022-06-02)


### 🔨 Refactor

* **Plugin:** Using another way  to extends prosemirror's Plugin (#146), closes [#146](https://github.com/bytedance/syllepsis/issues/146)

## [0.1.32](https://github.com/bytedance/syllepsis/compare/v0.1.31...v0.1.32) (2022-06-01)


### 🐞 Bug Fixers

* Failed to start when the version of prosemirror-view upper 1.24.0

## [0.1.30](https://github.com/bytedance/syllepsis/compare/v0.1.29...v0.1.30) (2022-05-31)


### 🐞 Bug Fixers

* **InlineImagePlugin:** `Resize handler` not working after `mousedown` (#144), closes [#144](https://github.com/bytedance/syllepsis/issues/144) [#143](https://github.com/bytedance/syllepsis/issues/143)

## [0.1.29](https://github.com/bytedance/syllepsis/compare/v0.1.28...v0.1.29) (2022-05-25)


### 🐞 Bug Fixers

* **ImagePlugin:** Error checking if `attrs` is equal in `updateImageUrl` (#142), closes [#142](https://github.com/bytedance/syllepsis/issues/142) [#141](https://github.com/bytedance/syllepsis/issues/141)

## [0.1.27](https://github.com/bytedance/syllepsis/compare/v0.1.26...v0.1.27) (2022-04-29)


### 🐞 Bug Fixers

* **BasicCtrl:** Don't show system popup when long pressing `placeholder` in mobile (#137), closes [#137](https://github.com/bytedance/syllepsis/issues/137) [#136](https://github.com/bytedance/syllepsis/issues/136)

## [0.1.25](https://github.com/bytedance/syllepsis/compare/v0.1.24...v0.1.25) (2022-04-20)


### 🎉 Features

* **SylPlugin:** Provide default `toDOM` configuration for `Card` (#134), closes [#134](https://github.com/bytedance/syllepsis/issues/134)

## [0.1.24](https://github.com/bytedance/syllepsis/compare/v0.1.23...v0.1.24) (2022-03-28)


### 🐞 Bug Fixers

* **CodeBlockPlugin:** Erroneously deleted empty `code_block` when pressing `Backspace` after, closes [#130](https://github.com/bytedance/syllepsis/issues/130)

## [0.1.23](https://github.com/bytedance/syllepsis/compare/v0.1.22...v0.1.23) (2022-03-15)


### 🐞 Bug Fixers

* **ImagePlugin:** Get an extra line when insert image at the first line, closes [#128](https://github.com/bytedance/syllepsis/issues/128)

## [0.1.22](https://github.com/bytedance/syllepsis/compare/v0.1.21...v0.1.22) (2022-03-15)


### 🐞 Bug Fixers

* **BasicCtrl:** It don't insert default node when click the head of doc

## [0.1.21](https://github.com/bytedance/syllepsis/compare/v0.1.20...v0.1.21) (2022-03-15)


### 🐞 Bug Fixers

* **BasicCtrl:** Sometimes get error "`getBoundingClientRect` is not a function" when clicked

## [0.1.20](https://github.com/bytedance/syllepsis/compare/v0.1.19...v0.1.20) (2022-03-15)


### 🐞 Bug Fixers

* **ImagePlugin:** Error while parsing `.syl-image-wrapper` without `<img>` element inside, closes [#126](https://github.com/bytedance/syllepsis/issues/126)

## [0.1.19](https://github.com/bytedance/syllepsis/compare/v0.1.18...v0.1.19) (2022-03-10)


### 🎉 Features

* **SylApi:** `replaceEmpty` is supported in `replace` api


### 🔨 Refactor

* **ImagePlugin:** Use another way to prevent require `undo` twice of a uploaded image

## [0.1.18](https://github.com/bytedance/syllepsis/compare/v0.1.17...v0.1.18) (2022-03-10)


### 🐞 Bug Fixers

* **BasicCtrl:** Insert default node to wrong posiont when windows browser, closes [#122](https://github.com/bytedance/syllepsis/issues/122)


### 🤚 Reverts

* Revert "feat(SylApi): `replaceEmpty` is supported in `replace` api"

## [0.1.17](https://github.com/bytedance/syllepsis/compare/v0.1.16...v0.1.17) (2022-03-10)


### 🐞 Bug Fixers

* **ImagePlugin:** Error when parsing `<img>` without `align` attribute, closes [#120](https://github.com/bytedance/syllepsis/issues/120)

## [0.1.16](https://github.com/bytedance/syllepsis/compare/v0.1.15...v0.1.16) (2022-03-09)


### 🐞 Bug Fixers

* `Backspace` can't delete empty line at head, closes [#119](https://github.com/bytedance/syllepsis/issues/119)
* **BasicCtrl:** It sometimes can't insert default node

## [0.1.15](https://github.com/bytedance/syllepsis/compare/v0.1.14...v0.1.15) (2022-03-09)


### 🐞 Bug Fixers

* **ImagePlugin:** `align` overridden by `addAttributes` does not work, closes [#116](https://github.com/bytedance/syllepsis/issues/116)

## [0.1.14](https://github.com/bytedance/syllepsis/compare/v0.1.13...v0.1.14) (2022-03-08)


### 🎉 Features

* **BasicCtrl:** Insert default `doc` content type when click empty area between block atom nodes, closes [#113](https://github.com/bytedance/syllepsis/issues/113)
* **SylApi:** `replaceEmpty` is supported in `replace` api


### 🐞 Bug Fixers

* **SylApi:** `replaceCard` do not replace node with default length


### 🔨 Refactor

* **ImagePlugin:** Expect config checkBeforeInsert to return `promise`


### BREAKING CHANGE

* **ImagePlugin:** `checkBeforeInsert` return `boolean` in previous version

## [0.1.13](https://github.com/bytedance/syllepsis/compare/v0.1.12...v0.1.13) (2022-03-02)


### 🎉 Features

* **ImagePlugin:** Support `checkBeforeInsert` config in `ImagePlugin`, closes [#111](https://github.com/bytedance/syllepsis/issues/111)

## [0.1.12](https://github.com/bytedance/syllepsis/compare/v0.1.11...v0.1.12) (2022-03-02)


### 🎉 Features

* **SylApi:** `addToHistory` config is supported  in `insert` `replace` and `delete` of `SylApi`, closes [#109](https://github.com/bytedance/syllepsis/issues/109)


### 🐞 Bug Fixers

* **ImagePlugin:** Drag fails when config `disableCaption`, closes [#108](https://github.com/bytedance/syllepsis/issues/108)

## [0.1.11](https://github.com/bytedance/syllepsis/compare/v0.1.10...v0.1.11) (2022-02-10)


### 🐞 Bug Fixers

* **access-react:** Missing `key` prop when rendering `more` type button
* **ImagePlugin:** Required `undo` twice to undo the uploaded images, closes [#106](https://github.com/bytedance/syllepsis/issues/106)

## [0.1.10](https://github.com/bytedance/syllepsis/compare/v0.1.9...v0.1.10) (2022-01-20)


### 🐞 Bug Fixers

* **access-react:** toolbar dropdown menu disappears when toolbar is updated #104 (#105), closes [#104](https://github.com/bytedance/syllepsis/issues/104) [#105](https://github.com/bytedance/syllepsis/issues/105)

## [0.1.8](https://github.com/bytedance/syllepsis/compare/v0.1.7...v0.1.8) (2021-12-24)


### 🎉 Features

* **experiment:** add `PlaceholderPlugin`

## [0.1.7](https://github.com/bytedance/syllepsis/compare/v0.1.6...v0.1.7) (2021-12-23)


### 🐞 Bug Fixers

* type defination file error retains relative path, closes [#96](https://github.com/bytedance/syllepsis/issues/96)

## [0.1.6](https://github.com/bytedance/syllepsis/compare/v0.1.5...v0.1.6) (2021-12-14)


### 🎉 Features

* support configuring `filterTransaction` in props and `Controller`

## [0.1.5](https://github.com/bytedance/syllepsis/compare/v0.1.4...v0.1.5) (2021-12-13)


### 🐞 Bug Fixers

* `command.toolbarInline.disable()` does not working when using `TablePlugin`

## [0.1.4](https://github.com/bytedance/syllepsis/compare/v0.1.3...v0.1.4) (2021-12-09)


### 🐞 Bug Fixers

* Fix the problem that pictures cannot be inserted in the table;  table row self resizing when a card containing the width attr is inserted;

## [0.1.3](https://github.com/bytedance/syllepsis/compare/v0.1.2...v0.1.3) (2021-12-09)


### 🐞 Bug Fixers

* **adapter:** duplicate props of `IEventHandler` and `EditorProps` will confilct, closes [#91](https://github.com/bytedance/syllepsis/issues/91)

## [0.1.2](https://github.com/bytedance/syllepsis/compare/v0.1.1...v0.1.2) (2021-12-02)


### 🐞 Bug Fixers

* **adapter:** updating the `placeholder` configuration does not take effect directly

## [0.1.1](https://github.com/bytedance/syllepsis/compare/v0.1.0...v0.1.1) (2021-11-16)


### 🐞 Bug Fixers

* treat `paragraph` as a not defining `node`, closes [#86](https://github.com/bytedance/syllepsis/issues/86)

# [0.1.0](https://github.com/bytedance/syllepsis/compare/v0.0.22...v0.1.0) (2021-10-22)


### 🎉 Features

* **adapter:** `configurator` supports `registerController` method, closes [#80](https://github.com/bytedance/syllepsis/issues/80)
* **adapter:** `configurator` supports `unregisterController` method
* **SylPlugin:** `SylPlugin` supports `asyncController` to be used to load `Controller` asynchronously
* **toolbar:** `tooltips` option supports `false` to disable `tooltip`
* **toolbarInline:** `toolbarInline` supports command `getEnable`


### 🐞 Bug Fixers

* ensure the dropdown menus of `color`, `background`, `emoji` display in visible area, closes [#84](https://github.com/bytedance/syllepsis/issues/84)


### 🔨 Refactor

* **Controller:** remove `Controller` supports of `textMatcher`
* **toolbar:** renamed the `toolbar` command from `getAvaliable` to `getEnable`


### BREAKING CHANGE

* **Controller:** `Controller` no longer supports `textMatcher`
* **toolbar:** `toolbar` command no longer supports `getAvaliable`

## [0.0.22](https://github.com/bytedance/syllepsis/compare/v0.0.21...v0.0.22) (2021-10-18)


### 🐞 Bug Fixers

* **adapter:** The result of `getHTML` contains extra `ProseMirror-trailingBreak`, closes [#81](https://github.com/bytedance/syllepsis/issues/81)

## [0.0.21](https://github.com/bytedance/syllepsis/compare/v0.0.20...v0.0.21) (2021-10-13)


### 🎉 Features

* **color:** open `color-picker` will set the active color
* **ImagePlugin:** support `renderFailed` to render node when image fails to load, closes [#75](https://github.com/bytedance/syllepsis/issues/75)
* **plugin-basic:** provide default style file, closes [#74](https://github.com/bytedance/syllepsis/issues/74)
* **StrikePlugin:** support `Mod-d` to toggle strike


### 🐞 Bug Fixers

* **access-react:** `color-picker` style compatible with `rtl`
* **ImagePlugin:** `disableCaption` did not remove `attrs.alt`, closes [#76](https://github.com/bytedance/syllepsis/issues/76)
* **LetterSpacePlugin:** accept `0` as a avaliable value, closes [#78](https://github.com/bytedance/syllepsis/issues/78)
* **UnderlinePlugin:** `Mod-u` does not toggle `underline`, closes [#79](https://github.com/bytedance/syllepsis/issues/79)

## [0.0.20](https://github.com/bytedance/syllepsis/compare/v0.0.19...v0.0.20) (2021-09-29)


### 🎉 Features

* **LinkPlugin:** ensure link tooltip will display in visible area, closes [#67](https://github.com/bytedance/syllepsis/issues/67)


### 🐞 Bug Fixers

* **plugin-basic:** lost list type when paste content is from outside, closes [#68](https://github.com/bytedance/syllepsis/issues/68)
* **TablePlugin:** ensure table menu display in visible area, closes [#72](https://github.com/bytedance/syllepsis/issues/72)
* **TablePlugin:** menu closes at the wrong time to leave, closes [#71](https://github.com/bytedance/syllepsis/issues/71)

## [0.0.19](https://github.com/bytedance/syllepsis/compare/v0.0.18...v0.0.19) (2021-09-23)


### 🐞 Bug Fixers

* **access-react:** repalce link get error when there are multiple editor instances, closes [#65](https://github.com/bytedance/syllepsis/issues/65)
* **ImagePlugin:** replace image hasn't trigger `uploader`, closes [#60](https://github.com/bytedance/syllepsis/issues/60)
* **plugin-baisc:** paste list at head of `list_item` will replace parent node by mistake, closes [#59](https://github.com/bytedance/syllepsis/issues/59)


### 🔨 Refactor

* remove default 'left' align of `paragraph` and `list_item` node, closes [#63](https://github.com/bytedance/syllepsis/issues/63)

## [0.0.18](https://github.com/bytedance/syllepsis/compare/v0.0.17...v0.0.18) (2021-09-22)


### 🐞 Bug Fixers

* **access-react:** toolbar button setFormat by mistake  when attrs is false and format is not activa, closes [#56](https://github.com/bytedance/syllepsis/issues/56)

## [0.0.17](https://github.com/bytedance/syllepsis/compare/v0.0.15...v0.0.17) (2021-09-17)


### 🎉 Features

* **adapter:** SylApi: support `dispatchEvent` for triggering events, closes [#49](https://github.com/bytedance/syllepsis/issues/49)
* **adapter:** SylApi: support `pasteContent` to simulate paste behavior, closes [#43](https://github.com/bytedance/syllepsis/issues/43)
* support `eventHandler` props to register `eventHandler`, closes [#44](https://github.com/bytedance/syllepsis/issues/44)
* support `keymap` props to register `keymap`, closes [#52](https://github.com/bytedance/syllepsis/issues/52)
* support config `scrollThreshold` and `scrollMargin`, closes [#54](https://github.com/bytedance/syllepsis/issues/54)


### 🔨 Refactor

* **adapter:** change collect handler of custrom ctrl
* add `sourcesContent` to `.map` files, closes [#45](https://github.com/bytedance/syllepsis/issues/45)
* **plugin-basic:** add `ignoretag` to attrs when there are no other attrs

## [0.0.15](https://github.com/bytedance/syllepsis/compare/v0.0.14...v0.0.15) (2021-09-13)


### 🎉 Features

* **ImagePlugin:** support `renderLoading` props to rending loading node while uploading image, closes [#41](https://github.com/bytedance/syllepsis/issues/41)


### 🐞 Bug Fixers

* **ImagePlugin:** Array configuration of `allowDomains` does not work, closes [#40](https://github.com/bytedance/syllepsis/issues/40)

## [0.0.14](https://github.com/bytedance/syllepsis/compare/v0.0.13...v0.0.14) (2021-09-09)


### 🎉 Features

* **access-react:** support define default item in toolbar value


### 🐞 Bug Fixers

* **ImagePlugin:** `deleteFailedUpload` not working when `uploadBeforeInsert` is true, closes [#38](https://github.com/bytedance/syllepsis/issues/38)

## [0.0.13](https://github.com/bytedance/syllepsis/compare/v0.0.12...v0.0.13) (2021-09-08)


### 🐞 Bug Fixers

* **adapter:** SylApi: `setFormat` remove the excluded marks by fault when using to clear mark, closes [#34](https://github.com/bytedance/syllepsis/issues/34)
* **adapter:** SylApi: getHTML() returned prosemirror hack content, closes [#37](https://github.com/bytedance/syllepsis/issues/37)
* **ImagePlugin:** attrs passed by `uploader` will not update node  when `src` is the same, closes [#35](https://github.com/bytedance/syllepsis/issues/35)
* **plugin:** lost select style of img and link


### 🔨 Refactor

* **ImagePlugin:** reduce resize handler area

## [0.0.12](https://github.com/bytedance/syllepsis/compare/v0.0.11...v0.0.12) (2021-09-02)


### 🎉 Features

* **access-react:** use `isMatchObject` instead of `string` to get the actived item of dropdown menu, closes [#31](https://github.com/bytedance/syllepsis/issues/31)


### 🐞 Bug Fixers

* **ImagePlugin:** `addAttributes` not working on '.syl-image-wrapper', closes [#32](https://github.com/bytedance/syllepsis/issues/32)


### 🔨 Refactor

* **adapter:** remove the dependency of `reflect-metadata`

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

