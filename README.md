## Usage / Example
#### CodeMirror 6

---
```javascript
import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"
import {contextMenuExtension} from "cm-context-menu"
import "cm-context-menu/style.css" // important!

new EditorView({
  doc: "console.log('Hello!')",
  extensions: [
    basicSetup,
    javascript(),
    contextMenuExtension()
  ],
  parent: document.querySelector("#editor")
})

```
---
