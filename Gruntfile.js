module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            common_sass: {
                src: [".tmp/sass/*", "app/sass/**"],
                dest: ".tmp/dest/sass/common.scss"
            },
            chrome_js: {
                src: [
                    "vendor/angular/angular.js",
                    "vendor/slider/js/range.js",
                    "vendor/slider/js/timer.js",
                    "vendor/slider/js/slider.js",
                    "vendor/id3/id3.min.js",
                    "app/js/angular/**"
                ],
                dest: "chrome/js/app.js"
            },
            chrome_css: {
                src: ["vendor/slider/css/style.css", "app/css/*", ".tmp/css/*"],
                dest: "chrome/css/app.css"
            }
        },
        svgzr: {
            svg: {
                options: {
                    files: {
                        cwdSvg: 'app/svg/',
                    },
                    prefix: 'svg-',
                    svg: {
                        destFile: '.tmp/sass/svg.scss'
                    }
                }
            }
        },
        sass: {
            common: {
                files: {
                    '.tmp/css/common.css': '.tmp/dest/sass/common.scss'
                }
            }
        },
        copy: {
            chrome: {
                files: [{
                    expand: true,
                    cwd: "app/chrome",
                    src: ["**"],
                    dest: "chrome/"
                },
                {
                    expand: true,
                    cwd: "app/html",
                    src: ["**"],
                    dest: "chrome/"
                },
                {
                    expand: true,
                    cwd: "app/images",
                    src: ["**"],
                    dest: "chrome/images"
                }]
            }
        },
        watch: {
            chrome: {
                files: [
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

    grunt.registerTask("common", [
        "svgzr:svg",
        "concat:common_sass",
        "sass:common"
    ]);

    grunt.registerTask("build:common", [
        "common",
        "copy:chrome",
    ]);

    grunt.registerTask("build:chrome", [
        "build:common",
        "concat:chrome_js",
        "concat:chrome_css"
    ]);

    grunt.registerTask("default", [
        "build:chrome",
        "watch:chrome"
    ]);
}