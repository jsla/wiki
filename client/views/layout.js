const html = require('choo/html')

module.exports = function (inner, state, prev, send) {
  return html`
    <article class='w-100 pa3 ph5-ns mw7 center'>
      <nav class='dt w-100'>
        <div class='dtc v-mid tl w-50'>
          <a class='link dim dark-gray f4 dib b' href='#/' title='Home'>Wiki Home</a>
        </div>

        <div class='db dtc v-mid w-100 tr'>
          ${state._isEditing ? renderEditButtons() : renderDisplayButtons()}
        </div>
      </nav>

      <div class='w-100 f5 pv4-ns pv2 lh-copy'>
        ${inner}
      </div>
    </article>
  `

  function renderEditButtons () {
    return html`
      <div>
        <a class="f6 link dim br2 ph2 pv2 mb2 dib white bg-near-black"
          onclick=${e => send('save')}>Save</a>

        <a class="f6 link dim br2 ba ph2 pv2 mb2 dib near-black"
          onclick=${e => send('setEditing', false)}>Cancel</a>
      </div>
    `
  }

  function renderDisplayButtons () {
    return html`
      <div>
        <a class="f6 link dim br2 ba ph2 pv2 mb2 dib near-black"
          onclick=${e => send('setEditing', true)}>Edit</a>
      </div>
    `
  }
}
