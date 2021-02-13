// Export all of these as we do in the tree-shakeable version
export * from './controllers';
export * from './core';
export * from './elements';
export * from './platform';
export * from './plugins';
export * from './scales';

import {Chart} from './core';
import * as controllers from './controllers';
import * as elements from './elements';
import * as plugins from './plugins';
import * as scales from './scales';

Chart.register(controllers, elements, plugins, scales);

// Since everything is already registered, provide a default Chart export for convenience
export default Chart;
