var mongoose = require('mongoose');

var SectionSchema = mongoose.Schema({
    _id: {
        type: String,
        index: true,
        unique: true,
    },
    name:{
        type: String,
    },
    course:{
        type: String,
    },
    content:{
        type: Array,
        'default': []
    }
});

var Section = module.exports = mongoose.model('Section', SectionSchema);

module.exports.createSection = function (newSection, callback) {
    newSection.save(callback);
};

module.exports.getSectionByName = function(name, callback) {
    var query = {name: name};
    Section.findOne(query, callback);
};

module.exports.remove = function (name,callback) {
    Section.find({course: name}).remove().exec();
};

module.exports.getSectionById = function(id, callback) {
    Section.findById(id, callback);
};

module.exports.addSectionContent = function(courseName, sectionName, path, callback) {
    Section.findOneAndUpdate(
        {_id: courseName+sectionName, course: courseName},
        {$push: {content: path }},
        {upsert: true}, function(err,docs){
            console.log(docs);
        }
    )
};

