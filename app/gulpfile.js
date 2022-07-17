
const gulp = require("gulp");
const webpack = require('webpack-stream');  
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const postCSS = require('gulp-postcss');
const dist = 'C:/MAMP/htdocs/AdminPHP/admin';
const prod = './build/';

gulp.task("copy-html", () => {
    return gulp.src('./src/index.html')
                .pipe(gulp.dest(dist))
});

gulp.task("build-js", () => {
    return gulp.src('./src/main.js')
                .pipe(webpack({
                    mode:'development',
                    output: {
                        filename: 'script.js'
                    },
                    watch: false,
                    devtool: 'source-map',
                    module: {
                        rules: [
                            {
                                test: /\.m?js$/,
                                exclude: /(node_modules|bower_components)/,
                                use: {
                                    loader: 'babel-loader',
                                    options: {
                                        presets: [['@babel/preset-env', {
                                            debug: true,
                                            corejs: 3,
                                            useBuiltIns: "usage"
                                        }], 
                                        '@babel/react']
                                    }
                                }
                            }
                        ]
                    }
                }))
                .pipe(gulp.dest(dist))
});

gulp.task('build-sass', () => {
    return gulp.src('./scss/style.scss')
                .pipe(sass().on('error', sass.logError))
                .pipe(gulp.dest(dist))
});

gulp.task('copy-api', () => {
    gulp.src('./api/**/.*')              
        .pipe(gulp.dest(dist + '/api'));

    return gulp.src('./api/**/*.*')              
                  .pipe(gulp.dest(dist + '/api'))
});

gulp.task('copy-assets', () => {
    return gulp.src('./assets/**/*.*')
                  .pipe(gulp.dest(dist + '/assets'))
});

gulp.task('watch', () => {
    gulp.watch('./src/index.html', gulp.parallel('copy-html'));
    gulp.watch('./src/**/*.js', gulp.parallel('build-js'));
    gulp.watch('./scss/**/*.scss', gulp.parallel('build-sass'));
    gulp.watch('./api/**/*.*', gulp.parallel('copy-api'));
    gulp.watch('./assets/**/*.*', gulp.parallel('copy-assets'));
});

gulp.task('build', gulp.parallel('copy-html','copy-assets','build-sass','copy-api','build-js'));

gulp.task("prod", () => {          
    gulp.src('./src/index.html')
        .pipe(gulp.dest(prod));
    gulp.src('./api/**/.*')               
        .pipe(gulp.dest(prod + '/api'));
    gulp.src('./api/**/*.*')           
        .pipe(gulp.dest(prod + '/api'));
    gulp.src('./assets/**/*.*')
        .pipe(gulp.dest(prod + '/assets'));

    gulp.src('./src/main.js')
        .pipe(webpack({
            mode:'production',
            output: {
                filename: 'script.js'
            },
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    debug: false,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }], 
                                '@babel/react']
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(prod));

    return gulp.src('./scss/style.scss')
        .pipe(sass().on('error', sass.logError))  
        .pipe(postCSS([autoprefixer()]))         
        .pipe(cleanCSS())                       
        .pipe(gulp.dest(prod));
});

gulp.task('default', gulp.parallel('watch', 'build'));