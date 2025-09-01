import {EditorView} from "@codemirror/view"
import {selectAll} from "@codemirror/commands"

function getSelectedText(view) {
  const {from, to} = view.state.selection.main
  return view.state.doc.sliceString(from, to)
}

export function contextMenuExtension(options = {}) {
  const settings = {
    enableCopy: options.enableCopy ?? true,
    enableCut: options.enableCut ?? true,
    enablePaste: options.enablePaste ?? true,
    enableSelectAll: options.enableSelectAll ?? true,
    customItems: options.customItems ?? []   //This is for Custom Items that is added through the EXTENSIONS block in main javascript file 
  }

  return EditorView.domEventHandlers({
    contextmenu(event, view) {
      event.preventDefault()
      event.stopPropagation()

      document.querySelector(".cm-context-menu")?.remove()

      const menu = document.createElement("div")
      menu.className = "cm-context-menu"

      // --- Copy, Cut, Paste group ---
      const group = []

      if (settings.enableCopy) {
        group.push({
          label: "Copy",
          shortcut: "Ctrl+C",
          command: async (view) => {
            const text = getSelectedText(view)
            if (text) await navigator.clipboard.writeText(text)
          }
        })
      }

      if (settings.enableCut) {
        group.push({
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
        })
      }

      if (settings.enablePaste) {
        group.push({
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
        })
      }
      
      // Render copy/cut/paste if any are enabled 
      if (group.length > 0) {
        group.forEach(item => {
          const row = document.createElement("div")
          row.className = "cm-menu-item"
          row.innerHTML = `
            <span class="cm-label">${item.label}</span>
            <span class="cm-shortcut">${item.shortcut}</span>
          `
          row.addEventListener("click", () => {
            view.focus()       // restore focus to the editor
            item.command(view)
            menu.remove()
          })
          menu.appendChild(row)
        })
      }

      // Separator if both groups exist
      if (group.length > 0 && (settings.enableSelectAll || settings.customItems.length > 0)) {
        const separator = document.createElement("div")
        separator.className = "cm-separator"
        menu.appendChild(separator)
      }

      // --- Select All ---
      if (settings.enableSelectAll) {
        const selectAllItem = document.createElement("div")
        selectAllItem.className = "cm-menu-item"
        selectAllItem.innerHTML = `
          <span class="cm-label">Select All</span>
          <span class="cm-shortcut">Ctrl+A</span>
        `
        selectAllItem.addEventListener("click", () => {
          view.focus()   // restore focus to the editor
          selectAll(view)
          const range = document.createRange()
          range.selectNodeContents(view.contentDOM)
          const sel = window.getSelection()
          sel.removeAllRanges()
          sel.addRange(range)
          menu.remove()
        })
        menu.appendChild(selectAllItem)
      }

      // Separator before custom items
      if (settings.customItems.length > 0) {
        const separator = document.createElement("div")
        separator.className = "cm-separator"
        menu.appendChild(separator)
      }

      // --- Custom Items ---
      settings.customItems.forEach(item => {
        const row = document.createElement("div")
        row.className = "cm-menu-item"
        row.innerHTML = `
          <span class="cm-label">${item.label}</span>
          ${item.shortcut ? `<span class="cm-shortcut">${item.shortcut}</span>` : ""}
        `
        row.addEventListener("click", () => {
          view.focus()   // restore focus to the editor
          item.command(view)
          menu.remove()
        })
        menu.appendChild(row)
      })

      // Position menu
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
