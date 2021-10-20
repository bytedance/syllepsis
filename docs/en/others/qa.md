## Q：Can the `Controller` be loaded asynchronously?

**A：** You can load `Controller` through `asyncController`，see [example](/en/chapters/syl-plugin?id=basic-structure)

## Q: Is the first character in Chinese input at the beginning of the line in Chrome89+?

**A:** Upgrade the version of `prosemirror-view` to `^1.17.4`, and be careful not to introduce multiple `prosemirror-view`.

## Q: Clicking to set the list style has no effect?

**A:** See if the `reset.css` or `nomrlize.css` has been introduced in the project to reset the styles of `ol` and `ul`, or consider introducing the `css` file provided by this document.

## Q: Why can't my card be rendered?

**A:** You can check whether the `SylPlugin` of the card has the `name` attribute.

## Q: What configuration items does the plug-in have, such as pictures, videos, audio uploads, etc.?

**A:** The configuration supported by the currently provided components can be found in the [plugins](/en/plugins/README) chapter, such as [picture](/en/plugins/image), [video](/en/plugins/video).

## Q: How to get the data of existing nodes?

**A:** Block-level elements can use [`getExistNodes`](/en/api?id=getexistnodes), and inline elements (text styles, etc.) can use [`getExistMarks`](/en/api? id=getexistmarks).

## Q: Why doesn't setHTML trigger'text-change'?

A: The `silent` parameter of [setHTML](/en/api?id=sethtml) controls whether the event is triggered. When `silent` is `true`, it will not be triggered (default value). If you need to trigger, please change it to `false`.

## Q: How to set the style of the selected card?

**A:** Add the class name to the outermost layer, and control the selection effect through the style.

## Q: Do you support SSR rendering?

**A:** The editor is a component that relies heavily on the browser, and the benefits of loading this component in a non-browser environment are minimal. You can consider introducing it through lazy loading.

## Q: How to configure pictures to support paste, drag and drop upload?

**A:** Refer to [imagePlugins](/en/plugins/image). If the pasted picture does not trigger upload, confirm whether `allowDomains` is configured, if not configured, any domain name is allowed and upload will not be triggered.

## Q: How to set to read-only mode?

**A:** After getting the editor instance, call the `disable` method to enter the read-only mode, and call `enable` to restore the editing mode. Or pass in `disable={true}` in the access layer
