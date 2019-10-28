const router = require('express').Router()
const User = require('../../db/User.js')

router.get('/me', (req, res, next) => {
  console.log('TCL: req.user', req.user.dataValues)
  res.json(req.user) // this should already be set from login/signup
})
router.put('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    })
    if (!user) res.status(401).send('User not found')
    else if (!user.correctPass(req.body.password))
      res.status(401).send('wrong password')
    else {
      req.login(user, err => {
        if (err) next(err)
        else res.json(user)
        //should this be redirected to GET /me instead of just returned?
        //this sets session on req.user?
      })
    }
  } catch (e) {
    next(e)
  }
})

router.post('/signup', (req, res, next) => {
  console.log('aaaaaaaaa', req.body)
  User.create(req.body)
    .then(user => {
      req.login(user, err => {
        if (err) next(err)
        res.redirect('/api/users/me') // doesn't work outside of then, or in another chained then, or maybe I was just chaining wrong
      })
    })
    .catch(next)
})

router.delete('/logout', (req, res, next) => {
  req.logout()
  req.session.destroy() //in case login put anything extra on this?
  res.sendStatus(204)
})

module.exports = router
