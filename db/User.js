const db = require('.')
const Sequelize = require('sequelize')
const crypto = require('crypto')
const omit = require('lodash.omit')

const User = db.define('users', {
  email: Sequelize.STRING,
  password: {
    type: Sequelize.STRING,
    get() {
      return () => this.getDataValue('password') // so that it isn't returned in normal queries
    },
  },
  salt: {
    type: Sequelize.STRING,
    get() {
      return () => this.getDataValue('salt') // so that it isn't returned in normal queries
    },
  },
})

User.genSalt = function() {
  return crypto.randomBytes(16).toString('base64') // encyrpt salt
}
User.encryptPass = function(plainText, salt) {
  return crypto
    .createHash('RSA-SHA256')
    .update(plainText)
    .update(salt)
    .digest('hex') // use encrypted salt to encrypt password
}

function setSaltAndPassword(user) {
  if (user.changed('password')) user.salt = User.genSalt()
  user.password = User.encryptPass(user.password(), user.salt())
}

User.prototype.sanitize = function() {
  return omit(this.toJSON, ['password', 'salt'])
} // sanitze first and then check correct password

User.prototype.correctPass = function(pass) {
  return User.encryptPass(pass, this.salt()) === this.password()
} //use this function after retrieving the instance inside the route, to check if the password is correct

User.beforeCreate(setSaltAndPassword)
User.beforeUpdate(setSaltAndPassword)

module.exports = User
