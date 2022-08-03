const cleanup = require('rollup-plugin-cleanup');
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve').default;
const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const banner = `/*!
 * Chart.js v${pkg.version}
 * ${pkg.homepage}
 * (c) ${(new Date(process.env.SOURCE_DATE_EPOCH ? (process.env.SOURCE_DATE_EPOCH * 1000) : new Date().getTime())).getFullYear()} Chart.js Contributors
 * Released under the MIT License
 */`;

module.exports = [
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
        sourcemap: true
      }),
    ],
    output: {
      dir: './',
      chunkFileNames: 'dist/chunks/[name].js',
      entryFileNames: '[name].js',
      banner,
      format: 'esm',
      indent: false,
    },
  }
];
