/* eslint-env es6 */

const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
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
	// UMD builds (excluding moment)
	// dist/Chart.min.js
	// dist/Chart.js
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
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

	// UMD builds (including moment)
	// dist/Chart.bundle.min.js
	// dist/Chart.bundle.js
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
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
