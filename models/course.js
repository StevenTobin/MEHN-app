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
    var newSection = new Section({
        _id: sectionName,
        name: sectionName,
        course: courseName,
        content: [],
    });

    Section.createSection(newSection);
    Course.findOne({_id: courseName}, function(err, courseresult) {
        Section.findOne({_id: sectionName}, function(err, sectionresult){
            courseresult.sections.push(sectionresult);
            courseresult.save(function(err, advresult) {
                console.log('push worked')
            })
        })
        }

    )
};

module.exports.addSectionContent = function(courseName, sectionName, path, callback) {
    Course.findOneAndUpdate(
        {_id: courseName, 'sections._id': sectionName},
        {$push: {'sections.$.content': path }},
        {upsert: true}, function(err,docs){
            console.log(docs);
        }
    )
};


