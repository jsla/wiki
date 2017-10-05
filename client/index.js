const css = require('sheetify')
const choo = require('choo')
const auth = require('./authentic')

css('tachyons')
css('./style.css', { global: true })

document.body.setAttribute('class', 'bg-near-white near-black')

const app = choo()
const docView = require('./views/doc')

app.model(require('./model'))

app.router((route) => [
  route('/', docView),
  route('/:doc', docView),
  route('/login', auth.login),
  route('/logout', auth.logout),
  route('/signup', auth.signup),
  route('/confirm/:email/:token', auth.confirm),
  route('/change-password/:email/:token', auth.changePassword),
  route('/change-password-request', auth.changePasswordRequest)
])

const tree = app.start({ hash: true })
document.body.appendChild(tree)
