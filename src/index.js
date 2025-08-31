// Imports CodeMirror 6 components
import {EditorView} from "@codemirror/view"
import {selectAll} from "@codemirror/commands"


//function to get currently selected text inside CodeMirror
function getSelectedText(view) {
  const {from, to} = view.state.selection.main
  return view.state.doc.sliceString(from, to)
}






//EXPORT FUNCTION
export function customContextMenu() {
  return EditorView.domEventHandlers({
    contextmenu(event, view) {
      event.preventDefault()
      event.stopPropagation() //to prevent cursor reset

      // Remove old menu if exists
      document.querySelector(".cm-context-menu")?.remove()

      // Build menu
      const menu = document.createElement("div")
      menu.className = "cm-context-menu"

      // THE First group: Copy / Cut / Paste
      ;[
        {
          label: "Copy",
          shortcut: "Ctrl+C",
          command: async (view) => {
            const text = getSelectedText(view)
            if (text) await navigator.clipboard.writeText(text)
          }
        },
        {
          label: "Cut",
          shortcut: "Ctrl+X",
          command: async (view) => {
            const text = getSelectedText(view)
            if (text) {
              await navigator.clipboard.writeText(text)
              view.dispatch({
                changes: {
                  from: view.state.selection.main.from,
                  to: view.state.selection.main.to,
                  insert: ""
                }
              })
            }
          }
        },
        {
          label: "Paste",
          shortcut: "Ctrl+V",
          command: async (view) => {
            const text = await navigator.clipboard.readText()
            if (text) {
              view.dispatch({
                changes: {
                  from: view.state.selection.main.from,
                  to: view.state.selection.main.to,
                  insert: text
                }
              })
            }
          }
        }
      ].forEach(item => {
        const row = document.createElement("div")
        row.className = "cm-menu-item"
        row.innerHTML = `
          <span class="cm-label">${item.label}</span>
          <span class="cm-shortcut">${item.shortcut}</span>
        `
        row.addEventListener("click", () => {
          item.command(view)
          menu.remove()
        })
        menu.appendChild(row)
      })

      // Separator
      const separator = document.createElement("div")
      separator.className = "cm-separator"
      menu.appendChild(separator)

      //THE Second group: Select All
      const selectAllItem = document.createElement("div")
      selectAllItem.className = "cm-menu-item"
      selectAllItem.innerHTML = `
        <span class="cm-label">Select All</span>
        <span class="cm-shortcut">Ctrl+A</span>
      `
      selectAllItem.addEventListener("click", () => {
        // Update CodeMirror selection
        selectAll(view)

        // Also sync with DOM selection for "native" highlight
        const range = document.createRange()
        range.selectNodeContents(view.contentDOM)   //only the code area
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)

        menu.remove()
      })
      menu.appendChild(selectAllItem)

      // Position menu near cursor
      menu.style.top = event.clientY + "px"
      menu.style.left = event.clientX + "px"
      document.body.appendChild(menu)

      // Close menu on outside click
      const remove = () => menu.remove()
      setTimeout(() => {
        document.addEventListener("click", remove, {once: true})
      }, 0)
    }
  })
}
