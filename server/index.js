const express = require('express')
const app = express()
const morgan = require('morgan')
const path = require('path')
const db = require('../db')
const User = require('../db/User')
const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const dbStore = new SequelizeStore({ db: db }) //saves cookies in db, so that it's persistent
const passport = require('passport')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

dbStore.sync()
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'insecure',
    store: dbStore,
    resave: false,
    saveUninitialized: false,
  })
)
//passport must go after session middleware
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user, done) => {
  try {
    done(null, user.id)
  } catch (err) {
    done(err)
  }
})
passport.deserializeUser((id, done) => {
  console.log('bbbbbb', db.models)
  User.findByPk(id)
    .then(user => done(null, user))
    .catch(done)
})

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, '../public')))
app.use('/api', require('./apiRoutes'))

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../public'))
})

app.use(function(err, req, res, next) {
  console.error(err)
  console.error(err.stack)
  res.status(err.status || 500).send(err.message || 'Internal server error.')
})

const port = process.env.PORT || 3000 // this can be very useful if you deploy to Heroku!

db.sync({ force: true }).then(function() {
  app.listen(port, function() {
    console.log('Knock, knock')
    console.log("Who's there?")
    console.log(`Your server, listening on port ${port}`)
  })
})

module.exports = app
