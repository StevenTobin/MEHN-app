var mongoose = require('mongoose');

var CourseSchema = mongoose.Schema({
    name:{
        type: String,
        index: true
    },
    content:{
        type: Array,
        'default': []
    }
});

var Course = module.exports = mongoose.model('Course', CourseSchema);

module.exports.createCourse = function (newCourse, callback) {
    newCourse.save(callback);
}

module.exports.getCourseByName = function(name, callback) {
    var query = {name: name};
    Course.findOne(query, callback);
}

module.exports.getCourseById = function(id, callback) {
    Course.findById(id, callback);
}

module.exports.remove = function (name,callback) {
    Course.find({name: name}).remove().exec();
}

module.exports.addContent = function (name, path, callback) {
    Course.findOneAndUpdate(
        {name: name},
        {$push: {content: path, filename: path.split('/').pop()}},
        {safe: true, upsert: true},
        function(err, model) {
            console.log(err);
        }
    );
}


