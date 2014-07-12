/* global module:false */
module.exports = function(grunt) {
    var port = grunt.option('port') || 8000;
    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner:
                '/*!\n' +
                ' * reveal.js <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd, HH:MM") %>)\n' +
                ' * http://lab.hakim.se/reveal-js\n' +
                ' * MIT licensed\n' +
                ' *\n' +
                ' * Copyright (C) 2014 Hakim El Hattab, http://hakim.se\n' +
                ' */'
        },

        copy: {
            // copy the stuff that comes with the highlight plugin from the submodule
            highlight: {
                files: [
                    {
                        expand: true, 
                        cwd: 'lib/plugins/highlight/src/', 
                        src: ['styles/**'], 
                        dest: 'lib/css/highlight/'
                    },
                    {
                        expand: true, 
                        cwd: 'lib/plugins/highlight/src/', 
                        src: ['languages/**'], 
                        dest: 'lib/css/highlight/'
                    }
                ]
            }
        },

        qunit: {
            files: [ 'test/*.html' ]
        },

        uglify: {
            options: {
                banner: '<%= meta.banner %>\n'
            },
            build: {
                src: 'js/reveal.js',
                dest: 'js/reveal.min.js'
            }
        },

        cssmin: {
            compress: {
                files: {
                    'css/reveal.min.css': [ 'css/reveal.css' ]
                }
            }
        },

        sass: {
            main: {
                files: {
                    'css/theme/default.css': 'css/theme/source/default.scss',
                    'css/theme/beige.css': 'css/theme/source/beige.scss',
                    'css/theme/night.css': 'css/theme/source/night.scss',
                    'css/theme/serif.css': 'css/theme/source/serif.scss',
                    'css/theme/simple.css': 'css/theme/source/simple.scss',
                    'css/theme/sky.css': 'css/theme/source/sky.scss',
                    'css/theme/moon.css': 'css/theme/source/moon.scss',
                    'css/theme/solarized.css': 'css/theme/source/solarized.scss',
                    'css/theme/blood.css': 'css/theme/source/blood.scss',
                    'css/theme/jolicode.css': 'css/theme/source/jolicode.scss',
                    'css/theme/openbossa.css': 'css/theme/source/openbossa.scss',
                    'css/theme/aerogear.css': 'css/theme/source/aerogear.scss',
                    'css/theme/one-mozilla.css': 'css/theme/source/one-mozilla.scss',
                    'css/theme/parallax-demo.css': 'css/theme/source/parallax-demo.scss',
                    'css/theme/fourkitchens.css': 'css/theme/source/fourkitchens.scss'
                }
            }
        },

        less: {
          compileCore: {
            options: {
              strictMath: true,
              sourceMap: true,
              outputSourceFiles: true,
              sourceMapURL: '<%= pkg.name %>.css.map',
              sourceMapFilename: 'css/<%= pkg.name %>.css.map'
            },
            files: {
              'css/<%= pkg.name %>.css': 'less/bootstrap.less'
            }
          },
          themes: {
            options: {
              strictMath: true
            },
            files: {
                'css/theme/default.css': 'css/theme/source-less/default.less',
                'css/theme/beige.css': 'css/theme/source-less/beige.less',
                'css/theme/night.css': 'css/theme/source-less/night.less',
                'css/theme/serif.css': 'css/theme/source-less/serif.less',
                'css/theme/simple.css': 'css/theme/source-less/simple.less',
                'css/theme/sky.css': 'css/theme/source-less/sky.less',
                'css/theme/moon.css': 'css/theme/source-less/moon.less',
                'css/theme/solarized.css': 'css/theme/source-less/solarized.less',
                'css/theme/blood.css': 'css/theme/source-less/blood.less',
                'css/theme/jolicode.css': 'css/theme/source-less/jolicode.less',
                'css/theme/openbossa.css': 'css/theme/source-less/openbossa.less',
                'css/theme/aerogear.css': 'css/theme/source-less/aerogear.less',
                'css/theme/one-mozilla.css': 'css/theme/source-less/one-mozilla.less',
                'css/theme/parallax-demo.css': 'css/theme/source-less/parallax-demo.less',
                'css/theme/fourkitchens.css': 'css/theme/source-less/fourkitchens.less'
            }
          },
          minify: {
            options: {
              cleancss: true,
              report: 'min'
            },
            files: {
              'dist/css/<%= pkg.name %>.min.css': 'dist/css/<%= pkg.name %>.css',
              'dist/css/<%= pkg.name %>-theme.min.css': 'dist/css/<%= pkg.name %>-theme.css'
            }
          }
        },

        jshint: {
            options: {
                curly: false,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                eqnull: true,
                browser: true,
                expr: true,
                globals: {
                    head: false,
                    module: false,
                    console: false,
					unescape: false,
					define: false,
					exports: false
                }
            },
            files: [ 'Gruntfile.js', 'js/reveal.js' ]
        },

        connect: {
            server: {
                options: {
                    port: port,
                    base: '.',
                    livereload: true,
                    open: true
                }
            }
        },

        zip: {
            'reveal-js-presentation.zip': [
                'index.html',
                'css/**',
                'js/**',
                'lib/**',
                'images/**',
                'plugin/**'
            ]
        },

        watch: {
            options: {
                livereload: true
            },
            main: {
                files: [ 'Gruntfile.js', 'js/reveal.js', 'css/reveal.css' ],
                tasks: 'default'
            },
            theme: {
                files: [ 'css/theme/source-sass/*.scss', 'css/theme/template-sass/*.scss' ],
                tasks: 'themes'
            },
            html: {
                files: [ 'index.html']
            }
        }

    });

    // Dependencies
    grunt.loadNpmTasks( 'grunt-contrib-qunit' );
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-sass' );
    grunt.loadNpmTasks( 'grunt-contrib-less' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-contrib-connect' );
    grunt.loadNpmTasks( 'grunt-zip' );

    // Default task
    grunt.registerTask( 'default', [ 'copy:highlight', 'jshint', 'cssmin', 'uglify', 'qunit' ] );

    // Theme task
    grunt.registerTask( 'themes', [ 'sass' ] );

    // Package presentation to archive
    grunt.registerTask( 'package', [ 'default', 'zip' ] );

    // Serve presentation locally
    grunt.registerTask( 'serve', [ 'connect', 'watch' ] );

    // Run tests
    grunt.registerTask( 'test', [ 'jshint', 'qunit' ] );

};
