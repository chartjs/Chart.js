import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as helpers from '../../dist/helpers.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

let fd;

try {
  const fn = path.resolve(__dirname, 'autogen_helpers.ts');
  fd = fs.openSync(fn, 'w+');
  fs.writeSync(fd, 'import * as helpers from \'../../dist/helpers/index.js\';\n\n');

  fs.writeSync(fd, 'const testKeys: unknown[] = [];\n');
  for (const key of Object.keys(helpers)) {
    if (key[0] !== '_' && typeof helpers[key] === 'function') {
      fs.writeSync(fd, `testKeys.push(helpers.${key});\n`);
    }
  }
} finally {
  if (fd !== undefined) {
    fs.closeSync(fd);
  }
}
