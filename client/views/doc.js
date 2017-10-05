const html = require('choo/html')
const marked = require('marked/lib/marked')
const dragDrop = require('drag-drop/buffer')

const auth = require('../authentic')
const layout = require('./layout')

module.exports = function (state, prev, send) {
  var token = auth.getAuthToken()
  if (!token) return redirect('/login')

  var idCur = state.params.doc
  var idPrev = prev.params.doc
  if (!idCur) return redirect('/welcome')
  if (idCur !== idPrev) send('fetch', idCur)

  return render()

  function render () {
    var content = state._isLoading
      ? renderLoading()
      : state._isEditing
        ? renderEditor()
        : renderDisplay()

    return layout(content, state, prev, send)
  }

  function renderLoading () {
    return html`
      <article class="dt w-100" style='height: 60%'>
        <div class="dtc v-mid tc white ph3 ph4-l">
          <div class="sk-folding-cube">
            <div class="sk-cube1 sk-cube"></div>
            <div class="sk-cube2 sk-cube"></div>
            <div class="sk-cube4 sk-cube"></div>
            <div class="sk-cube3 sk-cube"></div>
          </div>
        </div>
      </article>
    `
  }

  function renderEditor () {
    var textarea = html`
      <textarea
        class='w-100'
        style='height: 80%; font-family: monospace'
        onchange=${onDocChange}
        onkeydown=${onDocKeyDown}
        >${state.localDoc}</textarea>
    `

    dragDrop(textarea, (files) => {
      send('uploadImage', {
        file: files[0],
        cursorPosition: textarea.selectionStart
      })
    })

    return html`
      <div>
        ${textarea}
      </div>
    `
  }

  function renderDisplay () {
    var display = html`<div></div>`
    display.innerHTML = marked(state.doc || '')

    return html`
      <div>
        ${display}
      </div>
    `
  }

  function onDocChange (evt) { send('editDoc', evt.target.value) }

  function onDocKeyDown (evt) {
    if (evt.keyCode !== 9) return // ignore non-tab

    var el = evt.target
    var prevVal = el.value

    var start = el.selectionStart
    var end = el.selectionEnd

    var firstHalf = prevVal.substring(0, start)
    var secondHalf = prevVal.substring(start)

    el.value = [firstHalf, secondHalf].join('  ')
    el.selectionStart = start + 2
    el.selectionEnd = end + 2

    evt.preventDefault()
  }
}

function redirect (loc) {
  setTimeout(function () { window.location.hash = loc })
  return html`<div></div>`
}
