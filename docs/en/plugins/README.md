!> This Chapter is translated by machine. please feedback [Issue](https://github.com/bytedance/syllepsis/issues) if expression unclear.

# Plugin

Plug-ins are a major feature of `Syllepsis`. Like most plug-ins, Syllepsis's plug-ins refer to a **pluggable** capability.

Syllepsis has built a series of basic plug-ins, you can find suitable plug-ins below. (Forgot how to import? review [import plugin](/en/chapters/use-plugin)).

Even if you can't find a suitable plug-in, don't be discouraged. Syllepsis provides a set of ways to customize plug-ins easily. Please review:

- [Custom Plugin](/en/chapters/custom-plugin)
- [Custom Card Plugin](/en/chapters/card-plugin)

### Text style

| plugin              | description         | plugin         | markdown                                     | parameters                       | introduction              |
| ------------------- | ------------------- | -------------- | -------------------------------------------- | -------------------------------- | ------------------------- |
| `BoldPlugin`        | Bold                | `bold`         | `**Text**` + `space`                         |                                  | `@syllepsis/plugin-basic` |
| `ItalicPlugin`      | Italic              | `italic`       | `*Text*` + `space`                           |                                  | `@syllepsis/plugin-basic` |
| `UnderlinePlugin`   | Underline           | `underline`    | `~text~` + `space` <br/>`++text++` + `space` |                                  | `@syllepsis/plugin-basic` |
| `StrikePlugin`      | Strike through text | `strike`       | `~~Text~~` + `space`                         |                                  | `@syllepsis/plugin-basic` |
| `FontSizePlugin`    | Font size           | `font_size`    |                                              | [Link](/en/plugins/font-size)    | `@syllepsis/plugin-basic` |
| `LetterSpacePlugin` | Font spacing        | `letter_space` |                                              | [Link](/en/plugins/letter-space) | `@syllepsis/plugin-basic` |
| `SupPlugin`         | Superscript text    | `sup`          |                                              |                                  | `@syllepsis/plugin-basic` |
| `SubPlugin`         | Subscript text      | `sub`          |                                              |                                  | `@syllepsis/plugin-basic` |
| `BackgroundPlugin`  | Text background     | `background`   |                                              | [Link](/en/plugins/background)   | `@syllepsis/access-*`     |
| `ColorPlugin`       | Text color          | `color`        |                                              | [Link](/en/plugins/color)        | `@syllepsis/access-*`     |

### Text block type

| Plug-in name        | Description    | Icon           | markdown                                               | Parameters                       | Introduction                                                  |
| ------------------- | -------------- | -------------- | ------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------- |
| `ParagraphPlugin`   | Paragraph      | `paragraph`    |                                                        | [Link](/en/plugins/paragraph)    | `@syllepsis/plugin-basic`                                     |
| `HeaderPlugin`      | Header         | `header`       | `#` + `space` <br> `##` + `space` <br> `###` + `space` |                                  | `@syllepsis/plugin-basic`                                     |
| `ListItemPlugin`    | List element   | `list-item`    |                                                        | [Link](/en/plugins/list-item)    | `@syllepsis/plugin-basic`                                     |
| `BulletListPlugin`  | Unordered list | `bullet_list`  | `-` + `space` <br/> `*` + `space`                      |                                  | `@syllepsis/plugin-basic` (depends on the `list_item` plugin) |
| `OrderedListPlugin` | Ordered list   | `ordered_list` | `number` + `.` + `space`                               |                                  | `@syllepsis/plugin-basic` (depends on the `list_item` plugin) |
| `BlockQuotePlugin`  | Quotation      | `block_quote`  | `>` + `space` <br/> `》` + `space`                     |                                  | `@syllepsis/plugin-basic`                                     |
| `CodeBlockPlugin`   | Code block     | `code_block`   | `` + `space` <br/> `` + `Enter`                        | [Link](zh-cn/plugins/code-block) | `@syllepsis/plugin-code-block`                                |

### Atomic Type

| Plug-in name        | Description   | Icon    | markdown                             | Parameters                | Introduction              |
| ------------------- | ------------- | ------- | ------------------------------------ | ------------------------- | ------------------------- |
| `HrPlugin`          | Dividing line | `hr`    | `---` + `space` <br> `***` + `space` |                           | `@syllepsis/plugin-basic` |
| `ImagePlugin`       | Picture       | `image` |                                      | [Link](/en/plugins/image) | `@syllepsis/access-*`     |
| `InlineImagePlugin` | Inline Image  | `image` |                                      |                           | `@syllepsis/access-*`     |
| `LinkPlugin`        | Link          | `link`  | `[title](link)` + `space`            |                           | `@syllepsis/access-*`     |
| `AudioPlugin`       | Audio         | `audio` |                                      | [Link](/en/plugins/audio) | `@syllepsis/plugin-basic` |
| `VideoPlugin`       | Video         | `video` |                                      | [Link](/en/plugins/video) | `@syllepsis/plugin-basic` |
| `TablePlugin`       | Table         | `table` |                                      | [Link](/en/plugins/table) | `@syllepsis/plugin-table` |

### Other

| Plug-in name          | Description              | Icon             | markdown | Parameters                           | Introduction              |
| --------------------- | ------------------------ | ---------------- | -------- | ------------------------------------ | ------------------------- |
| `UndoPlugin`          | Undo                     | `undo`           |          |                                      | `@syllepsis/plugin-basic` |
| `RedoPlugin`          | Redo                     | `redo`           |          |                                      | `@syllepsis/plugin-basic` |
| `EmojiPlugin`         | Emoticons                | `emoji`          |          |                                      | `@syllepsis/plugin-basic` |
| `FormatClearPlugin`   | Clear format             | `format_clear`   |          |                                      | `@syllepsis/plugin-basic` |
| `FormatPainterPlugin` | Format Painter           | `format-painter` |          | [Link](zh-cn/plugins/format-painter) | `@syllepsis/plugin-basic` |
| `LineIndentPlugin`    | First line indentation   | `line_ident`     |          |                                      | `@syllepsis/plugin-basic` |
| `SpaceBeforePlugin`   | Paragraph front distance | `space_before`   |          | [Link](/en/plugins/space)            | `@syllepsis/plugin-basic` |
| `SpaceAfterPlugin`    | Paragraph after distance | `space_after`    |          |                                      | `@syllepsis/plugin-basic` |
| `SpaceBothPlugin`     | Indent at both ends      | `space_both`     |          |                                      | `@syllepsis/plugin-basic` |
| `LineHeightPlugin`    | Line height              | `line_height`    |          | [Link](/en/plugins/line-height)      | `@syllepsis/plugin-basic` |
| `AlignLeftPlugin`     | Text alignment           | `align_left`     |          |                                      | `@syllepsis/plugin-basic` |
| `AlignCenterPlugin`   | Text alignment           | `align_center`   |          |                                      | `@syllepsis/plugin-basic` |
| `AlignRightPlugin`    | Text alignment           | `align_right`    |          |                                      | `@syllepsis/plugin-basic` |
| `AlignJustifyPlugin`  | Text alignment           | `align_justify`  |          |                                      | `@syllepsis/plugin-basic` |
