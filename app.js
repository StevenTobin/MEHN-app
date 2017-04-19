var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var fileupload = require('express-fileupload')
var fs = require('fs');
var mkdirp = require('mkdirp');

mongoose.connect('mongodb://localhost/entdev');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var courses = require('./routes/courses');

//Initialise app
var app = express();

//View engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({'defaultLayout':'layout'}));
app.set('view engine', 'handlebars');

//bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

//session
app.use(session({
    secret: 'secret',
    saveUninitilized: true,
    resave: true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());

//fileuploader
app.use(fileupload());

//express validator (code from express-validator github)
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg : msg,
            value: value
        };
        
    }
}));

//flash
app.use(flash());

//global
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error =req.flash('error');
    res.locals.user = req.user || null;
    next();
    
});

app.use('/', routes);
app.use('/users', users);
app.use('/courses', courses);

app.use(function(req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', {url: req.url});
        return;
    }

});


//port

app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function () {
    console.log('Server started on port' + app.get('port'));
    
});