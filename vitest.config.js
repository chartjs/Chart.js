import {readdirSync} from 'node:fs';
import {sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createSaveFixtureImage} from 'chartjs-test-utils/node';
import {defineConfig} from 'vitest/config';
import {browserProvider, commonjsFixtures, viewport} from './test/vitest.shared.js';

// `pnpm run fixtures:update`: write the reference images that are missing or
// differ, rendered by Chromium. Without the command a fixture never writes.
const updating = process.env.UPDATE_FIXTURES === '1';

// Specs are named `*.spec.js`. A `*.tests.js` file is a Jasmine spec from
// before the move to Vitest; no runner picks it up, so stop instead of letting
// it pass unnoticed.
const specsDir = fileURLToPath(new URL('./test/specs', import.meta.url));
const unconverted = readdirSync(specsDir, {recursive: true})
  .filter((file) => file.endsWith('.tests.js'))
  .map((file) => `test/specs/${file.split(sep).join('/')}`);

if (unconverted.length) {
  throw new Error(
    `Rename and convert these Jasmine specs to Vitest (*.spec.js), see "Converting a Jasmine spec" in docs/developers/contributing.md:\n  ${unconverted.join('\n  ')}`
  );
}

export default defineConfig({
  plugins: [commonjsFixtures()],
  resolve: {
    alias: {
      // chartjs-adapter-moment imports 'chart.js'; point it at the same source
      // modules the specs use, so the adapter registers on them.
      'chart.js': fileURLToPath(new URL('./src/index.ts', import.meta.url))
    }
  },
  // Compile like rollup.config.js does (swc, es2022): class fields declared
  // without an initializer stay own properties. Vite would otherwise follow
  // tsconfig.json's ES6 target and drop them.
  oxc: {
    target: 'es2022',
    tsconfig: {compilerOptions: {target: 'es2022', useDefineForClassFields: true}}
  },
  optimizeDeps: {
    // Pre-bundling would give the adapter its own copy of chart.js.
    exclude: ['chartjs-adapter-moment'],
    // The browser imports the istanbul coverage module, which Vitest leaves out
    // of pre-bundling. When node_modules lies outside the project root (a git
    // worktree sharing another checkout's install), Vite refuses to serve it
    // and coverage fails while the tests pass.
    //
    // moment: the excluded adapter imports it, so it would be served on its
    // own while moment-timezone's pre-bundle carries another copy. The adapter
    // would then format dates in the machine's time zone instead of the
    // default zone test/setup.js sets; pre-bundling it shares one instance.
    include: ['@vitest/coverage-istanbul/browser', 'moment']
  },
  test: {
    browser: {
      enabled: true,
      instances: updating ? [{browser: 'chromium'}] : [{browser: 'chromium'}, {browser: 'firefox'}],
      commands: updating ? {saveFixtureImage: createSaveFixtureImage()} : {},
      provider: browserProvider,
      viewport
    },
    // Istanbul, not v8: v8 coverage is refused once a non-Chromium browser is
    // configured. The Coveralls step in .github/workflows/ci.yml uploads
    // coverage/vitest/lcov.info.
    coverage: {
      provider: 'istanbul',
      include: ['src/**'],
      // Type declarations only; they have no code to cover and cannot be loaded.
      exclude: ['src/types.ts', 'src/types/**'],
      reporter: ['lcov', 'html', 'text-summary'],
      reportsDirectory: 'coverage/vitest'
    },
    // One spec file at a time: animation and resize specs need a page that is
    // not throttled.
    fileParallelism: false,
    globals: true,
    include: ['test/specs/**/*.spec.js'],
    // Spies never leak from one test into the next.
    restoreMocks: true,
    // Random order, so that specs cannot depend on each other; the seed is
    // printed and can be replayed with --sequence.seed=<seed>.
    sequence: {shuffle: true},
    setupFiles: ['test/setup.js']
  }
});
