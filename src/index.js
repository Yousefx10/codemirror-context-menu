import {EditorView} from "@codemirror/view"
import {selectAll, undo, redo} from "@codemirror/commands"


// This function is responsible to add a separator, with a checker to make sure there's an item below the separator, all logic conditions is made through the WillHaveMore when function called.
function appendSeparator(menu, willHaveMore) {
  if (!willHaveMore) return
  if (menu.lastChild && menu.lastChild.classList.contains("cm-separator")) return
  const sep = document.createElement("div")
  sep.className = "cm-separator"
  menu.appendChild(sep)
}



function getSelectedText(view) {
  const {from, to} = view.state.selection.main
  return view.state.doc.sliceString(from, to)
}

//getting rid of style.css, and now it will be managed through the js 
function injectMenuStyles(theme) {
  // Remove old styles if any 
  document.getElementById("cm-context-styles")?.remove()
  
  const style = document.createElement("style")
  style.id = "cm-context-styles"

  style.textContent = `
    .cm-context-menu {
      position: absolute;
      z-index: 9999;
      padding: 4px 0;
      border-radius: 6px;
      font-family: sans-serif;
      font-size: 13px;
      min-width: 190px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      user-select: none;
    }
    .cm-menu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 12px;
      cursor: pointer;
    }
    .cm-menu-item:hover {
      background: ${theme === "dark" ? "#3a3d41" : "#e5e5e5"};
    }
    .cm-label {}
    .cm-shortcut {
      opacity: 0.6;
      font-size: 12px;
    }
    .cm-separator {
      height: 1px;
      margin: 4px 0;
      background: ${theme === "dark" ? "#555" : "#ccc"};
    }
    /* Theme backgrounds & colors */
    
    /* Special row for Undo/Redo */
    .cm-undo-redo {
      display: flex;
      gap: 8px;
    }
    .cm-btn {
      padding: 2px 6px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      border: 1px solid ${theme === "dark" ? "#444" : "#bbb"};
      background: ${theme === "dark" ? "#2f2f2f" : "#f5f5f5"};
      color: ${theme === "dark" ? "white" : "black"}; /*good visibility*/
    }

/* Compact undo/redo row (enableUndoRedo === false) */
.cm-undo-redo-row {
  display: flex;
  justify-content: space-around;
  gap: 8px;
  padding: 4px;
}

/* Buttons inside compact row */
.cm-undo-redo-row button {
  flex: 1;
  padding: 7px 6px;
  border: none; /* pill-like, no border */
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  background: ${theme === "dark" ? "#444" : "#eee"};
  color: ${theme === "dark" ? "#fff" : "#000"};
}

.cm-undo-redo-row button:hover {
  background: ${theme === "dark" ? "#666" : "#ddd"};
}

    .cm-btn:hover {
      background: ${theme === "dark" ? "#454545" : "#e0e0e0"};
    }
    .cm-context-menu {
      background: ${theme === "dark" ? "#252526" : "#fff"};
      color: ${theme === "dark" ? "#f3f3f3" : "#222"};
      border: 1px solid ${theme === "dark" ? "#333" : "#ccc"};
    }
  `
  document.head.appendChild(style)
}

export function contextMenuExtension(options = {}) {
  const settings = {
    enableCopy: options.enableCopy ?? true,
    enableCut: options.enableCut ?? true,
    enablePaste: options.enablePaste ?? true,
    enableSelectAll: options.enableSelectAll ?? true,

    enableUndoRedo: Object.prototype.hasOwnProperty.call(options, "enableUndoRedo")
      ? options.enableUndoRedo  // true | false | null
      : true, // option to enable or disable the UNDO + REDO, it's enabled by default.

    customItems: options.customItems ?? [],
    theme: options.theme ?? "dark"   // default = dark
  }
  // Inject styles based on theme 
  injectMenuStyles(settings.theme)

  return EditorView.domEventHandlers({
    contextmenu(event, view) {
      event.preventDefault()
      event.stopPropagation()

      document.querySelector(".cm-context-menu")?.remove()
      const menu = document.createElement("div")
      menu.className = "cm-context-menu"

// --- Undo/Redo row (tri-state: true = history; false = compact; null = hidden) ---
if (settings.enableUndoRedo !== null) {
  if (settings.enableUndoRedo === true) {
    // ----- ORIGINAL "History" style (with label) -----
    const undoRedoRow = document.createElement("div")
    undoRedoRow.className = "cm-menu-item"
    undoRedoRow.innerHTML = `
      <span class="cm-label">History</span>
      <div class="cm-undo-redo">
        <button class="cm-btn">Undo</button>
        <button class="cm-btn">Redo</button>
      </div>
    `
    const [undoBtn, redoBtn] = undoRedoRow.querySelectorAll(".cm-btn")
    undoBtn.addEventListener("click", () => {
      view.focus()
      undo(view)
      menu.remove()
    })
    redoBtn.addEventListener("click", () => {
      view.focus()
      redo(view)
      menu.remove()
    })
    menu.appendChild(undoRedoRow)

  } else {
    // ----- NEW "compact row" style (no label, full width buttons) -----
    const compactRow = document.createElement("div");
    compactRow.className = "cm-undo-redo-row";

    const undoBtn = document.createElement("button");
    undoBtn.textContent = "Undo";
    undoBtn.addEventListener("click", () => {
      view.focus();
      undo(view);
      menu.remove();
    });

    const redoBtn = document.createElement("button");
    redoBtn.textContent = "Redo";
    redoBtn.addEventListener("click", () => {
      view.focus();
      redo(view);
      menu.remove();
    });

    compactRow.appendChild(undoBtn);
    compactRow.appendChild(redoBtn);
    menu.appendChild(compactRow);
  }


  // keep separator logic the same
  if (
    settings.enableCopy ||
    settings.enableCut ||
    settings.enablePaste ||
    settings.enableSelectAll ||
    settings.customItems.length > 0
  ) {
    const sep = document.createElement("div")
    sep.className = "cm-separator"
    menu.appendChild(sep)
  }
}

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
                changes: { from: view.state.selection.main.from, to: view.state.selection.main.to, insert: "" }
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
                changes: { from: view.state.selection.main.from, to: view.state.selection.main.to, insert: text }
              })
            }
          }
        })
      }

      if (group.length > 0) {
        group.forEach(item => {
          const row = document.createElement("div")
          row.className = "cm-menu-item"
          row.innerHTML = `
            <span class="cm-label">${item.label}</span>
            <span class="cm-shortcut">${item.shortcut}</span>
          `
          row.addEventListener("click", () => {
            view.focus()
            item.command(view)
            menu.remove()
          })
          menu.appendChild(row)
        })
      }

      appendSeparator(menu, group.length > 0 && (settings.enableSelectAll || settings.customItems.length > 0))


      // --- Select All ---
      if (settings.enableSelectAll) {
        const selectAllItem = document.createElement("div")
        selectAllItem.className = "cm-menu-item"
        selectAllItem.innerHTML = `
          <span class="cm-label">Select All</span>
          <span class="cm-shortcut">Ctrl+A</span>
        `
        selectAllItem.addEventListener("click", () => {
          view.focus()
          selectAll(view)
          const range = document.createRange()
          range.selectNodeContents(view.contentDOM)
          const sel = window.getSelection()
          sel.removeAllRanges()
          sel.addRange(range)
          menu.remove()
        })
        menu.appendChild(selectAllItem)

        appendSeparator(menu, settings.customItems.length > 0)

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
          view.focus()
          item.command(view)
          menu.remove()
        })
        menu.appendChild(row)
      })

      menu.style.top = event.clientY + "px"
      menu.style.left = event.clientX + "px"
      document.body.appendChild(menu)

      const remove = () => menu.remove()
      setTimeout(() => {
        document.addEventListener("click", remove, { once: true })
      }, 0)
    }
  })
}
