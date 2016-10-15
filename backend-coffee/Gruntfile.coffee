module.exports = (grunt) ->
  grunt.initConfig
    express:
      dev:
        options:
          script: 'index.js'
    coffee:
      compile:
        files: [
          expand: true
          cwd: 'src/'
          src: ['**.coffee', '**/**.coffee', '**/**/**.coffee']
          dest: ''
          ext: '.js'
        ]
    coffeelint:
      files: ['src/*.coffee']
    watch:
      scripts:
        files: ['src/*']
        tasks: ['coffee:compile', 'express']
      options:
        dateFormat: (time) ->
          grunt.log.writeln('the watch finished in ' + time + 'ms')
          grunt.log.writeln('Waiting...')
        livereload: true
        spawn: false

  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-express-server'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-coffeelint'

  grunt.registerTask 'default', ['coffee:compile', 'coffeelint']
  grunt.registerTask 'server', ['default', 'express', 'watch:scripts']


  # node-debug app.js then go to dev port 3000
  # ps -ax | grep node
  # kill -9 PID
