var express  = require('express');
var router = express.Router();
var fs = require('fs');
var mkdirp = require('mkdirp');

var mongoose = require('mongoose');
var db = mongoose.connection;

var Course = require('../models/course');

//list
router.get('/', function(req, res) {
    var query = Course.find({});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('courseIndex', {courses: docs});
    });
});

//register
router.get('/register', function (req, res) {
    res.render('registerCourse');
});

//register course
router.post('/register', function (req, res) {
    var name        = req.body.name;

    console.log(name);

    //form validation
    req.checkBody('name', 'Name is required').notEmpty();


    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors:errors
        });
    } else {

        var newCourse = new Course({
            name: name,
            content: [],

        })

        Course.createCourse(newCourse, function(err, user){
            if(err) throw err;
            console.log(newCourse);
        });

        req.flash('success_msg', 'Registered successfully');
        res.redirect('/courses/')
    }
});

router.get('/admin', function (req, res) {
    if(req.user.admin == true){
        res.render('courseManagement')
    }else {
        req.flash('error_msg', 'Must be admin to access')
        res.redirect('/')
    }

});

router.get('/remove',function(req, res, next){
    var query = Course.find({});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('removeCourse', {courses: docs});
    });

router.get('/remove/:name', function(req, res) {
    console.log(req.params.name)
    Course.remove(req.params.name, function(err, docket){});
    res.redirect('/courses/admin');
    })
});

router.get('/editContent',function(req, res, next) {
    var query = Course.find({});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('editCourseContent', {courses: docs});
    });
});

router.post('/upload/:name', function(req, res) {
    console.log(req.files);
    console.log(req.params.name);
    let sampleFile = req.files.sampleFile;
    var fname = req.files.sampleFile.name;
    var fpath = '/home/steventobin/repos/MEHN-app/uploads/'+ req.params.name;
    mkdirp(fpath, function(err) {
        sampleFile.mv(fpath+"/"+fname, function(err) {
            if (err){
                return res.status(500).send(err);
            } else {
                req.flash("success_msg", "File uploaded")
                res.redirect('/courses/editContent')

            }
        });
    });
    var collection = db.collection('courses');
    var current = collection.find({name: req.params.name });
    console.log('found: '+current);
    Course.addContent(req.params.name,fpath+"/"+fname);
});

router.get('/:name', function(req, res) {
    var query = Course.find({name: req.params.name});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('displayCourse', {courses: docs});
    });
});


module.exports= router;