// connect
// doc https://github.com/gruntjs/grunt-contrib-connect
module.exports = function (grunt) {
    grunt.config('connect', {
        devServer: {
            options: {
                port: 80,
                hostname: '0.0.0.0',
                base: '<%= build %>',
                keepalive: true,
                middleware: function (connect, options) {
                    return [
                        // Serve static files.
                        connect.static(options.base),
                        // Make empty directories browsable.
                        connect.directory(options.base)
                    ];
                }
            }
        }
    });
    grunt.registerTask('server.normal', ['connect:devServer']);
    return grunt;
};