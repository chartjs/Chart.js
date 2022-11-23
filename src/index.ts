export * from './controllers/index.js';
export * from './core/index.js';
export * from './elements/index.js';
export * from './platform/index.js';
export * from './plugins/index.js';
export * from './scales/index.js';

import * as controllers from './controllers/index.js';
import * as elements from './elements/index.js';
import * as plugins from './plugins/index.js';
import * as scales from './scales/index.js';

export {
  controllers,
  elements,
  plugins,
  scales,
};

export const registerables = [
  controllers,
  elements,
  plugins,
  scales,
];
