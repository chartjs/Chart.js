import { _attachContext, _createResolver } from '../../../src/helpers/helpers.config.js';

const options = _attachContext(_createResolver([{ color: 'red', hoverColor: 'blue' }]), { index: 0 });

// One argument, as before prefixes could be given
const withContext = options.setContext({ index: 1 });
const overridden = options.override({ color: 'green' });

// Prefixes are the optional second argument of setContext
const hovered = options.setContext({ index: 1 }, ['hover', '']);

const colors: unknown[] = [withContext.color, overridden.color, hovered.color];

// @ts-expect-error override takes no prefixes
options.override({ color: 'green' }, ['hover', '']);
