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
    var query = Course.find({});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('registerCourse', {courses: docs});
    });
});

//register course
router.post('/register', function (req, res) {
    var name        = req.body.name;
    req.checkBody('name', 'Name is required').notEmpty();
    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors:errors
        });

        // If we don't want it to be a copy of another course
    } else if (req.body.courseSelect == "None") {

        var newCourse = new Course({
            _id: name,
            name: name,
            sections: [],
            published: false
        });
        Course.createCourse(newCourse, function (err, user) {
            if (err) throw err;
        });

        req.flash('success_msg', 'Registered successfully');
        res.redirect('/courses/register')

        // Else we do want it to be a copy of another course
    } else {
        console.log(req.body.courseSelect)
        Course.copyCourse(req.body.courseSelect, name);


        /*
        var newCourse = new Course({
             _id: name,
             name: name,
             sections: [],
             published: false

        });
        Course.createCourse(newCourse, function (err, user) {
            if (err) throw err;
        });

                THIS DOESN'T WORK
        var query = Section.find({course: req.body.courseSelect});
        query.exec(function (err, docs) {
            if (err) {
                throw Error;
            }
            docs.forEach(function(entry){
                Course.copySection(req.body.courseSelect, name, entry._id)
            });
        });
        */

        req.flash('success_msg', 'Registered successfully');
        res.redirect('/courses/register')
    }
});

// Course management page
router.get('/admin', ensureAuthenticated, function (req, res) {
    if(req.user.admin == true){
        res.render('courseManagement')
    }else {
        req.flash('error_msg', 'Must be admin to access')
        res.redirect('/')
    }

});

// Remove course page
router.get('/remove',ensureAuthenticated, function(req, res, next) {
    var query = Course.find({});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('removeCourse', {courses: docs});
    });
});

// Specific course we want to delete
router.get('/remove/:name', ensureAuthenticated, function(req, res) {
        Course.remove(req.params.name, function(err, docket){});
        Section.remove(req.params.name, function(err, docket){});
        res.redirect('/courses/admin');
 });

// Edit course content main page
router.get('/editContent', ensureAuthenticated, function(req, res, next) {
    var query = Course.find({});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('editCourseContent', {courses: docs});
    });
});

// Post route for course management
router.post('/upload/:name', ensureAuthenticated, function(req, res) {

    /*
      req.body.action will return the action of the button the
       user clicks so we can use that to find out what the user
       wants to do and then act on it
     */

    // the user wants to upload a file
    if(req.body.action == 'Upload') {
        let sampleFile = req.files.sampleFile;
        let fname = req.files.sampleFile.name;
        let fpath = '/home/steventobin/repos/MEHN-app/uploads/' + req.params.name;
        mkdirp(fpath, function (err) {
            sampleFile.mv(fpath + "/" + fname, function (err) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    Course.addSectionContent(req.params.name, req.body.sectionSelect,fpath + "/" + fname);
                    Section.addSectionContent(req.params.name, req.body.sectionSelect,fpath + "/" + fname);

                    req.flash("success_msg", "File uploaded");
                    res.redirect('/courses/editContent');
                }
            });
        });

        // the user wants to publish/unpublish a course
    } else if(req.body.action == 'Publish/unpublish') {
        let current = Course.findById({_id: req.params.name});
        Course.publish(req.params.name);
        req.flash("success_msg", "Course published");
        res.redirect('/courses/editContent');

        // the user wants to add a new section to the course
    } else if(req.body.action == 'NewSection'){
        Course.addSection(req.params.name, req.body.sectionHeading);
        req.flash("success_msg", "Section Created");
        res.redirect('/courses/editContent');

        // the user wants to arrange course content
    } else if(req.body.action == 'Arrange') {
        res.redirect('/courses/arrange/'+req.params.name)
    }

});

// Route for handling file download
router.get('/download/:course/:name', function(req, res){
    var file = '/home/steventobin/repos/MEHN-app/uploads/'+req.params.course+'/'+req.params.name;
    res.download(file); // Set disposition and send it.
});

// get the course the user wants to arrange
router.get('/arrange/:name', function(req, res) {
    var query = Course.find({_id: req.params.name});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('arrangeContent', {courses: docs});
    });
});

// This is the most general route so it needs to go last
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