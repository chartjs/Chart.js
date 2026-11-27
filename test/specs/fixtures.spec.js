// Every image fixture under test/fixtures: a config (`.js` or `.json`) and the
// reference image of the same base name. One describe per top-level fixture
// directory, so `-t controller.bar` runs that directory's fixtures; a new
// directory runs without any line added here.
import {createFixtures} from 'chartjs-test-utils';

const prefix = '../fixtures/';

const configs = {
  ...import.meta.glob('../fixtures/**/*.js', {eager: true, import: 'default'}),
  ...import.meta.glob('../fixtures/**/*.json', {eager: true, import: 'default'})
};

const specsFromFixtures = createFixtures({
  configs,
  images: import.meta.glob('../fixtures/**/*.png', {eager: true, import: 'default', query: '?url'}),
  prefix
});

const directories = [...new Set(Object.keys(configs).map((path) => path.slice(prefix.length).split('/')[0]))].sort();

for (const directory of directories) {
  describe(directory, specsFromFixtures(directory));
}
