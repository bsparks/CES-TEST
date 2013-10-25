module.exports = function(grunt) {

    var conf = require('./nconf');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cfg: require('./nconf'),
        clean: {
            game: ['<%= cfg.get("buildTarget") %>game/']
        },
        jshint: {
            files: ['src/components/**/*.js', 'src/systems/**/*.js']
        },
        browserify: {
            game: {
                files: {
                    '<%= cfg.get("buildTarget") %>game/js/game.js': ['src/web/js/app.js']
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            game: {
                files: {
                    '<%= cfg.get("buildTarget") %>game/js/game.min.js': ['<%= cfg.get("buildTarget") %>game/js/game.js']
                }
            }
        },
        copy: {
            options: {
                processContentExclude: ['**/*.{png,gif,jpg,ico,psd}']
            },
            game: {
                files: [{
                    src: 'lib/**/*',
                    dest: '<%= cfg.get("buildTarget") %>game/',
                    expand: true,
                    cwd: 'src/web'
                },
                {
                    src: 'media/**/*',
                    dest: '<%= cfg.get("buildTarget") %>game/',
                    expand: true,
                    cwd: 'src/web'
                }]
            }
        },
        replace: {
            game: {
                options: {
                    variables: {
                        root: '<%= cfg.get("game_root") %>',
                        host: '<%= cfg.get("game_host") %>',
                        port: '<%= cfg.get("server_port") %>',
                        appName: '<%= pkg.name %>',
                        appVersion: '<%= pkg.version %>',
                        gameVersion: 'v<%= pkg.version %>',
                        min: '' // prod version
                    }
                },
                files: [
                    {expand: true, flatten: true, src: ['src/web/index.html'], dest: '<%= cfg.get("buildTarget") %>game/'}
                ]
            }
        }
    });

    // load tasks
    //grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-replace');

    // Default task(s).


    // when ready do both
    grunt.registerTask('default', ['jshint', 'clean', 'browserify', 'uglify', 'copy', 'replace']);
};