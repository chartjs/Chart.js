import {existsSync} from 'node:fs';
import {defineConfig} from 'vitest/config';
import {browserProvider, commonjsFixtures, viewport} from './test/vitest.shared.js';

// Smoke suite for the built bundle: test/umd/*.spec.js run against
// dist/chart.umd.min.js, which test/setup.umd.js loads with a script tag. It
// takes only the shared parts from test/vitest.shared.js, so it never inherits
// the main config's alias to src/ or test/setup.js.
const bundle = 'dist/chart.umd.min.js';

if (!existsSync(new URL(bundle, import.meta.url))) {
  throw new Error(`${bundle} not found: run \`pnpm run build\` first, the smoke suite tests the built bundle.`);
}

// No coverage: the bundle is minified, and the main suite measures the source.
export default defineConfig({
  plugins: [commonjsFixtures()],
  test: {
    browser: {
      enabled: true,
      instances: [{browser: 'chromium'}, {browser: 'firefox'}],
      provider: browserProvider,
      viewport
    },
    fileParallelism: false,
    globals: true,
    include: ['test/umd/**/*.spec.js'],
    restoreMocks: true,
    sequence: {shuffle: true},
    setupFiles: ['test/setup.umd.js']
  }
});
