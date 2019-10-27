/* eslint-env es6 */

const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const terser = require('rollup-plugin-terser').terser;
const optional = require('./rollup.plugins').optional;
const stylesheet = require('./rollup.plugins').stylesheet;
const pkg = require('./package.json');

const input = 'src/index.js';
const banner = `/*!
 * Chart.js v${pkg.version}
 * ${pkg.homepage}
 * (c) ${new Date().getFullYear()} Chart.js Contributors
 * Released under the MIT License
 */`;

module.exports = [
	// ES6 builds (excluding moment)
	// dist/Chart.esm.min.js
	// dist/Chart.esm.js
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			}),
			stylesheet({
				extract: true
			}),
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.esm.js',
			banner: banner,
			format: 'esm',
			indent: false,
			globals: {
				moment: 'moment'
			}
		},
		external: [
			'moment'
		]
	},
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			}),
			stylesheet({
				extract: true,
				minify: true
			}),
			terser({
				output: {
					preamble: banner
				}
			})
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.esm.min.js',
			format: 'esm',
			indent: false,
			globals: {
				moment: 'moment'
			}
		},
		external: [
			'moment'
		]
	},
	// UMD builds (excluding moment)
	// dist/Chart.min.js
	// dist/Chart.js
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			}),
			stylesheet({
				extract: true
			}),
			optional({
				include: ['moment']
			})
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.js',
			banner: banner,
			format: 'umd',
			indent: false,
			globals: {
				moment: 'moment'
			}
		},
		external: [
			'moment'
		]
	},
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			}),
			optional({
				include: ['moment']
			}),
			stylesheet({
				extract: true,
				minify: true
			}),
			terser({
				output: {
					preamble: banner
				}
			})
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.min.js',
			format: 'umd',
			indent: false,
			globals: {
				moment: 'moment'
			}
		},
		external: [
			'moment'
		]
	},

	// ES6 builds (including moment)
	// dist/Chart.bundle.esm.min.js
	// dist/Chart.bundle.esm.js
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			}),
			stylesheet()
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.bundle.esm.js',
			banner: banner,
			format: 'esm',
			indent: false
		}
	},
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			}),
			stylesheet({
				minify: true
			}),
			terser({
				output: {
					preamble: banner
				}
			})
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.bundle.esm.min.js',
			format: 'esm',
			indent: false
		}
	},
	// UMD builds (including moment)
	// dist/Chart.bundle.min.js
	// dist/Chart.bundle.js
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			}),
			stylesheet()
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.bundle.js',
			banner: banner,
			format: 'umd',
			indent: false
		}
	},
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			}),
			stylesheet({
				minify: true
			}),
			terser({
				output: {
					preamble: banner
				}
			})
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.bundle.min.js',
			format: 'umd',
			indent: false
		}
	}
];
