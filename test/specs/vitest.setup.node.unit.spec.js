// Pins what test/setup.node.js and the `unit` project of vitest.config.js
// promise to the unit specs, `*.unit.spec.js`: each test fails when the setting
// it names is removed.
import Element from '../../src/core/core.element.js';

describe('Vitest setup in Node', function() {
  it('runs without a DOM', function() {
    // src/helpers/helpers.dom.ts and src/index.umd.ts take a `window` for a browser.
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('exposes Chart built from source', function() {
    expect(Chart.Element).toBe(Element);
    expect(Chart.registry.getController('line')).toBe(Chart.LineController);
  });

  it('compiles class fields as the build does', function() {
    // swc at es2022 keeps `x: number;` as an own property (vitest.config.js `oxc`).
    expect(Object.prototype.hasOwnProperty.call(new Chart.Element(), 'x')).toBe(true);
  });

  it('registers the Chart.js matchers', function() {
    expect({a: {b: 1}}).toEqualOptions({a: {b: 1}});
    expect(() => expect({a: 1}).toEqualOptions({a: 2})).toThrow();
    expect({x: 1.001, y: 2}).toBeCloseToPoint({x: 1, y: 2});
    expect(() => expect({x: 1, y: 2}).toBeCloseToPoint({x: 2, y: 2})).toThrow();
  });

  it('provides createMockContext, which records calls', function() {
    const ctx = createMockContext();
    ctx.fillRect(0, 0, 1, 1);
    expect(ctx.getCalls()).toEqual([{name: 'fillRect', args: [0, 0, 1, 1]}]);
  });

  it('disables the colors plugin', function() {
    expect(Chart.defaults.plugins.colors.enabled).toBe(false);
  });

  it('makes the chart helpers fail with a hint', function() {
    const hint = (name) => `${name} needs a browser: rename test/specs/vitest.setup.node.unit.spec.js to drop .unit from its name`;

    expect(() => acquireChart({type: 'line'})).toThrow(hint('acquireChart'));
    expect(() => releaseChart()).toThrow(hint('releaseChart'));
    expect(() => afterEvent()).toThrow(hint('afterEvent'));
    expect(() => waitForResize()).toThrow(hint('waitForResize'));
    expect(() => triggerMouseEvent()).toThrow(hint('triggerMouseEvent'));
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
