import {autoSkip} from '../../src/core/core.scale.autoskip.js';

describe('Core.scale.autoskip', function() {
  // A scale with room for `fit` labels of 10 px each.
  function scaleFitting(fit) {
    return {
      options: {offset: true, ticks: {major: {enabled: true}}},
      _length: fit * 10,
      _maxLength: fit * 10,
      _tickSize: () => 10
    };
  }

  // The values autoSkip keeps of `count` ticks with majors at `majors`.
  function keptTicks(count, majors, fit) {
    const ticks = [];
    for (let i = 0; i < count; i++) {
      ticks.push({value: i, major: majors.includes(i)});
    }
    return autoSkip(scaleFitting(fit), ticks).map((tick) => tick.value);
  }

  function gaps(indices) {
    const result = [];
    for (let i = 1; i < indices.length; i++) {
      result.push(indices[i] - indices[i - 1]);
    }
    return result;
  }

  it('should divide evenly spaced majors into even steps when the first major is the first tick', function() {
    const kept = keptTicks(120, [0, 30, 60, 90], 30);

    expect(kept[0]).toBe(0);
    expect(new Set(gaps(kept))).toEqual(new Set([5]));
  });

  it('should divide two majors into even steps when the first major is the first tick', function() {
    const kept = keptTicks(120, [0, 30], 30);

    expect(kept[0]).toBe(0);
    expect(new Set(gaps(kept))).toEqual(new Set([5]));
  });

  // Unevenly spaced majors fall back to 120 / 30 = 4 ticks per label, stretched
  // to fit each gap between majors.
  it('should not treat majors as evenly spaced when only the second gap differs', function() {
    expect(keptTicks(120, [0, 30, 61, 91], 30)).toEqual([
      0, 4, 9, 13, 17, 21, 26,
      30, 34, 39, 43, 48, 52, 57,
      61, 65, 70, 74, 78, 82, 87,
      91, 95, 100, 104, 108, 112, 117
    ]);
  });

  it('should not treat majors as evenly spaced when only the last gap is wider', function() {
    expect(keptTicks(120, [0, 30, 60, 91], 30)).toEqual([
      0, 4, 9, 13, 17, 21, 26,
      30, 34, 39, 43, 47, 51, 56,
      60, 64, 69, 73, 78, 82, 87,
      91, 95, 100, 104, 108, 112, 117
    ]);
  });
});
