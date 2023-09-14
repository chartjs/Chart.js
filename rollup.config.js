import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import {swc} from 'rollup-plugin-swc3';
import {terser} from 'rollup-plugin-terser';
import {readFileSync} from 'fs';

const {version, homepage} = JSON.parse(readFileSync('./package.json'));

const banner = `/*!
 * Chart.js v${version}
 * ${homepage}
 * (c) ${(new Date(process.env.SOURCE_DATE_EPOCH ? (process.env.SOURCE_DATE_EPOCH * 1000) : new Date().getTime())).getFullYear()} Chart.js Contributors
 * Released under the MIT License
 */`;
const extensions = ['.js', '.ts'];
const plugins = (minify) =>
  [
    json(),
    resolve({
      extensions
    }),
    swc({
      jsc: {
        parser: {
          syntax: 'typescript'
        },
        target: 'es2022'
      },
      module: {
        type: 'es6'
      },
      sourceMaps: true
    }),
    minify
      ? terser({
        output: {
          preamble: banner
        }
      })
      : cleanup({
        comments: ['some', /__PURE__/]
      })
  ];

export default [
  // UMD build
  // dist/chart.umd.js
  {
    input: 'src/index.umd.ts',
    plugins: plugins(true),
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
      'dist/chart': 'src/index.ts',
      'dist/helpers': 'src/helpers/index.ts'
    },
    plugins: plugins(),
    external: _ => (/node_modules/).test(_),
    output: {
      dir: './',
      chunkFileNames: 'dist/chunks/[name].js',
      entryFileNames: '[name].js',
      banner,
      format: 'esm',
      indent: false,
      sourcemap: true,
    },
  },

  // CommonJS builds
  // dist/chart.js
  // helpers/*.js
  {
    input: {
      'dist/chart': 'src/index.ts',
      'dist/helpers': 'src/helpers/index.ts'
    },
    plugins: plugins(),
    external: _ => (/node_modules/).test(_),
    output: {
      dir: './',
      chunkFileNames: 'dist/chunks/[name].cjs',
      entryFileNames: '[name].cjs',
      banner,
      format: 'commonjs',
      indent: false,
      sourcemap: true,
    },
  }
];
