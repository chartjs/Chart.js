// Gruntfile.js
// define grunt setting
module.exports = function (grunt) {

    // base the file package.json,to get NpmTasks and loadNpmTasks
    var npmTaskNames = JSON.stringify(grunt.file.readJSON('package.json').devDependencies).match(/grunt\-[^"^']+/g)
        , i = npmTaskNames.length;

    while (i--) {
        grunt.loadNpmTasks(npmTaskNames[i]);
    }

    // get global config
    require('./grunt/config.js')(grunt);

    return grunt;
};