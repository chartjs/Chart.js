/* eslint-disable import/no-commonjs */

const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const builds = require('./rollup.config');

module.exports = function(karma) {
	const args = karma.args || {};

	// Use the same rollup config as our dist files: when debugging (--watch),
	// we will prefer the unminified build which is easier to browse and works
	// better with source mapping. In other cases, pick the minified build to
	// make sure that the minification process (terser) doesn't break anything.
	const regex = args.watch ? /Chart\.js$/ : /Chart\.min\.js$/;
	const build = builds.filter(v => v.output.file.match(regex))[0];

	if (args.watch) {
		build.output.sourcemap = 'inline';
	}

	karma.set({
		frameworks: ['jasmine'],
		reporters: ['progress', 'kjhtml'],
		browsers: (args.browsers || 'chrome,firefox').split(','),
		logLevel: karma.LOG_WARN,

		// Explicitly disable hardware acceleration to make image
		// diff more stable when ran on Travis and dev machine.
		// https://github.com/chartjs/Chart.js/pull/5629
		customLaunchers: {
			chrome: {
				base: 'Chrome',
				flags: [
					'--disable-accelerated-2d-canvas'
				]
			},
			firefox: {
				base: 'Firefox',
				prefs: {
					'layers.acceleration.disabled': true
				}
			},
			safari: {
				base: 'SafariPrivate'
			},
			edge: {
				base: 'Edge'
			}
		},

		files: [
			{pattern: 'test/fixtures/**/*.js', included: false},
			{pattern: 'test/fixtures/**/*.json', included: false},
			{pattern: 'test/fixtures/**/*.png', included: false},
			'node_modules/moment/min/moment.min.js',
			'test/index.js',
			'src/index.js',
			'node_modules/chartjs-adapter-moment/dist/chartjs-adapter-moment.js'
		].concat((args.inputs || 'test/specs/**/*.js').split(';')),

		preprocessors: {
			'test/specs/**/*.js': ['rollup'],
			'test/index.js': ['rollup'],
			'src/index.js': ['sources']
		},

		rollupPreprocessor: {
			plugins: [
				resolve(),
				babel({exclude: 'node_modules/**'}), // use babel since we have ES proposal features
				commonjs({exclude: ['src/**', 'test/**']})
			],
			output: {
				name: 'test',
				format: 'umd'
			}
		},

		customPreprocessors: {
			sources: {
				base: 'rollup',
				options: build
			}
		},

		// These settings deal with browser disconnects. We had seen test flakiness from Firefox
		// [Firefox 56.0.0 (Linux 0.0.0)]: Disconnected (1 times), because no message in 10000 ms.
		// https://github.com/jasmine/jasmine/issues/1327#issuecomment-332939551
		browserDisconnectTolerance: 3
	});

	// https://swizec.com/blog/how-to-run-javascript-tests-in-chrome-on-travis/swizec/6647
	if (process.env.TRAVIS) {
		karma.customLaunchers.chrome.flags.push('--no-sandbox');
	}

	if (args.coverage) {
		karma.reporters.push('coverage');
		karma.coverageReporter = {
			dir: 'coverage/',
			reporters: [
				{type: 'html', subdir: 'html'},
				{type: 'lcovonly', subdir: '.'}
			]
		};
	}
};
