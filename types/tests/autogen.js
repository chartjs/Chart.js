import * as fs from 'fs';
import * as path from 'path';
import * as helpers from '../../src/helpers/index.js';

const fn = path.resolve(__dirname, 'autogen_helpers.ts');
const fd = fs.openSync(fn, 'w+');
fs.writeSync(fd, 'import * as helpers from \'../helpers\';\n\n');

fs.writeSync(fd, 'const testKeys = [];\n');
for (const key of Object.keys(helpers)) {
  if (key[0] !== '_' && typeof helpers[key] === 'function') {
    fs.writeSync(fd, `testKeys.push(helpers.${key});\n`);
  }
}
