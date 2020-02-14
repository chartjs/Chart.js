/* eslint-disable import/no-commonjs */
/* eslint-env es6 */

const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const cleanup = require('rollup-plugin-cleanup');
const terser = require('rollup-plugin-terser').terser;
const optional = require('./rollup.plugins').optional;
const stylesheet = require('./rollup.plugins').stylesheet;
const pkg = require('./package.json');

const input = 'src/index.js';

const banner = `/*!
 * Chart.js v${pkg.version}
 * ${pkg.homepage}
 * (c) ${(new Date(process.env.SOURCE_DATE_EPOCH ? (process.env.SOURCE_DATE_EPOCH * 1000) : new Date().getTime())).getFullYear()} Chart.js Contributors
 * Released under the MIT License
 */`;

module.exports = [
	// UMD builds
	// dist/Chart.min.js
	// dist/Chart.js
	{
		input,
		plugins: [
			resolve(),
			commonjs(),
			babel(),
			stylesheet({
				extract: true
			}),
			optional({
				include: ['moment']
			}),
			cleanup(),
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.js',
			banner,
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
		input,
		plugins: [
			resolve(),
			commonjs(),
			babel(),
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

	// ES6 builds
	// dist/Chart.esm.min.js
	// dist/Chart.esm.js
	{
		input,
		plugins: [
			resolve(),
			commonjs(),
			babel(),
			stylesheet({
				extract: true
			}),
			cleanup(),
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.esm.js',
			banner,
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
		input,
		plugins: [
			resolve(),
			commonjs(),
			babel(),
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
];
