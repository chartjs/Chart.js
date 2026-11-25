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

  it('clamps the delete count to the remaining length', function() {
    const data = [1, 2, 3];
    const listener = {_onDataSplice: vi.fn()};
    listenArrayEvents(data, listener);

    expect(data.splice(-1, Infinity, 4)).toEqual([3]);
    expect(listener._onDataSplice).toHaveBeenCalledWith(2, 1, 4);
    expect(data).toEqual([1, 2, 4]);

    unlistenArrayEvents(data, listener);
  });

  it('passes the same normalized arguments to a custom splice and its listeners', function() {
    const data = [1, 2, 3];
    const splice = vi.fn(function(...args) {
      expect(typeof args[0]).toBe('number');
      return Array.prototype.splice.apply(this, args);
    });
    data.splice = splice;
    const listener = {_onDataSplice: vi.fn()};
    listenArrayEvents(data, listener);

    expect(data.splice(-1, 0, 4)).toEqual([]);
    expect(splice).toHaveBeenCalledWith(2, 0, 4);
    expect(listener._onDataSplice).toHaveBeenCalledWith(2, 0, 4);
    expect(data).toEqual([1, 2, 4, 3]);

    unlistenArrayEvents(data, listener);
  });
});
