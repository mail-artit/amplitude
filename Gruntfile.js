var path = require("path");

module.exports = function(grunt) {
    grunt.initConfig({
        svgzr: {
            svg: {
                options: {
                    files: {
                        cwdSvg: 'app/svg',
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
                    url: function (url) { return path.basename(url); }
                }
            }
        },
        concat: {
            common_sass: {
                src: [".tmp/svg.scss", "app/**/*.scss"],
                dest: ".tmp/all.scss"
            },
            chrome_js: {
                src: [
                    "vendor/**/*.js",
                    "app/**/*.js",
                    "chrome-app/app/**/*.js",
                    ".tmp/templates.js"
                ],
                dest: "chrome-pkg/app.js"
            },
            chrome_css: {
                src: [".tmp/all.css"],
                dest: "chrome-pkg/app.css"
            }
        },
        sass: {
            common: {
                files: {
                    '.tmp/all.css': '.tmp/all.scss'
                }
            }
        },
        copy: {
            chrome: {
                files: [{
                    expand: true,
                    cwd: "chrome-app",
                    src: ["**", "!**/app/**"],
                    dest: "chrome-pkg/"
                },
                {
                    expand: true,
                    cwd: "app/controllers/main",
                    src: ["main.html"],
                    dest: "chrome-pkg/"
                }]
            }
        },
        watch: {
            chrome: {
                files: [
                    "chrome-app/**",
                    "app/**",
                    "vendor/**"
                ],
                tasks: ["build:chrome"]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-svgzr');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.registerTask("common", [
        "svgzr:svg",
        "concat:common_sass",
        "sass:common",
        "ngtemplates:amplitude"
    ]);

    grunt.registerTask("build:common", []);

    grunt.registerTask("build:chrome", [
        "common",
        "copy:chrome",
        "concat:chrome_js",
        "concat:chrome_css"
    ]);

    grunt.registerTask("default", [
        "build:chrome",
        "watch:chrome"
    ]);
}