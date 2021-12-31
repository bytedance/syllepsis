# 插件

插件是`Syllepsis`的一大特色，和绝大多数插件一样，Syllepsis 的插件指一种**可插拔**的能力。

Syllepsis 已内置了一系列的基础插件，可在以下列表中查找合适的插件。

忘了如何引用？可回顾：[引用插件](/zh-cn/chapters/use-plugin)。

哪怕找不到合适的插件，也不要灰心，Syllepsis 提供了一套方式，开发者可以相对简单地自定义自己的插件，请回顾：

- [自定义插件](/zh-cn/chapters/custom-plugin)
- [卡片插件](/zh-cn/chapters/card-plugin)
- [插件与组件](/zh-cn/chapters/plugin-component)

### 文本样式

| plugin              | 描述       | 内置 icon 标识 | markdown                                   | 参数                                | 引入                      |
| ------------------- | ---------- | -------------- | ------------------------------------------ | ----------------------------------- | ------------------------- |
| `BoldPlugin`        | 粗体       | `bold`         | `**文字**` + `空格`                        |                                     | `@syllepsis/plugin-basic` |
| `ItalicPlugin`      | 斜体       | `italic`       | `*文字*` + `空格`                          |                                     | `@syllepsis/plugin-basic` |
| `UnderlinePlugin`   | 下划线     | `underline`    | `~文字~` + `空格` <br/>`++文字++` + `空格` |                                     | `@syllepsis/plugin-basic` |
| `StrikePlugin`      | 删除线文本 | `strike`       | `~~文字~~` + `空格`                        |                                     | `@syllepsis/plugin-basic` |
| `FontSizePlugin`    | 字体大小   | `font_size`    |                                            | [Link](/zh-cn/plugins/font-size)    | `@syllepsis/plugin-basic` |
| `LetterSpacePlugin` | 字体间距   | `letter_space` |                                            | [Link](/zh-cn/plugins/letter-space) | `@syllepsis/plugin-basic` |
| `SupPlugin`         | 上标文本   | `sup`          |                                            |                                     | `@syllepsis/plugin-basic` |
| `SubPlugin`         | 下标文本   | `sub`          |                                            |                                     | `@syllepsis/plugin-basic` |
| `BackgroundPlugin`  | 文本背景   | `background`   |                                            | [Link](zh-cn/plugins/background)    | `@syllepsis/access-*`     |
| `ColorPlugin`       | 文本颜色   | `color`        |                                            | [Link](zh-cn/plugins/color)         | `@syllepsis/access-*`     |

### 文本块类型

| 插件名              | 描述     | 内置 icon 标识 | markdown                                                                                                     | 参数                             | 引入                                                |
| ------------------- | -------- | -------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------- | --------------------------------------------------- |
| `ParagraphPlugin`   | 段落     | `paragraph`    |                                                                                                              | [Link](/zh-cn/plugins/paragraph) | `@syllepsis/plugin-basic`                           |
| `HeaderPlugin`      | 标题     | `header`       | `#` + `空格` <br> `##` + `空格` <br> `###` + `空格`                                                          |                                  | `@syllepsis/plugin-basic`                           |
| `ListItemPlugin`    | 列表元素 | `list-item`    |                                                                                                              | [Link](/zh-cn/plugins/list-item) | `@syllepsis/plugin-basic`                           |
| `BulletListPlugin`  | 无序列表 | `bullet_list`  | `-` + `空格` <br/> `*` + `空格`                                                                              |                                  | `@syllepsis/plugin-basic` (依赖于 `list_item` 插件) |
| `OrderedListPlugin` | 有序列表 | `ordered_list` | `number` + `.` + `空格`                                                                                      |                                  | `@syllepsis/plugin-basic`(依赖于 `list_item` 插件)  |
| `BlockQuotePlugin`  | 引用     | `block_quote`  | `>` + `空格` <br/> `》` + `空格`                                                                             |                                  | `@syllepsis/plugin-basic`                           |
| `CodeBlockPlugin`   | 代码块   | `code_block`   | ` ``` ` + `空格` <br/> ` ``` ` + `Enter` | [Link](zh-cn/plugins/code-block) | `@syllepsis/plugin-code-block` |

### 原子类型

| 插件名              | 描述     | 内置 icon 标识 | markdown                           | 参数                         | 引入                      |
| ------------------- | -------- | -------------- | ---------------------------------- | ---------------------------- | ------------------------- |
| `HrPlugin`          | 分割线   | `hr`           | `---` + `空格` <br> `***` + `空格` |                              | `@syllepsis/plugin-basic` |
| `ImagePlugin`       | 图片     | `image`        |                                    | [Link](/zh-cn/plugins/image) | `@syllepsis/access-*`     |
| `InlineImagePlugin` | 行内图片 | `image`        |                                    |                              | `@syllepsis/access-*`     |
| `LinkPlugin`        | 链接     | `link`         | `[title](link)` + `空格`           |                              | `@syllepsis/access-*`     |
| `AudioPlugin`       | 音频     | `audio`        |                                    | [Link](/zh-cn/plugins/audio) | `@syllepsis/plugin-basic` |
| `VideoPlugin`       | 视频     | `video`        |                                    | [Link](/zh-cn/plugins/video) | `@syllepsis/plugin-basic` |
| `TablePlugin`       | 表格     | `table`        |                                    | [Link](/zh-cn/plugins/table) | `@syllepsis/plugin-table` |

### 其他

| 插件名                | 描述     | 内置 icon 标识   | markdown | 参数                                 | 引入                      |
| --------------------- | -------- | ---------------- | -------- | ------------------------------------ | ------------------------- |
| `UndoPlugin`          | 撤销     | `undo`           |          |                                      | `@syllepsis/plugin-basic` |
| `RedoPlugin`          | 重做     | `redo`           |          |                                      | `@syllepsis/plugin-basic` |
| `EmojiPlugin`         | 表情     | `emoji`          |          |                                      | `@syllepsis/plugin-basic` |
| `FormatClearPlugin`   | 清除格式 | `format_clear`   |          |                                      | `@syllepsis/plugin-basic` |
| `FormatPainterPlugin` | 格式刷   | `format-painter` |          | [Link](zh-cn/plugins/format-painter) | `@syllepsis/plugin-basic` |
| `LineIndentPlugin`    | 首行缩进 | `line_ident`     |          |                                      | `@syllepsis/plugin-basic` |
| `SpaceBeforePlugin`   | 段前距   | `space_before`   |          | [Link](/zh-cn/plugins/space)         | `@syllepsis/plugin-basic` |
| `SpaceAfterPlugin`    | 段后距   | `space_after`    |          |                                      | `@syllepsis/plugin-basic` |
| `SpaceBothPlugin`     | 两端缩进 | `space_both`     |          |                                      | `@syllepsis/plugin-basic` |
| `LineHeightPlugin`    | 行高     | `line_height`    |          | [Link](/zh-cn/plugins/line-height)   | `@syllepsis/plugin-basic` |
| `AlignLeftPlugin`     | 文本对齐 | `align_left`     |          |                                      | `@syllepsis/plugin-basic` |
| `AlignCenterPlugin`   | 文本对齐 | `align_center`   |          |                                      | `@syllepsis/plugin-basic` |
| `AlignRightPlugin`    | 文本对齐 | `align_right`    |          |                                      | `@syllepsis/plugin-basic` |
| `AlignJustifyPlugin`  | 文本对齐 | `align_justify`  |          |                                      | `@syllepsis/plugin-basic` |
