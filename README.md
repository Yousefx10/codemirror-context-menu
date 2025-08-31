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
    contextMenuExtension({
      enableCopy: true,
      enableCut: false,
      enablePaste: true,
      enableSelectAll: false
    })
  ],
  parent: document.querySelector("#editor")
})

```
---
#### Example for custom menu item
```javascript
{
  label: "Format Code",
  shortcut: "Ctrl+Shift+F",
  command: (view) => {
    // user-defined function
    myFormatter(view.state.doc.toString())
  }
}
```
---
#### Usage for custom menu item with selected content
```javascript
import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"
import {contextMenuExtension} from "cm-context-menu"
import "cm-context-menu/style.css" // important!


function myCustomAction(text) {
  alert("You selected:\n\n" + text)
}

const editor = new EditorView({
  doc: "console.log('Hello!')",
  extensions: [
    javascript(),

    contextMenuExtension({
      enableCopy: true,
      enableCut: false,
      enablePaste: true,

      customItems: [

        {
          label: "Alert Selection",
          shortcut: "Alt+A",
          command: (view) => {
            const selected = view.state.sliceDoc(
              view.state.selection.main.from,
              view.state.selection.main.to
            )
            myCustomAction(selected)
          }
        },

        {
          label: "Log Editor Content",
          command: (view) => {
            console.log(view.state.doc.toString())
          }
        }

      ]


    })
  ],
  parent: document.querySelector("#editor")
})

```
