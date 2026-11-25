// Smoke suite for the built bundle: test/setup.umd.js loads
// dist/chart.umd.min.js with a script tag, so `Chart` here is what a page that
// includes the bundle gets, not the source modules the main suite imports.
import {createFixtures} from 'chartjs-test-utils';

const controllers = {
  bar: 'BarController',
  bubble: 'BubbleController',
  doughnut: 'DoughnutController',
  line: 'LineController',
  pie: 'PieController',
  polarArea: 'PolarAreaController',
  radar: 'RadarController',
  scatter: 'ScatterController'
};

const scales = {
  category: 'CategoryScale',
  linear: 'LinearScale',
  logarithmic: 'LogarithmicScale',
  radialLinear: 'RadialLinearScale',
  time: 'TimeScale',
  timeseries: 'TimeSeriesScale'
};

const elements = {
  arc: 'ArcElement',
  bar: 'BarElement',
  line: 'LineElement',
  point: 'PointElement'
};

const plugins = {
  colors: 'Colors',
  decimation: 'Decimation',
  filler: 'Filler',
  legend: 'Legend',
  subtitle: 'SubTitle',
  title: 'Title',
  tooltip: 'Tooltip'
};

describe('Chart namespace of the UMD bundle', () => {
  it('is the global set by the bundle', () => {
    expect(typeof Chart).toBe('function');
    expect(Chart.Chart).toBe(Chart);
  });

  it('has the core members', () => {
    for (const name of ['Animation', 'Animations', 'DatasetController', 'Element', 'Scale']) {
      expect(typeof Chart[name], name).toBe('function');
    }
    for (const name of ['_adapters', 'animator', 'defaults', 'helpers', 'Interaction', 'layouts', 'registry', 'Ticks']) {
      expect(Chart[name], name).toBeInstanceOf(Object);
    }
    for (const name of ['BasePlatform', 'BasicPlatform', 'DomPlatform']) {
      expect(typeof Chart.platforms[name], name).toBe('function');
      expect(Chart[name], name).toBe(Chart.platforms[name]);
    }
    expect(Chart.controllers).toBe(Chart.registry.controllers.items);
  });

  it('has the helpers', () => {
    for (const name of ['color', 'getRelativePosition', 'isArray', 'merge', 'resolve', 'toPadding']) {
      expect(typeof Chart.helpers[name], name).toBe('function');
    }
  });

  it('registers every controller', () => {
    for (const [id, name] of Object.entries(controllers)) {
      expect(Chart.registry.getController(id), id).toBe(Chart[name]);
      expect(Chart.controllers[id], id).toBe(Chart[name]);
    }
  });

  it('registers every scale', () => {
    for (const [id, name] of Object.entries(scales)) {
      expect(Chart.registry.getScale(id), id).toBe(Chart[name]);
    }
  });

  it('registers every element', () => {
    for (const [id, name] of Object.entries(elements)) {
      expect(Chart.registry.getElement(id), id).toBe(Chart[name]);
      expect(Chart.elements[name], name).toBe(Chart[name]);
    }
  });

  it('registers every plugin', () => {
    for (const [id, name] of Object.entries(plugins)) {
      expect(Chart.registry.getPlugin(id), id).toBe(Chart[name]);
    }
  });
});

// One fixture per controller, one filler, one legend and one that drives the
// chart with mouse events. None uses a time scale: that needs the date adapter,
// which the bundle does not include. Each pattern matches the fixture's config
// and its reference image, whose default import is its URL.
const files = import.meta.glob([
  '../fixtures/controller.bar/backgroundColor/scriptable.*',
  '../fixtures/controller.bubble/radius-data.*',
  '../fixtures/controller.doughnut/doughnut-rotation-300.*',
  '../fixtures/controller.doughnut/pie-offset.*',
  '../fixtures/controller.line/fill/order.*',
  '../fixtures/controller.polarArea/parse-object-data.*',
  '../fixtures/controller.radar/point-style.*',
  '../fixtures/controller.scatter/showLine/true.*',
  '../fixtures/plugin.filler/line/stack-multiple-scales.*',
  '../fixtures/plugin.legend/legend-doughnut-right-center-single.*',
  '../fixtures/core.interaction/nearest-partial-bar.*'
], {eager: true, import: 'default'});

const configs = {};
const images = {};
for (const [path, value] of Object.entries(files)) {
  if (path.endsWith('.png')) {
    images[path] = value;
  } else {
    configs[path] = value;
  }
}

const specsFromFixtures = createFixtures({configs, images, prefix: '../fixtures/'});

describe('Fixtures rendered by the UMD bundle', specsFromFixtures());

// A pattern that matches nothing would drop its fixture without an error.
it('finds every listed fixture', () => {
  expect(Object.keys(configs)).toHaveLength(11);
  expect(Object.keys(images)).toHaveLength(11);
});
