var express  = require('express');
var router = express.Router();
var fs = require('fs');
var mkdirp = require('mkdirp');

var mongoose = require('mongoose');
var db = mongoose.connection;

var Course = require('../models/course');
var Section = require('../models/section');

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
router.get('/register', ensureAuthenticated, function (req, res) {
    res.render('registerCourse');
});

//register course
router.post('/register', function (req, res) {
    var name        = req.body.name;
    //form validation
    req.checkBody('name', 'Name is required').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        res.render('register',{
            errors:errors
        });
    } else {
        var newCourse = new Course({
            _id: name,
            name: name,
            content: [],
            published: false
        });
        Course.createCourse(newCourse, function(err, user){
            if(err) throw err;
        });
        req.flash('success_msg', 'Registered successfully');
        res.redirect('/courses/')
    }
});

router.get('/admin', ensureAuthenticated, function (req, res) {
    if(req.user.admin == true){
        res.render('courseManagement')
    }else {
        req.flash('error_msg', 'Must be admin to access')
        res.redirect('/')
    }

});

router.get('/remove',ensureAuthenticated, function(req, res, next) {
    var query = Course.find({});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('removeCourse', {courses: docs});
    });
});


router.get('/remove/:name', ensureAuthenticated, function(req, res) {
        Course.remove(req.params.name, function(err, docket){});
        res.redirect('/courses/admin');
 });

router.get('/editContent', ensureAuthenticated, function(req, res, next) {
    var query = Course.find({});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('editCourseContent', {courses: docs});
    });
});

router.post('/upload/:name', ensureAuthenticated, function(req, res) {
    if(req.body.action == 'Upload') {
        let sampleFile = req.files.sampleFile;
        let fname = req.files.sampleFile.name;
        let fpath = '/home/ubuntu/MEHN-app/uploads/' + req.params.name;
        mkdirp(fpath, function (err) {
            sampleFile.mv(fpath + "/" + fname, function (err) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    //Course.addContent(req.params.name, fpath + "/" + fname);
                    Course.addSectionContent(req.params.name, req.body.sectionSelect,fpath + "/" + fname);
                    //Course.addSectionContent(req.params.name, )

                    req.flash("success_msg", "File uploaded");
                    res.redirect('/courses/editContent');
                }
            });
        });

    } else if(req.body.action == 'Publish/unpublish') {
        let current = Course.findById({_id: req.params.name});
        Course.publish(req.params.name);
        req.flash("success_msg", "Course published");
        res.redirect('/courses/editContent');

    } else if(req.body.action == 'NewSection'){
        Course.addSection(req.params.name, req.body.sectionHeading);
        req.flash("success_msg", "Section Created");
        res.redirect('/courses/editContent');

    } else if(req.body.action == 'Arrange') {
        res.redirect('/courses/arrange/'+req.params.name)
    }

});


router.get('/download/:course/:name', function(req, res){
    var file = '/home/ubuntu/MEHN-app/uploads/'+req.params.course+'/'+req.params.name;
    res.download(file); // Set disposition and send it.
});

router.get('/arrange/:name', function(req, res) {
    console.log(req.params.name);
    var query = Course.find({_id: req.params.name});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('arrangeContent', {courses: docs});
    });
});

router.get('/:name', function(req, res) {
    var query = Course.find({name: req.params.name});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        if (docs.length == 0) {
            req.flash("error_msg", "Requested course not found");
            res.redirect('/courses');
        } else {
            res.render('displayCourse', {courses: docs});
        }
    });
});


function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/');
    }
};

module.exports= router;
