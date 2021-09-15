const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')
const { alreadyLoggedIn } = require('../middleware')



router.get('/signup', alreadyLoggedIn, (req, res) => {
    // const user = new User({ email: 'devesh@123', username: 'Devesh', phoneNo: 9411017490 })
    // const newUser = await User.register(user, '52451')
    // res.send(newUser);

    res.render('users/signup')
})

router.post('/signup', catchAsync(async (req, res, next) => {
    // console.log(req.body);
    const { email, password, phoneNo, username } = req.body;
    const newUser = new User({ email, phoneNo, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, err => {  //function from passport (login the newly registered user)
        if (err) return next(err);
        else {
            req.flash('success', 'Successfully signed up!')
            // console.log(registeredUser);
            res.redirect('/farms')
        }
    })
}));


router.get('/login', alreadyLoggedIn, (req, res, next) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/users/login' }), catchAsync(async (req, res, next) => {
    req.flash('success', 'Happy to see you again!')
    const nextStep = req.session.returnTo || '/farms';
    delete req.session.returnTo;
    res.redirect(nextStep)
}));

router.get('/logout', catchAsync(async (req, res) => {
    req.logout();
    req.flash('success', "You just Logged Out!")
    res.redirect('/farms');
}))

module.exports = router;