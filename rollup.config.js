/* eslint-disable import/no-commonjs */
/* eslint-env es6 */

const babel = require('rollup-plugin-babel');
const cleanup = require('rollup-plugin-cleanup');
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve');
const terser = require('rollup-plugin-terser').terser;
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
			json(),
			resolve(),
			babel(),
			cleanup({
				sourcemap: true
			})
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.js',
			banner,
			format: 'umd',
			indent: false,
		},
	},
	{
		input,
		plugins: [
			json(),
			resolve(),
			babel(),
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
		},
	},

	// ES6 builds
	// dist/Chart.esm.min.js
	// dist/Chart.esm.js
	{
		input,
		plugins: [
			json(),
			resolve(),
			babel({envName: 'es6'}),
			cleanup({
				sourcemap: true
			})
		],
		output: {
			name: 'Chart',
			file: 'dist/Chart.esm.js',
			banner,
			format: 'esm',
			indent: false,
		},
	},
	{
		input,
		plugins: [
			json(),
			resolve(),
			babel({envName: 'es6'}),
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
		},
	},
];
