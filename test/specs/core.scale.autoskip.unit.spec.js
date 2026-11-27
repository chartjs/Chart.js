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

  // The same, with the ticks in descending order as a reversed axis builds them.
  function keptTicksReversed(count, majors, fit) {
    const ticks = [];
    for (let i = count - 1; i >= 0; i--) {
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
    expect(keptTicks(60, [25], 10)).toEqual([1, 7, 13, 19, 25, 31, 37, 43, 49, 55]);
  });

  it('should run to the last tick after a single major', function() {
    // 40 / 7 = 5.7: a step of 6, and no major after 0 to stop before.
    expect(keptTicks(40, [0], 7)).toEqual([0, 6, 12, 18, 24, 30, 36]);
    // 37 / 7 = 5.3: a step of 6 lands on the last tick, 36.
    expect(keptTicks(37, [0], 7)).toEqual([0, 6, 12, 18, 24, 30, 36]);
  });

  it('should assume majors at the average spacing around two majors', function() {
    // 50 / 8 = 6.25: a step of 7. The majors before 10 and after 20 are assumed
    // at 0 and 30, so 3 is kept and nothing after 20.
    expect(keptTicks(50, [10, 20], 8)).toEqual([3, 10, 20]);
  });

  it('should round an average major spacing below one half down', function() {
    // (72 - 20) / 5 = 10.4 is rounded to 10: majors assumed at 10 and 82.
    const kept = keptTicks(90, [20, 30, 41, 51, 62, 72], 90);

    expect(kept[0]).toBe(10);
    expect(kept[kept.length - 1]).toBe(81);
  });

  it('should keep the reverse of the ascending result when the ticks descend', function() {
    const majors = [0, 31, 59, 90, 120, 151];

    expect(keptTicksReversed(181, majors, 30)).toEqual(keptTicks(181, majors, 30).reverse());
    expect(keptTicksReversed(60, [25], 10)).toEqual(keptTicks(60, [25], 10).reverse());
  });

  it('should walk ticks without numeric values in the order given', function() {
    // String values are not compared: the step counts from the first major in the array.
    const ticks = [];
    for (let i = 0; i < 40; i++) {
      ticks.push({value: String.fromCharCode(122 - i), major: i === 0 || i === 13});
    }
    const kept = autoSkip(scaleFitting(10), ticks).map((tick) => ticks.indexOf(tick));

    expect(kept).toEqual([0, 4, 8, 13, 17, 21]);
  });

  it('should keep a major that is closer than one step to the next major', function() {
    // 40 / 10 = 4 ticks per label, but 0 and 3 are both majors.
    expect(keptTicks(40, [0, 3, 20], 10)).toEqual([0, 3, 7, 11, 15, 20, 24]);
  });

  it('should keep the ticks around the majors within one major spacing', function() {
    // Majors 10 apart: nothing is kept before 20 or from 60 on.
    expect(keptTicks(80, [30, 40, 50], 20)).toEqual([20, 25, 30, 35, 40, 45, 50, 55]);
  });

  it('should take a factor larger than the ticks per label, not equal to it', function() {
    // 120 / 60 = 2 ticks per label; of the factors 1, 2, 3, 4 and 6 of 12, 3 is taken.
    const kept = keptTicks(120, [0, 12, 24, 36, 48, 60, 72, 84, 96, 108], 60);

    expect(new Set(gaps(kept))).toEqual(new Set([3]));
  });

  it('should keep no tick past the last one when the next major would be beyond it', function() {
    expect(keptTicks(40, [0, 30], 10)).toEqual([0, 5, 10, 15, 20, 25, 30, 35]);
  });

  it('should round the average major spacing', function() {
    // (32 - 11) / 2 = 10.5 is rounded to 11, so the ticks from 0 are kept.
    const kept = keptTicks(40, [11, 21, 32], 40);

    expect(kept[0]).toBe(0);
    expect(kept.length).toBe(40);
  });

  it('should keep every step-th tick up to the last one without majors', function() {
    // 7 / 3 = 2.33 ticks per label: a step of 3.
    expect(keptTicks(7, [], 3)).toEqual([0, 3, 6]);
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
