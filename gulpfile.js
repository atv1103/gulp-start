const { src, dest, watch, parallel, series } = require('gulp');

const scss         = require('gulp-sass')(require('sass')); // из SCSS в CSS
const concat       = require('gulp-concat'); // объединение файлов CSS, JS
const autoprefixer = require('gulp-autoprefixer'); // кроссбраузерность
const uglify       = require('gulp-uglify'); // минификация JS файлов 
const imagemin     = require('gulp-imagemin'); // минификация изображений
const del          = require('del'); // удаляет ненужные файлы в итоговой папке при синхронизации
const browserSync  = require('browser-sync').create(); // обновление страницы HTML при изменениях кода, открыть HTML с мобильных устройств по IP (поле 'External')


function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        notify: false
    })
}

function styles() {
    return src([
            'app/scss/style.scss',
        ])
        .pipe(scss({ outputStyle: 'compressed' })) // expanded
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
        'app/js/main.js',
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function images() {
    return src('app/images/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function build() {
    return src([
        'app/**/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js'
    ], { base: 'app' })
        .pipe(dest('dist'))
}

function cleanDist() {
    return del('dist')
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload);
}


exports.styles  = styles;
exports.scripts = scripts;
exports.brobrowsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build); // строгая очередность скриптов

exports.default = parallel(styles, scripts, browsersync, watching); // (параллельный) запуск поток скриптов по комманде 'gulp' 