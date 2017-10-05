module.exports = {
  update: (data, state) => ({ title: data }),
  receiveDoc: (data, state) => ({
    id: data.id,
    doc: data.body || defaultMarkdown(data.id),
    localDoc: data.body || defaultMarkdown(data.id)
  }),
  setLoading: (data, state) => ({ _isLoading: data }),
  setEditing: (data, state) => ({ _isEditing: data }),
  editDoc: (data, state) => ({ localDoc: data }),
  insertImage: (data, state) => {
    var imgmd = `![](/${data.url})`
    var cursorPosition = data.cursorPosition

    var local = state.localDoc
    if (!cursorPosition) return {localDoc: local + imgmd}

    var val = local.substring(0, cursorPosition)
    val += imgmd
    val += local.substring(cursorPosition, local.length)
    return {localDoc: val}
  }
}

function defaultMarkdown (id) {
  return `# ${id}

Nothing has been written on this page yet.

Edit this page to be the first!

Or return back to the [welcome page](#/welcome).`
}
