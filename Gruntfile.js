module.exports = function(grunt) {
	grunt.initConfig({
		concat: {
			chrome_js: {
				src: [
					"vendor/jquery.js",
					"vendor/slider/js/range.js",
					"vendor/slider/js/timer.js",
					"vendor/slider/js/slider.js",
					"vendor/id3/id3.min.js",
					"app/js/*"
				],
				dest: "chrome/js/app.js"
			},
			chrome_css: {
				src: ["vendor/slider/css/style.css", "app/css/*"],
				dest: "chrome/css/app.css"
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
      			tasks: ["copy:chrome", "concat:chrome_js", "concat:chrome_css"]
     		}
     	}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
  	grunt.loadNpmTasks('grunt-contrib-watch');
  	grunt.loadNpmTasks('grunt-contrib-concat');
  	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask("default", [
		"copy:chrome",
		"concat:chrome_js",
		"concat:chrome_css",
		"watch:chrome"
	]);
}