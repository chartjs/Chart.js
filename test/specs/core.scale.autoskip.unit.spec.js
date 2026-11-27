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

  it('should try the largest proper factor of the major spacing', function() {
    // 120 / 40 = 3 ticks per label; of the factors 1, 2 and 5 of 10, 5 is the first above it.
    const kept = keptTicks(120, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110], 40);

    expect(kept[0]).toBe(0);
    expect(new Set(gaps(kept))).toEqual(new Set([5]));
  });

  // 181 / 30 = 6.03, so a whole step of 7 is repeated from each major. 28 is
  // dropped: it is closer than 7 to the major at 31.
  it('should repeat the same whole step from each of unevenly spaced majors', function() {
    expect(keptTicks(181, [0, 31, 59, 90, 120, 151], 30)).toEqual([
      0, 7, 14, 21,
      31, 38, 45, 52,
      59, 66, 73, 80,
      90, 97, 104, 111,
      120, 127, 134, 141,
      151, 158, 165, 172
    ]);
  });

  it('should step back from the first major and forward from a single major', function() {
    // One major: no major spacing; 60 / 10 = 6 ticks per label, counted from 25.
    expect(keptTicks(60, [25], 10)).toEqual([1, 7, 13, 19, 25, 31, 37, 43, 49]);
  });

  // Unevenly spaced majors are not divided by a factor: 120 / 30 = 4 ticks per
  // label, repeated from each major.
  it('should not treat majors as evenly spaced when only the second gap differs', function() {
    expect(keptTicks(120, [0, 30, 61, 91], 30)).toEqual([
      0, 4, 8, 12, 16, 20, 24,
      30, 34, 38, 42, 46, 50, 54,
      61, 65, 69, 73, 77, 81, 85,
      91, 95, 99, 103, 107, 111, 115
    ]);
  });

  it('should not treat majors as evenly spaced when only the last gap is wider', function() {
    expect(keptTicks(120, [0, 30, 60, 91], 30)).toEqual([
      0, 4, 8, 12, 16, 20, 24,
      30, 34, 38, 42, 46, 50, 54,
      60, 64, 68, 72, 76, 80, 84,
      91, 95, 99, 103, 107, 111, 115
    ]);
  });
});
