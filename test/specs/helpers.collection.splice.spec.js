import {listenArrayEvents, unlistenArrayEvents} from '../../src/helpers/helpers.collection.js';

describe('splice array notifications', function() {
  it('keeps an argument-free splice a no-op', function() {
    const data = [1, 2, 3];
    const listener = {_onDataSplice: vi.fn()};
    listenArrayEvents(data, listener);

    expect(data.splice()).toEqual([]);
    expect(data).toEqual([1, 2, 3]);
    expect(listener._onDataSplice).toHaveBeenCalledWith();

    unlistenArrayEvents(data, listener);
  });

  it('notifies listeners of the effective range when deleteCount is omitted', function() {
    const data = [1, 2, 3];
    const listener = {_onDataSplice: vi.fn()};
    listenArrayEvents(data, listener);

    expect(data.splice(-2)).toEqual([2, 3]);
    expect(data).toEqual([1]);
    expect(listener._onDataSplice).toHaveBeenCalledWith(1, 2);

    unlistenArrayEvents(data, listener);
  });

  it('converts the start only once and notifies every listener after the mutation', function() {
    const data = [1, 2, 3];
    const start = {valueOf: vi.fn(() => -1)};
    const listener = {_onDataSplice: vi.fn(() => expect(data).toEqual([1, 2, 4]))};
    const other = {_onDataSplice: vi.fn()};
    listenArrayEvents(data, listener);
    listenArrayEvents(data, other);

    expect(data.splice(start, Infinity, 4)).toEqual([3]);
    expect(start.valueOf).toHaveBeenCalledTimes(1);
    expect(listener._onDataSplice).toHaveBeenCalledWith(2, 1, 4);
    expect(other._onDataSplice).toHaveBeenCalledWith(2, 1, 4);

    unlistenArrayEvents(data, listener);
    unlistenArrayEvents(data, other);
  });

  it('uses the length from before start conversion even when conversion mutates the array', function() {
    const data = [1, 2, 3];
    const listener = {_onDataSplice: vi.fn()};
    listenArrayEvents(data, listener);
    const start = {valueOf() {
      data.push(4);
      return -1;
    }};

    expect(data.splice(start)).toEqual([3]);
    expect(data).toEqual([1, 2]);
    expect(listener._onDataSplice).toHaveBeenCalledWith(2, 1);

    unlistenArrayEvents(data, listener);
  });

  it('uses the native deletion count when conversion changes the array length', function() {
    const data = [1, 2, 3];
    const listener = {_onDataSplice: vi.fn()};
    const count = {valueOf: vi.fn(() => {
      data.push(4);
      return Infinity;
    })};
    listenArrayEvents(data, listener);

    expect(data.splice(1, count)).toEqual([2, 3]);
    expect(data).toEqual([1]);
    expect(count.valueOf).toHaveBeenCalledTimes(1);
    expect(listener._onDataSplice).toHaveBeenCalledWith(1, 2);

    unlistenArrayEvents(data, listener);
  });

  describe.each(['native', 'replaced'])('%s splice', function(implementation) {
    it.each([
      {name: 'undefined start', args: [undefined, 0, 4], effective: [0, 0, 4]},
      {name: 'negative start', args: [-1, 0, 4], effective: [2, 0, 4]},
      {name: 'negative count', args: [1, -1], effective: [1, 0]},
      {name: 'unbounded count', args: [1, Infinity], effective: [1, 2]},
      {name: 'explicitly undefined count', args: [1, undefined], effective: [1, 0]},
      {name: 'omitted count', args: [1], effective: [1, 2]},
    ])('normalizes $name', function({args, effective}) {
      const data = [1, 2, 3];
      const expected = data.slice();
      const removed = expected.splice(...args);
      const base = implementation === 'replaced' ? vi.fn(Array.prototype.splice) : Array.prototype.splice;
      if (implementation === 'replaced') {
        data.splice = base;
      }
      const listener = {_onDataSplice: vi.fn()};
      listenArrayEvents(data, listener);

      expect(data.splice(...args)).toEqual(removed);
      expect(data).toEqual(expected);
      expect(listener._onDataSplice).toHaveBeenCalledWith(...effective);
      if (implementation === 'replaced') {
        expect(base).toHaveBeenCalledWith(...effective);
      }

      unlistenArrayEvents(data, listener);
    });
  });
});
