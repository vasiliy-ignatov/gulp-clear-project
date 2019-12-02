// requires

var gulp = require('gulp'),
	jade = require('gulp-jade'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	cleanCSS = require('gulp-clean-css'),
	concat = require('gulp-concat'),
	del = require('del'),
	base64 = require('gulp-base64');
	var rigger = require('gulp-rigger');
	var newer = require('gulp-newer');
	var plumber = require('gulp-plumber');
	var runSequence = require('run-sequence'); // очередь команд
	var browserSync = require('browser-sync');
	// const babel = require('gulp-babel');
	var autoprefixerr = require('autoprefixer');
	var postcss = require('gulp-postcss');

	var debug = false;
	var processors = [
	autoprefixerr({browsers: ['last 1 version']}),
	require('postcss-flexbugs-fixes')
	]

// configuration

var basePaths = {
	src: 'source',
	dest: 'htdocs/f',
	modules: 'source/modules',
	build: 'htdocs',
	build_html: 'htdocs/html',
	del: ['htdocs/html', 'htdocs/f']
};

var AUTOPREFIXER_BROWSERS = [
		'last 3 versions',
		'ie >= 9',
		'ios >= 7',
		'android >= 4.4',
		'bb >= 10'
];

var paths = {
	cssModules: [basePaths.modules + '/var.scss', basePaths.modules + '/**/*.scss'],



	css: 'source/f/css/',
	js: 'source/f/js/',
	img: 'source/f/i',
	audio: 'source/f/audio',
	sprites: 'source/f/sprites',
	svg: 'source/f/svg',
	fonts: 'source/f/fonts/**/*',
	releases: 'releases',
	tpl: 'source/tpl',
	php: 'source/f/php',
	vendorCss: 'source/f/css',
	images: {
		src: basePaths.src + 'f/i/',
		dest: basePaths.dest + 'i/'
	},
	sprite: {
		src: basePaths.src + 'f/sprite/*',
		svg: 'i/sprite.svg',
		css: '../../' + basePaths.src + 'stylus/_sprite.stylus'
	}
};

var watch = {
	jade: basePaths.src + '/**/*.jade',
	css: basePaths.modules + '/**/*.css',
	scss: basePaths.modules + '/**/*.scss',
	cssVendor: basePaths.src + '/f/css/**/*.css',
	js: basePaths.modules + '/**/*.js',
	jsVendor: basePaths.src + '/f/js/vendor/**/*.js',
	mixins: basePaths.modules + '/**/_*.jade',
	html: basePaths.src + '/**/*.html',
	img: paths.img + '/**/*',
	php: paths.php + '/**/*.php'
};

var dest = {
	source: 'htdocs',
	css: basePaths.dest + '/css',
	cssFileMain: basePaths.dest + '/css/main.css',
	stylus: 'htdocs/f/css',
	js: 'htdocs/f/js/',
	img: 'htdocs/f/i',
	audio: 'htdocs/f/audio',
	fonts: 'htdocs/f/fonts',
	php: 'htdocs/php',
	all: 'htdocs/**/*'
};

var files ={
	proxy: 'source/proxy.php'
}

let onError = function (err) {
		console.log(err);
		this.emit('end');
};

gulp.task('browserSync', function(){
	browserSync({
		server: {
			baseDir: './htdocs/',
			open: true
		},
		startPath: './html/'
	});
});

gulp.task('img', function() {
	return gulp.src(paths.img + '/**/*.*')
		.pipe(gulp.dest(dest.img))
});

gulp.task('audio', function() {
	return gulp.src(paths.audio + '/**/*.*')
		.pipe(gulp.dest(dest.audio))
});
// copying statics

gulp.task('fonts', function() {
	return gulp.src(paths.fonts)
		.pipe(gulp.dest(dest.fonts));
});

gulp.task('sass', function() {
	return gulp.src(paths.cssModules)
		.pipe(concat('main.css'))
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(processors))
		.pipe(newer(dest.cssFileMain))
		.pipe(plumber({errorHandler: onError}))
		.pipe(rigger())
		.pipe(gulp.dest(dest.css));
});

gulp.task('vedorCss', function() {
	return gulp.src([paths.css + '/fonts.css', paths.css+'/normalize.css', paths.css + '/**/*.css'])
		.pipe(newer(dest.css + '/vendor.css'))
		.pipe(plumber({errorHandler: onError}))
		.pipe(rigger())
		.pipe(concat('vendor.css'))
		.pipe(gulp.dest(dest.css));
});

// jade

gulp.task('jade', function() {
	return gulp.src([basePaths.src + '/*.jade', !basePaths.src + 'tpl/*.jade'])
		.pipe(newer(basePaths.build))
		.pipe(jade({
			pretty: true
		}))
		.pipe(gulp.dest(basePaths.build_html))
});

// JS
gulp.task('js', function() {
	return gulp.src(basePaths.modules + '/**/*.js')
		.pipe(plumber({errorHandler: onError}))
		.pipe(concat('main.js'))
		.pipe(gulp.dest(dest.js));
});
gulp.task('vendorJs', function() {
	return gulp.src(basePaths.src + '/f/js/vendor/**/*.js')
		.pipe(plumber({errorHandler: onError}))
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest(dest.js));
});
gulp.task('libeJs', function() {
	return gulp.src([basePaths.src + '/f/js/*.js'])
		.pipe(plumber({errorHandler: onError}))
		.pipe(gulp.dest(dest.js));
});

// clean

gulp.task('clean', function() {
	return del(
		basePaths.del
	);
	console.log('Очистка началась \n');
});

gulp.task('files', function() {
	return gulp.src([files.proxy])
		.pipe(plumber({errorHandler: onError}))
		.pipe(rigger())
		.pipe(gulp.dest(dest.source));
});

// default
gulp.task('default', ['browserSync','watch']);

gulp.task('build', function(){
	runSequence('clean',
		['fonts','vedorCss','sass','img', 'audio', 'libeJs','vendorJs','js','jade'],
		'files',
		function() {
			console.log('Build finished --> \n');
		}
	);
});

// watch
gulp.task('watch', function() {
	// gulp.watch(watch.mixins, ['mixins']);

	gulp.watch(watch.cssVendor, ['vedorCss']);
	gulp.watch(watch.css, ['sass']);
	gulp.watch(watch.scss, ['sass']);
	gulp.watch(watch.js, ['js']);
	gulp.watch(watch.jsVendor, ['vendorJs']);
	gulp.watch(watch.jade, ['jade']);
});
