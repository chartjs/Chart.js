'use strict';

import Platform from './platform';
import BasicPlatform from './platform.basic';
import DomPlatform from './platform.dom';

export {BasicPlatform, DomPlatform, Platform};

/**
 * @namespace Chart.platforms
 * @see https://chartjs.gitbooks.io/proposals/content/Platform.html
*/
export default {BasicPlatform, DomPlatform, Platform};
