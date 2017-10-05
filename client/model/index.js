const effects = require('./effects')
const reducers = require('./reducers')

const state = { _isLoading: true }

module.exports = {
  state: state,
  reducers: reducers,
  effects: effects
}
