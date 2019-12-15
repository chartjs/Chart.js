import resolve from '@rollup/plugin-node-resolve';
import cjs from "rollup-plugin-cjs-es";
import buble from '@rollup/plugin-buble';
import { string } from "rollup-plugin-string";
import { terser } from 'rollup-plugin-terser';

export default [
	{
		input: "src/index.js",
		output: {
			file: "dist/Chart.js",
			format: "iife",
			name: "Chart",
		},
		plugins: [
			resolve(),
			string({
				include: "**/*.css",
			}),
			cjs({nested: true}),
			buble({
				objectAssign: "Object.assign"
			}),
		]
	},
	{
		input: "src/index.js",
		output: {
			file: "dist/Chart.min.js",
			format: "iife",
			name: "Chart",
		},
		plugins: [
			resolve(),
			string({
				include: "**/*.css",
			}),
			cjs({nested: true}),
			buble({
				objectAssign: "Object.assign"
			}),
			terser({
				compress: {
					inline: 0,
				//	passes: 3,
					keep_fargs: false,
					pure_getters: true,
					unsafe: true,
					unsafe_comps: true,
					unsafe_math: true,
					unsafe_undefined: true,
				},
			//	output: {
			//		comments: /^!/
			//	}
			})
		]
	}
];