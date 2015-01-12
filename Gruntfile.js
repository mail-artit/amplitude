
/*jslint node: true */

(function () {

    'use strict';

    var path = require('path');

    module.exports = function (grunt) {
        grunt.initConfig({
            svgzr: {
                svg: {
                    options: {
                        files: {
                            cwdSvg: 'app/svg'
                        },
                        prefix: 'svg-',
                        svg: {
                            destFile: '.tmp/svg.scss'
                        }
                    }
                }
            },
            ngtemplates: {
                amplitude: {
                    src: 'app/**/*.tpl.html',
                    dest: '.tmp/templates.js',
                    options: {
                        url: function (url) {
                            return path.basename(url);
                        }
                    }
                }
            },
            concat: {
                common_sass: {
                    src: ['.tmp/svg.scss', 'app/**/*.scss'],
                    dest: '.tmp/common.scss'
                },
                common_js: {
                    src: [
                        'vendor/**/*.js',
                        'app/**/*.js',
                        '.tmp/templates.js'
                    ],
                    dest: '.tmp/common.js'
                },
                chrome_sass: {
                    src: ['.tmp/common.scss', 'chrome-app/app/**/*.scss'],
                    dest: '.tmp/chrome.scss'
                },
                chrome_js: {
                    src: [
                        '.tmp/common.js',
                        'chrome-app/app/**/*.js'
                    ],
                    dest: 'chrome-pkg/app.js'
                },
                chrome_css: {
                    src: [
                        '.tmp/chrome.css'
                    ],
                    dest: 'chrome-pkg/app.css'
                }
            },
            sass: {
                common: {
                    files: {
                        '.tmp/common.css': '.tmp/common.scss'
                    }
                },
                chrome: {
                    files: {
                        '.tmp/chrome.css': '.tmp/chrome.scss'
                    }
                }
            },
            copy: {
                chrome: {
                    files: [{
                        expand: true,
                        cwd: 'chrome-app',
                        src: ['**', '!**/app/**'],
                        dest: 'chrome-pkg/'
                    }, {
                        expand: true,
                        cwd: 'app/controllers/main',
                        src: ['main.html'],
                        dest: 'chrome-pkg/'
                    }, {
                        expand: true,
                        cwd: 'app/controllers/pl',
                        src: ['pl.html'],
                        dest: 'chrome-pkg/'
                    }]
                }
            },
            jslint : {
                all : {
                    src: [
                        './Gruntfile.js',
                        './app/**/*.js',
                        './chrome-app/**/*.js'
                    ]
                }
            },
            watch: {
                chrome: {
                    files: [
                        './Gruntfile.js',
                        'chrome-app/**',
                        'app/**',
                        'vendor/**'
                    ],
                    tasks: ['build:chrome']
                }
            },
            uglify: {
                chrome: {
                    files: {
                        'chrome-pkg/app.js': ['chrome-pkg/app.js']
                    }
                }
            },
            cssmin: {
                chrome: {
                    files: {
                        'chrome-pkg/app.css': ['chrome-pkg/app.css']
                    }
                }
            },
            compress: {
                chrome: {
                    options: {
                        mode: 'zip',
                        archive: 'chrome-pkg/package.zip'
                    },
                    files: [{
                        expand: true,
                        cwd: 'chrome-pkg',
                        src: ['**']
                    }]
                }
            },
            clean: {
                common: ['.tmp'],
                chrome: ['chrome-pkg']
            }
        });


        ['grunt-contrib-watch',
            'grunt-contrib-concat',
            'grunt-contrib-copy',
            'grunt-svgzr',
            'grunt-sass',
            'grunt-angular-templates',
            'grunt-jslint',
            'grunt-contrib-uglify',
            'grunt-contrib-cssmin',
            'grunt-contrib-compress',
            'grunt-contrib-clean'
            ].forEach(function (tasks) {

            grunt.loadNpmTasks(tasks);

        });

        grunt.registerTask('common', [
            'clean:common',
            'svgzr:svg',
            'ngtemplates:amplitude',
            'concat:common_sass',
            'concat:common_js'
        ]);

        grunt.registerTask('build:chrome', [
            'clean:chrome',
            'jslint:all',
            'common',
            'concat:chrome_sass',
            'sass:chrome',
            'copy:chrome',
            'concat:chrome_js',
            'concat:chrome_css'
        ]);

        grunt.registerTask('package:chrome', [
            'build:chrome',
            'uglify:chrome',
            'cssmin:chrome',
            'compress:chrome'
        ]);

        grunt.registerTask('default', [
            'build:chrome',
            'watch:chrome'
        ]);
    };
}());