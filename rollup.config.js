import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import { readFileSync } from "fs";

const {version, homepage} = JSON.parse(readFileSync('./package.json'));

const banner = `/*!
 * Chart.js v${version}
 * ${homepage}
 * (c) ${(new Date(process.env.SOURCE_DATE_EPOCH ? (process.env.SOURCE_DATE_EPOCH * 1000) : new Date().getTime())).getFullYear()} Chart.js Contributors
 * Released under the MIT License
 */`;

export default [
  // UMD build
  // dist/chart.umd.js
  {
    input: 'src/index.umd.js',
    plugins: [
      json(),
      resolve(),
      terser({
        output: {
          preamble: banner
        }
      }),
    ],
    output: {
      name: 'Chart',
      file: 'dist/chart.umd.js',
      format: 'umd',
      indent: false,
      sourcemap: true,
    },
  },

  // ES6 builds
  // dist/chart.js
  // helpers/*.js
  {
    input: {
      'dist/chart': 'src/index.js',
      'dist/helpers': 'src/helpers/index.js'
    },
    plugins: [
      json(),
      resolve(),
      cleanup({
        comments: ['some', /__PURE__/],
      }),
    ],
    output: {
      dir: './',
      chunkFileNames: 'dist/chunks/[name].js',
      entryFileNames: '[name].js',
      banner,
      format: 'esm',
      indent: false,
      sourcemap: true,
    },
  }
];
