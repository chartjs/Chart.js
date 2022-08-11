export * from './controllers';
export * from './core';
export * from './elements';
export * from './platform';
export * from './plugins';
export * from './scales';

import * as controllers from './controllers';
import * as elements from './elements';
import * as plugins from './plugins';
import * as scales from './scales';

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
