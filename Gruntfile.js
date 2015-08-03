/* global module:false */
module.exports = function(grunt) {
    var port = grunt.option('port') || 8000;

    // Load grunt tasks automatically, when needed
    require("jit-grunt")(grunt, {
        buildcontrol: 'grunt-build-control'
    });

    //Time how long tasks take. Can help when optimizing build times
    require("time-grunt")(grunt);

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        config: {
            buildDir: './dist'
        },

        meta: {
            banner:
                '/*!\n' +
                ' * reveal.js <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd, HH:MM") %>)\n' +
                ' * http://lab.hakim.se/reveal-js\n' +
                ' * MIT licensed\n' +
                ' *\n' +
				' * Copyright (C) 2015 Hakim El Hattab, http://hakim.se\n' +
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

		autoprefixer: {
			dist: {
				src: 'css/reveal.css'
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
			core: {
                files: {
					'css/reveal.css': 'css/reveal.scss',
                }
		},
			themes: {
				files: [
					{
						expand: true,
						cwd: 'css/theme/source-sass',
						src: ['*.scss'],
						dest: 'css/theme',
						ext: '.css'
					}
				]
            }
        },

        less: {
          reveal: {
            options: {
              strictMath: true,
              sourceMap: true,
              outputSourceFiles: true
            },
            files: {
              src: 'css/reveal.less',
              dst: 'less/bootstrap.less'
            }
          },
          themes: {
            options: {
              strictMath: true
            },
            files: {
                'css/theme/default.css': 'css/theme/source-less/default.less',
                'css/theme/black.css': 'css/theme/source-less/black.less',
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
			js: {
				files: [ 'Gruntfile.js', 'js/reveal.js' ],
				tasks: 'js'
            },
            theme: {
                files: [ 'css/theme/source-sass/*.scss', 'css/theme/template-sass/*.scss' ],
				tasks: 'css-themes'
			},
			css: {
				files: [ 'css/reveal.scss' ],
				tasks: 'css-core'
            },
			html: {
				files: [ 'index.html']
            }
        },

        clean: {
            build: [
                '<%= config.buildDir %>/*',
                '!<%= config.buildDir %>/.git',
                '!<%= config.buildDir %>/.openshift',
                '!<%= config.buildDir %>/Procfile',
                '!<%= config.buildDir %>/CNAME'
            ]
        },

        buildcontrol: {
            options: {
                dir: '<%= config.buildDir %>',
                commit: true,
                push: true,
                connectCommits: false

            },
            github: {
                options: {
                    remote: 'origin',
                    branch: 'gh-pages'
                }
			}
        }

    });

    // Dependencies
    grunt.loadNpmTasks( 'grunt-contrib-qunit' );
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-sass' );
    grunt.loadNpmTasks( 'grunt-contrib-less' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-contrib-connect' );
	grunt.loadNpmTasks( 'grunt-autoprefixer' );
    grunt.loadNpmTasks( 'grunt-zip' );

    // Default task
	grunt.registerTask( 'default', [ 'copy:highlight', 'css', 'js' ] );

	// JS task
	grunt.registerTask( 'js', [ 'jshint', 'uglify', 'qunit' ] );

	// Theme CSS
	grunt.registerTask( 'css-themes', [ 'sass:themes' ] );

	// Core framework CSS
	grunt.registerTask( 'css-core', [ 'sass:core', 'autoprefixer', 'cssmin' ] );

	// All CSS
	grunt.registerTask( 'css', [ 'sass', 'autoprefixer', 'cssmin' ] );

    // Package presentation to archive
    grunt.registerTask( 'package', [ 'default', 'zip' ] );

    // Serve presentation locally
    grunt.registerTask( 'serve', [ 'connect', 'watch' ] );

    // Run tests
    grunt.registerTask( 'test', [ 'jshint', 'qunit' ] );

    // Build for publising (on gh-pages, for example)
    grunt.registerTask( 'build', [ 'clean:build', 'default', 'copy', 'jade' ]);

    // deploy using buildcontrol
    grunt.registerTask('deploy', function(target) {
      if (!target) {
        grunt.log.warn('You must provide a target for deploy task.');
        return;
      }
      
      grunt.task.run(['build', 'buildcontrol:' + target]);
    });
};
