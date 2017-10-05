var NAME = require('./package.json').name
var PORT = process.env.PORT || 3000

require('dotenv').config()
require('productionize')(NAME)
require('./server')().listen(PORT)
console.log('%s listening on port %d', NAME, PORT)
