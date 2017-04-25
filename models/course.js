var mongoose = require('mongoose');
var Section = require('../models/section');



var CourseSchema = mongoose.Schema({
    _id: {
        type: String,
        index: true,
        unique: true,
    },
    name:{
        type: String,
    },
    published:{
        type: Boolean
    },
    sections:
        [Section.schema]


});

var Course = module.exports = mongoose.model('Course', CourseSchema);

module.exports.createCourse = function (newCourse, callback) {
    newCourse.save(callback);
};

module.exports.getCourseByName = function(name, callback) {
    var query = {name: name};
    Course.findOne(query, callback);
};

module.exports.getCourseById = function(id, callback) {
    Course.findById(id, callback);
};

module.exports.remove = function (name,callback) {
    Course.find({name: name}).remove().exec();
};

// Not used anymore since I added sections..
module.exports.addContent = function (name, path, callback) {
    Course.findOneAndUpdate(
        {name: name},
        {$push: {content: path, filename: path.split('/').pop()}},
        {safe: true, upsert: true},
        function(err, model) {
            console.log(err);
        }
    );
};

// TODO
// !Course.published doesn't work when it's true...
module.exports.publish = function (name, callback) {
    Course.findOneAndUpdate(
        {_id: name},
        {published: !Course.published},
        function(err, model) {
            console.log(err)
        }
    )
};

module.exports.addSection = function (courseName, sectionName, callback) {
    console.log("ADD SECTION Cname: "+courseName+ " secName: "+sectionName)
    var newSection = new Section({
        _id: courseName+sectionName,
        name: sectionName,
        course: courseName,
        content: [],
    });

    Section.createSection(newSection);
    Course.findOne({_id: courseName}, function(err, courseresult) {
        Section.findOne({_id: courseName+sectionName}, function(err, sectionresult){
            courseresult.sections.push(sectionresult);
            courseresult.save(function(err, advresult) {})
        })
        }

    )
};

module.exports.addSectionContent = function(courseName, sectionName, path, callback) {
    console.log("ADD SEC CONTENT Cname: "+courseName+" secName: "+sectionName+ " path: "+path);
    Course.findOneAndUpdate(
        {_id: courseName, 'sections._id': courseName+sectionName},
        {$push: {'sections.$.content': path }},
        {upsert: true}, function(err,docs){
            console.log("SectionContent docs: "+docs);
        }
    )
};

module.exports.copySection = function (courseName, courseCopy, sectionName, callback) {
    Course.findOne({_id: courseCopy}, function(err, courseresult) {
            Section.findOne({_id: sectionName}, function(err, sectionresult){
                courseresult.sections.push(sectionresult);
                courseresult.save(function(err, advresult) {})
            })
        }
    )
};

module.exports.copyCourse = function (courseName, courseCopy, callback) {
    Course.findOne({_id: courseName}, function(err, courseresult) {
        let copy = new Course;
        copy._id        = courseCopy;
        copy.name       = courseCopy;
        copy.published  = false;

        copy.save(function (err) {
            if (err) {
                handleError(res, err);
            }
            else {
                courseresult.sections.forEach(function(entry){
                    entry.content.forEach((function(arrentry){
                        Course.addSection(courseCopy, entry.name);
                        Course.addSectionContent(courseCopy, entry.name, arrentry, callback)
                    }));
                });
            }
        });
    })
};

