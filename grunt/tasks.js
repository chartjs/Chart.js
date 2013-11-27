module.exports = function(grunt) {

    grunt.loadTasks('./grunt/server');
    grunt.loadTasks('./grunt/package');

    grunt.config('watch', {
        scripts: {
            files: ['<%= src %>/**/**.js'],
            tasks: ['build.concat']
        }
    });


    grunt.registerTask('default', ['server.normal']);
    // grunt.registerTask('default', ['server.node']);

    grunt.registerTask('package', [
        'build.concat',
        'build.uglify'
    ]);

    return grunt
};