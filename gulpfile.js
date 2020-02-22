/* eslint-disable import/no-nodejs-modules, import/no-commonjs, no-use-before-define */
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const file = require('gulp-file');
const replace = require('gulp-replace');
const size = require('gulp-size');
const streamify = require('gulp-streamify');
const terser = require('gulp-terser');
const zip = require('gulp-zip');
const exec = require('child_process').exec;
const karma = require('karma');
const merge = require('merge-stream');
const yargs = require('yargs');
const path = require('path');
const htmllint = require('gulp-htmllint');
const typescript = require('gulp-typescript');
const typedoc = require('gulp-typedoc');

const pkg = require('./package.json');
const tsProject = typescript.createProject('./tsconfig.json');

const argv = yargs
	.option('verbose', {default: false})
	.argv;

const srcDir = './src/';
const outDir = './dist/';

gulp.task('bower', bowerTask);
gulp.task('build', buildTask);
gulp.task('package', packageTask);
gulp.task('lint-html', lintHtmlTask);
gulp.task('lint-js', lintJsTask);
gulp.task('lint', gulp.parallel('lint-html', 'lint-js'));
gulp.task('tsc', typescriptTask);
gulp.task('docs', docsTask);
gulp.task('unittest', unittestTask);
gulp.task('test', gulp.parallel('lint', 'tsc', 'unittest'));
gulp.task('library-size', librarySizeTask);
gulp.task('module-sizes', moduleSizesTask);
gulp.task('size', gulp.parallel('library-size', 'module-sizes'));
gulp.task('default', gulp.parallel('build'));

function run(bin, args) {
	return new Promise((resolve, reject) => {
		const exe = '"' + process.execPath + '"';
		const src = require.resolve(bin);
		const cmd = [exe, src].concat(args || []).join(' ');
		const ps = exec(cmd);

		ps.stdout.pipe(process.stdout);
		ps.stderr.pipe(process.stderr);
		ps.on('close', (error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}

/**
 * Generates the bower.json manifest file which will be pushed along release tags.
 * Specs: https://github.com/bower/spec/blob/master/json.md
 */
function bowerTask() {
	const json = JSON.stringify({
		name: pkg.name,
		description: pkg.description,
		homepage: pkg.homepage,
		license: pkg.license,
		version: pkg.version,
		main: outDir + 'Chart.js',
		ignore: [
			'.github',
			'.codeclimate.yml',
			'.gitignore',
			'.npmignore',
			'.travis.yml',
			'scripts'
		]
	}, null, 2);

	return file('bower.json', json, {src: true})
		.pipe(gulp.dest('./'));
}

function buildTask() {
	return run('rollup/dist/bin/rollup', ['-c', argv.watch ? '--watch' : '']);
}

function packageTask() {
	return merge(
		// gather "regular" files landing in the package root
		gulp.src([outDir + '*.js', outDir + '*.css', 'LICENSE.md']),

		// since we moved the dist files one folder up (package root), we need to rewrite
		// samples src="../dist/ to src="../ and then copy them in the /samples directory.
		gulp.src('./samples/**/*', {base: '.'})
			.pipe(streamify(replace(/src="((?:\.\.\/)+)dist\//g, 'src="$1')))
	)
	// finally, create the zip archive
		.pipe(zip('Chart.js.zip'))
		.pipe(gulp.dest(outDir));
}

function lintJsTask() {
	const files = [
		'samples/**/*.html',
		'samples/**/*.js',
		'src/**/*.js',
		'test/**/*.js'
	];

	// NOTE(SB) codeclimate has 'complexity' and 'max-statements' eslint rules way too strict
	// compare to what the current codebase can support, and since it's not straightforward
	// to fix, let's turn them as warnings and rewrite code later progressively.
	const options = {
		rules: {
			complexity: [1, 10],
			'max-statements': [1, 30]
		}
	};

	return gulp.src(files)
		.pipe(eslint(options))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
}

function typescriptTask() {
	return tsProject.src()
		.pipe(tsProject())
		.js.pipe(gulp.dest('dist'));
}

function lintHtmlTask() {
	return gulp.src('samples/**/*.html')
		.pipe(htmllint({
			failOnError: true,
		}));
}

function docsTask(done) {
	const bin = require.resolve('gitbook-cli/bin/gitbook.js');
	const cmd = argv.watch ? 'serve' : 'build';

	return run(bin, ['install', './'])
		.then(() => run(bin, [cmd, './', './dist/docs']))
		.then(() => {
			const config = {
				moduleResolution: 'Node',
				target: 'ES6',
				out: './dist/docs/typedoc'
			};
			gulp.src(['./src/**/*.js'], {read: false})
				.pipe(typedoc(config, done));
		}).catch((err) => {
			done(new Error(err.stdout || err));
		});
}

function unittestTask(done) {
	// use `env.test` from `babel.config.json` for karma builds
	process.env.NODE_ENV = 'test';
	new karma.Server({
		configFile: path.join(__dirname, 'karma.conf.js'),
		singleRun: !argv.watch,
		args: {
			coverage: !!argv.coverage,
			inputs: argv.inputs,
			browsers: argv.browsers,
			watch: argv.watch
		}
	},
	// https://github.com/karma-runner/gulp-karma/issues/18
	(error) => {
		error = error ? new Error('Karma returned with the error code: ' + error) : undefined;
		done(error);
	}).start();
}

function librarySizeTask() {
	return gulp.src('dist/Chart.bundle.min.js')
		.pipe(size({
			gzip: true
		}));
}

function moduleSizesTask() {
	return gulp.src(srcDir + '**/*.js')
		.pipe(terser())
		.pipe(size({
			showFiles: true,
			gzip: true
		}));
}
