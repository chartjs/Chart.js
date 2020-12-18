/**
 * Top-level type definitions.  These are processed by Rollup and rollup-plugin-dts
 * to make a combined .d.ts file under dist; that way, all of the type definitions
 * appear directly within the "chart.js" module; that matches the layout of the
 * distributed chart.esm.js bundle and means that users of Chart.js can easily use
 * module augmentation to extend Chart.js's types and plugins within their own
 * code, like so:
 *
 * @example
 * declare module "chart.js" {
 *   // Add types here
 * }
 */

export * from './controllers';
export * from './core';
export * from './elements';
export * from './core/interfaces';
export * from './platform';
export * from './plugins';
export * from './scales';
export * from './interfaces';
