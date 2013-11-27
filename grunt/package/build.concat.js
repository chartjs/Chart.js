module.exports = function(grunt) {

    var src = grunt.config('src');
    var srcFiles = [
        [src, "js", 'core.js'].join('/'),
        [src, "js", 'animation.js'].join('/')
    ];

    function getFilesFrom(basePath) {
        var files = [];

        grunt.file.recurse([grunt.config('src'), "js", basePath].join('/'), function callback(abspath, rootdir, subdir, filename) {

            // console.log(abspath, rootdir, subdir, filename);
            files.push(abspath);
        });

        return files;
    }

    srcFiles= srcFiles.concat(getFilesFrom('chartType'));

    grunt.config('concat.build', {
        options: {
            banner: 'window.Chart = function(context){\n',
            footer: '}'
        },
        src: srcFiles,
        dest: '<%= build %>/js/<%= pkg.name %>-<%= version %>.js'
    });

    grunt.registerTask('build.concat', ['concat:build']);

    return grunt;
};