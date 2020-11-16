/* eslint-disable import/no-commonjs */
/* eslint-env es6 */

const cleanup = require('rollup-plugin-cleanup');
const dts = require('rollup-plugin-dts').default;
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve').default;
const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const input = 'src/index.js';
const inputESM = {
	'dist/chart.esm': 'src/index.esm.js',
	'dist/helpers.esm': 'src/helpers/index.js'
};
const inputESMTypings = {
	'dist/chart.esm': 'types/index.esm.d.ts',
	'dist/helpers.esm': 'types/helpers/index.d.ts'
};

const banner = `/*!
 * Chart.js v${pkg.version}
 * ${pkg.homepage}
 * (c) ${(new Date(process.env.SOURCE_DATE_EPOCH ? (process.env.SOURCE_DATE_EPOCH * 1000) : new Date().getTime())).getFullYear()} Chart.js Contributors
 * Released under the MIT License
 */`;

module.exports = [
	// UMD builds
	// dist/chart.min.js
	// dist/chart.js
	{
		input,
		plugins: [
			json(),
			resolve(),
			cleanup({
				sourcemap: true
			})
		],
		output: {
			name: 'Chart',
			file: 'dist/chart.js',
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
			terser({
				output: {
					preamble: banner
				}
			})
		],
		output: {
			name: 'Chart',
			file: 'dist/chart.min.js',
			format: 'umd',
			indent: false,
		},
	},

	// ES6 builds
	// dist/chart.esm.js
	// helpers/*.js
	{
		input: inputESM,
		plugins: [
			json(),
			resolve(),
			cleanup({
				sourcemap: true
			})
		],
		output: {
			dir: './',
			chunkFileNames: 'dist/chunks/[name].js',
			banner,
			format: 'esm',
			indent: false,
		},
	},
	// ES6 Typings builds
	// dist/chart.esm.d.ts
	// helpers/*.d.ts
	{
		input: inputESMTypings,
		plugins: [
			dts()
		],
		output: {
			dir: './',
			chunkFileNames: 'dist/chunks/[name].ts',
			banner,
			format: 'esm',
			indent: false,
		},
	}
];
