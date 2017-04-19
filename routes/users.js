var express  = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

//register
router.get('/register', function (req, res) {
    res.render('register');

});

//login
router.get('/login', function (req, res) {
    res.render('login');

});

//register user
router.post('/register', function (req, res) {
    var username    = req.body.username;
    var email       = req.body.email;
    var password    = req.body.password;
    var admin       = false;

    console.log(username);

    //form validation
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors:errors
        });
    } else {

        sub = "@wit.ie";
        if(email.indexOf(sub) !== -1) {
            admin = true;
        }

        var newUser = new User({
            username: username,
            email: email,
            password: password,
            admin: admin

        });

        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'Registered successfully');
        res.redirect('/users/login');
    }
});


passport.use(new LocalStrategy(
    function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
        if(err) throw err;
        if(!user){
            return done(null, false, {message: 'Unknown user'})
        }

        User.comparePassword(password, user.password, function(err, isMatch){

            if(err) throw err;

            if(isMatch){
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid password'});
            }
        })
    });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {successRedirect: '/', failureRedirect:'/users/login', failureFlash: true}),
    function(req, res) {
        res.redirect('/');
    });

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success_msg', 'Logged out successfully')
    res.redirect('/users/login');
});

module.exports= router;