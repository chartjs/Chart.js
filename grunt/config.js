module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        version: '<%= pkg.version %>',
        bower: 'bower_components',
        src: 'src',
        dist: 'dist',
        build: 'build',
        misc: 'misc',
        filename: '<%= pkg.name %>',   //
    });

    require('./tasks.js')(grunt);

    return grunt
};


