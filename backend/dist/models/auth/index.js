const Auth = {}

Auth.link = require('./authLink')
Auth.unLink = require('./authUnLink')
Auth.login = require('./authLogin')
Auth.register = require('./authRegister')

module.exports = Auth