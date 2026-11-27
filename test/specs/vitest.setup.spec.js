// Pins what test/setup.js and the `browser` project of vitest.config.js promise
// to the browser specs: each test fails when the setting it names is removed.
// test/specs/vitest.setup.node.unit.spec.js pins the unit specs' setup in Node.
import * as controllers from '../../src/controllers/index.js';
import * as elements from '../../src/elements/index.js';
import * as plugins from '../../src/plugins/index.js';
import * as scales from '../../src/scales/index.js';

describe('Vitest setup', function() {
  it('renders into a 1024x768 viewport', function() {
    expect([window.innerWidth, window.innerHeight]).toEqual([1024, 768]);
  });

  it('pins window.devicePixelRatio to 1', function() {
    // Assigning replaces the browser's getter with a plain value.
    expect(Object.getOwnPropertyDescriptor(window, 'devicePixelRatio')).toEqual(expect.objectContaining({value: 1}));
  });

  it('exposes moment as a global, in UTC', function() {
    expect(window.moment).toBe(moment);
    expect(moment.defaultZone && moment.defaultZone.name).toBe('Etc/UTC');
    expect(moment().format('Z')).toBe('+00:00');
  });

  it('registers the moment date adapter', function() {
    expect(new Chart._adapters._date().formats()).toEqual(expect.objectContaining({datetime: 'MMM D, YYYY, h:mm:ss a'}));
  });

  it('formats dates in the default zone of moment-timezone', function() {
    // The adapter and the global must share one moment instance (vitest.config.js
    // `optimizeDeps`). A zone other than UTC tells the two apart on any machine,
    // including one whose clock is set to UTC.
    moment.tz.setDefault('Etc/GMT-5');
    try {
      expect(new Chart._adapters._date().format(Date.UTC(2015, 0, 1, 12), 'H')).toBe('17');
    } finally {
      moment.tz.setDefault('Etc/UTC');
    }
  });

  it('disables the colors plugin', function() {
    expect(Chart.defaults.plugins.colors.enabled).toBe(false);
  });

  it('registers every built-in controller, element, plugin and scale', function() {
    const registered = (registry, namespace) => Object.values(namespace).filter((item) => registry.get(item.id) !== item);

    expect(registered(Chart.registry.controllers, controllers)).toEqual([]);
    expect(registered(Chart.registry.elements, elements)).toEqual([]);
    expect(registered(Chart.registry.plugins, plugins)).toEqual([]);
    expect(registered(Chart.registry.scales, scales)).toEqual([]);
  });

  it('compiles class fields as the build does', function() {
    // swc at es2022 keeps `x: number;` as an own property (vitest.config.js `oxc`).
    expect(Object.prototype.hasOwnProperty.call(new Chart.Element(), 'x')).toBe(true);
  });

  describe('restoreMocks', {shuffle: false}, function() {
    const target = {
      method() {
        return 'original';
      }
    };

    it('lets a spec replace a method', function() {
      vi.spyOn(target, 'method').mockReturnValue('mocked');
      expect(target.method()).toBe('mocked');
    });

    it('restores it before the next spec', function() {
      expect(vi.isMockFunction(target.method)).toBe(false);
      expect(target.method()).toBe('original');
    });
  });
});
