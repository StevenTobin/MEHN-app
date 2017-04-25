var express  = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var db = mongoose.connection;

var Course = require('../models/course');

//get homepage
router.get('/', ensureAuthenticated,function (req, res) {
    var query = Course.find({published: true});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('index', {courses: docs});
    });

});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/users/login');
    }
}


module.exports = router;