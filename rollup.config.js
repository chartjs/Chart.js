/* eslint-env es6 */

import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import {optional, stylesheet} from './rollup.plugins';
import pkg from './package.json';

const input = 'src/index.js';
const banner = `/*!
 * Chart.js v${pkg.version}
 * ${pkg.homepage}
 * (c) ${(new Date(process.env.SOURCE_DATE_EPOCH ? (process.env.SOURCE_DATE_EPOCH * 1000) : new Date().getTime())).getFullYear()} Chart.js Contributors
 * Released under the MIT License
 */`;

export default [
	// ES6 builds
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
	// UMD builds
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
	}
]
