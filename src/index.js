// Imports CodeMirror 6 components
import {EditorView} from "@codemirror/view"
import {selectAll} from "@codemirror/commands"


//function to get currently selected text inside CodeMirror
function getSelectedText(view) {
  const {from, to} = view.state.selection.main
  return view.state.doc.sliceString(from, to)
}
