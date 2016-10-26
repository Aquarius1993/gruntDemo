module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    var timestamp = new Date().getTime();
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var lrPort = 35729;
     // 使用connect-livereload模块，生成一个与LiveReload脚本
     // <script src="http://127.0.0.1:35729/livereload.js?snipver=1"    type="text/javascript"></script>
     var lrSnippet = require('connect-livereload')({
         port: lrPort
     });
     // 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
     var lrMiddleware = function(connect, options) {
         return [
             // 把脚本，注入到静态文件中
             lrSnippet,
             // 静态文件服务器的路径
             serveStatic(options.base[0]),
             // 启用目录浏览(相当于IIS中的目录浏览)
             serveIndex(options.base[0])
         ];
     };
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            options: {
                // 服务器端口号
                port: 8666,
                // 服务器地址(可以使用主机名localhost，也能使用IP)
                // 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
                base: '.'
            },
            livereload: {
                options: {
                    // 通过LiveReload脚本，让页面重新加载。
                    middleware: lrMiddleware
                }
            }
        },
        watch: {
            js: {
                files: ['src/js/*.js','!src/js/index.js','src/sass/*.scss','src/*.html','!src/sass/all.scss'],
                tasks: ['clean' ,'concat:concatsass', 'concat:dev','sass','uglify:build','copy','cssmin:build', 'usemin'],
                options: {
                    livereload: lrPort
                }
            }
        },
        // es6
        babel: {
            options: {
                sourceMap: true,
                presets: ['babel-preset-es2015']
            },
            dist: {
                files: {
                    'src/js/main.js': 'src/js/main.es6.js'
                }
            }
        },
        //文件合并
        concat: {
            options: {
                //定义一个用于插入合并输出文件之间的字符
                seperator: ';'
            },
            prod: {
                //将要合并的文件
                // src:['src/**/*.js'],
                //合并后的js文件的存放位置
                // dest:['build/<%=  pkg.name %>.js']
                files: { // Dictionary of files 
                    'src/css/main.css': ['src/css/*.css'],
                    'src/js/index.js': ['src/js/*.js',"!src/js/dev.js",'!src/js/*.es6.js'],
                }
            },
            dev: {
                files: { // Dictionary of files 
                    'src/css/main.css': ['src/css/*.css'],
                    'src/js/index.js': ['src/js/*.js',"!src/js/prod.js",'!src/js/*.es6.js'],
                }
            },
            concatsass: {
                files: {
                    'src/sass/all.scss': ['src/sass/*.scss']
                }
            }
        },
        //压缩js
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                files:{
                    'dist/js/index.min.js':'src/js/index.js',
                }
            }
        },
        //压缩html
        htmlmin: {
            options: { // Target options 
                removeComments: true,//去注释
                removeCommentsFromCDATA: true,
                collapseWhitespace: true // 去换行
            },
            html: {
                files: [{ // Dictionary of files
                    expand: true,
                    cwd: 'dist',
                    src: ['*.html'],
                    dest: 'dist' //'destination':'source'
                }]
            }
        },
        //css压缩
        cssmin: {
            options: {
                //shorthandCompactiong:false,
                roundingPercision: -1 //这个属性应该是将样式相同的都提取出来
            },
            build: {
                files: {
                     'dist/css/main.min.css': 'src/css/main.css',
                }
            }
        },
        //处理html中css、js 引入合并问题
        usemin: {
            html: 'dist/*.html',
            options: {
                blockReplacements: {
                    js: function(block) {
                        return '<script type="text/javascript" src="' + block.dest + '?t=' + timestamp + '"></script>';
                    },
                    css: function(block) {
                        return '<link rel="stylesheet" type="text/css" href="' + block.dest + '?t=' + timestamp + '"/>';
                    }
                }
            }
        },
        //copy
        copy: {
            src: {
                files: [
                    { expand: true, cwd: 'src/css', src: ['*.min.css'], dest: 'dist/css' },
                    { expand: true, cwd: 'src/js', src: ['*.min.js'], dest: 'dist/js' },
                    { expand: true, cwd: 'src/', src: ['*.html'], dest: 'dist' },
                    { expand: true, cwd: 'src/libs', src: ['**/*.*'], dest: 'dist/libs' },
                ]
            },
            image: {
                files: [
                    { expand: true, cwd: 'src/images', src: ['*.{png,jpg,jpeg,gif,ico}'], dest: 'dist/images' }
                ]
            }
        },
        sass: {
            dist: {
                options: {                       // Target options 
                    style: 'expanded'
                },
                files: {
                    'src/css/all.css': 'src/sass/all.scss'
                }
            }
        },
        //清理文件
        clean: {
            html: ['dist/*.html'],
            sass: ['src/sass/all.scss'],
            css: ['dist/css','src/css/main.css'],
            js: ['dist/js','src/js/index.js'],//,
            images: ['dist/images']
        }

    });
    //加载包含"uglify" 任务的插件  可以用require('load-grunt-tasks')(grunt);代替
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-contrib-copy');
    // //grunt.loadNpmTasks('grunt-contrib-qunit');
    // grunt.loadNpmTasks('grunt-contrib-htmlmin');
    // grunt.loadNpmTasks('grunt-contrib-cssmin');
    // grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-contrib-concat');
    // grunt.loadNpmTasks('grunt-usemin');
    // grunt.loadNpmTasks('grunt-contrib-sass');
    // grunt.loadNpmTasks('grunt-contrib-clean');
    // grunt.loadNpmTasks('grunt-include-replace');
    // grunt.loadNpmTasks('grunt-contrib-connect');
    // grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-babel');
    // grunt.loadNpmTasks('babel-preset-es2015');

    //默认被执行的任务列表
    grunt.registerTask('devT', ['connect','watch'])
    grunt.registerTask('prod', ['clean','babel','concat:concatsass','sass', 'concat:prod','uglify:build','copy','cssmin:build','htmlmin' , 'usemin']);
    grunt.registerTask('dev', ['clean','babel','concat:concatsass', 'sass','concat:dev','uglify:build','copy','cssmin:build', 'usemin']);
};
