# ParagraphPlugin

> [类型](/zh-cn/plugins/types)

```typescript
import { ParagraphPlugin } from '@syllepsis/plugin-basic';

plugins: [
  //....
  new ParagraphPlugin({
    defaultFontSize: number // 默认字体大小
    addMatchTags: boolean | string[], // 增加匹配的tagName, 如['section']
    allowedAligns: boolean | string[], // 允许的对齐方式, false为不解析对齐
    canMatch?: (dom: HTMLElement) => boolean; // 判断是否能匹配对应的dom
    allowedClass: string[] , // 允许的类名，false为不解析class
    allowedLineHeights: TAllowedValuesConfig, // 允许的行高，false为不解析line-height，[]为允许所有
    allowedLineIndents: TAllowedValuesConfig, // 允许的首行缩进值，false为不解析text-indent，[]为允许所有
    allowedSpaceBefores: TAllowedValuesConfig, // 允许的段前距值，false为不解析margin-top，[]为允许所有
    allowedSpaceAfters: TAllowedValuesConfig, // 允许的段后距值，false为不解析margin-bottom，[]为允许所有
    allowedSpaceBoths: TAllowedValuesConfig, // 允许的两端缩进值，false为不解析margin-left，margin-right，[]为允许所有
    addAttributes: IUserAttrsConfig; // 扩展默认attrs
  })
]
```
