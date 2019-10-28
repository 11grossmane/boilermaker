const db = require('.')
const Sequelize = require('sequelize')

const Puppy = db.define('puppies', {
  name: Sequelize.STRING,
})

module.exports = Puppy
