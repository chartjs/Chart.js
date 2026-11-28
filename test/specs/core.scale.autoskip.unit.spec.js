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

  describe('the number of labels that fit', function() {
    // A linear-like scale of `length` px over the values `start` to
    // `start + range`, with labels that need `tickSize` px each.
    function valueScale({start, range, length, tickSize, offset = false}) {
      return {
        options: {offset, ticks: {major: {enabled: false}}},
        _startValue: start,
        _valueRange: range,
        _length: length,
        _maxLength: length,
        _tickSize: () => tickSize
      };
    }

    // Ticks `stepSize` apart from `from` to `to`, both included.
    function valueTicks(from, to, stepSize) {
      const ticks = [];
      const count = Math.round(Math.abs(to - from) / stepSize);
      const sign = to < from ? -1 : 1;
      for (let i = 0; i <= count; i++) {
        ticks.push({value: from + sign * i * stepSize});
      }
      return ticks;
    }

    // The smallest distance in px between two kept ticks.
    function closest(scale, kept) {
      const pxPerValue = scale._length / scale._valueRange;
      let result = Infinity;
      for (let i = 1; i < kept.length; i++) {
        result = Math.min(result, Math.abs(kept[i].value - kept[i - 1].value) * pxPerValue);
      }
      return result;
    }

    it('should be counted over the part of the axis the ticks cover', function() {
      // 0..1000 at 600 px, ticks every 10 over 0..500, labels of 18 px plus 3 px padding.
      // Over the whole axis 28 would fit, every second tick: 12 px apart.
      const scale = valueScale({start: 0, range: 1000, length: 600, tickSize: 21});
      const kept = autoSkip(scale, valueTicks(0, 500, 10));

      expect(closest(scale, kept)).toBeGreaterThanOrEqual(21);
      // 300 px / 21 = 14.3: 15 labels fit, one tick in four is kept.
      expect(kept.map((tick) => tick.value)).toEqual(valueTicks(0, 480, 40).map((tick) => tick.value));
    });

    // Ticks `count` evenly over `from` to `to`.
    function evenTicks(count, from, to) {
      const ticks = [];
      for (let i = 0; i < count; i++) {
        ticks.push({value: from + (to - from) * i / (count - 1)});
      }
      return ticks;
    }

    it('should not count a label that only partly fits', function() {
      // 312 px / 21 = 14.9: 15 labels fit, not 16. One tick in five is kept.
      const scale = valueScale({start: 0, range: 1000, length: 600, tickSize: 21});
      const kept = autoSkip(scale, evenTicks(64, 0, 520));

      expect(kept.length).toBe(13);
      expect(closest(scale, kept)).toBeGreaterThanOrEqual(21);
    });

    it('should count the span from the first tick', function() {
      // 300 px / 20 = 15: 16 labels fit, one tick in four of 61. A span from
      // the second tick (294 px) fits 15, one tick in five.
      const scale = valueScale({start: 0, range: 1000, length: 600, tickSize: 20});

      expect(autoSkip(scale, evenTicks(61, 0, 500)).length).toBe(16);
    });

    it('should be counted the same when the ticks descend', function() {
      const scale = valueScale({start: 0, range: 1000, length: 600, tickSize: 21});
      const ascending = autoSkip(scale, valueTicks(0, 500, 10)).map((tick) => tick.value);
      const descending = autoSkip(scale, valueTicks(500, 0, 10)).map((tick) => tick.value);

      expect(descending.length).toBe(ascending.length);
      expect(closest(scale, autoSkip(scale, valueTicks(500, 0, 10)))).toBeGreaterThanOrEqual(21);
    });

    it('should be counted over the axis when the ticks cover all of it', function() {
      // 600 / 21 + 1 = 29.6, capped by the 600 px of the chart to 28.
      const scale = valueScale({start: 0, range: 1000, length: 600, tickSize: 21});
      const kept = autoSkip(scale, valueTicks(0, 1000, 10));

      expect(kept.map((tick) => tick.value)).toEqual(valueTicks(0, 1000, 40).map((tick) => tick.value));
    });

    it('should never be more than the axis length allows', function() {
      // Ticks past the ends of the axis do not make more room.
      const scale = valueScale({start: 0, range: 500, length: 600, tickSize: 21});
      const kept = autoSkip(scale, valueTicks(-500, 1000, 10));

      expect(kept.length).toBeLessThanOrEqual(28);
    });

    it('should count the labels that fill the span exactly', function() {
      // (0.3 - 0.2) / 0.1 is a hair below 1 in floating point: 1000 px fit
      // 10 labels of 100 px, 11 ticks.
      const scale = valueScale({start: 0.2, range: 0.1, length: 1000, tickSize: 100});
      scale._maxLength = 2000;
      const ticks = [];
      for (let i = 0; i <= 20; i++) {
        ticks.push({value: i === 20 ? 0.3 : 0.2 + i * 0.005});
      }

      expect(autoSkip(scale, ticks).length).toBe(11);
    });

    it('should map the tick values into the space of the value range', function() {
      // Decades, as a logarithmic scale counts them: 1..10 is one of two.
      const scale = valueScale({start: 0, range: 2, length: 600, tickSize: 21});
      scale._valueToAxis = Math.log10;
      const ticks = [];
      for (let i = 1; i <= 10; i += 0.25) {
        ticks.push({value: i});
      }

      // 300 px / 21 = 14.3: 15 labels fit. Without the map, 9 of 2 decades is past the axis.
      expect(autoSkip(scale, ticks).length).toBe(13);
    });

    it('should be counted over the axis when the labels have no size', function() {
      const scale = valueScale({start: 0, range: 1000, length: 600, tickSize: 0});

      expect(autoSkip(scale, valueTicks(0, 500, 10)).length).toBe(51);
      expect(autoSkip(scale, valueTicks(500, 500, 10)).length).toBe(1);
    });

    it('should keep a single tick', function() {
      const scale = valueScale({start: 0, range: 1000, length: 600, tickSize: 21});

      expect(autoSkip(scale, [{value: 500}]).map((tick) => tick.value)).toEqual([500]);
    });

    it('should keep no ticks of none', function() {
      const scale = valueScale({start: 0, range: 1000, length: 600, tickSize: 21});

      expect(autoSkip(scale, [])).toEqual([]);
    });

    it('should be counted over the axis when the span is not finite', function() {
      // A scale without a value range, as a time or radial scale may be.
      const scale = valueScale({start: undefined, range: undefined, length: 600, tickSize: 21});
      const kept = autoSkip(scale, valueTicks(0, 500, 10));

      expect(kept.length).toBe(26);
    });
  });

  describe('autoSkipKeepEnds', function() {
    // The values autoSkip keeps of `count` ticks with majors at `majors`, with
    // room for `fit` labels and `options` added to the tick options.
    function keptValues(count, majors, fit, options, descending = false) {
      const scale = scaleFitting(fit);
      scale.options.ticks = Object.assign({major: {enabled: majors.length > 0}}, options);
      const ticks = [];
      for (let i = 0; i < count; i++) {
        const value = descending ? count - 1 - i : i;
        ticks.push({value, major: majors.includes(value)});
      }
      return autoSkip(scale, ticks).map((tick) => tick.value);
    }

    it('should keep the last tick and drop the one before it beyond maxTicksLimit', function() {
      expect(keptValues(20, [], 100, {maxTicksLimit: 7, autoSkipKeepEnds: true}))
        .toEqual([0, 3, 6, 9, 12, 15, 19]);
    });

    it('should drop the tick before the last one when it is closer than one label', function() {
      // 50 / 10 = 5 ticks per label: 45 is 4 ticks from 49.
      expect(keptValues(50, [], 10, {autoSkipKeepEnds: true}))
        .toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 49]);
    });

    it('should keep the tick before the last one when a label fits between them', function() {
      // 129 px fit 12 whole labels: 99 / 12 = 8.25 ticks per label, a step of 9.
      // One label needs 99 / 12.9 = 7.7 ticks, and 90 is 8 ticks from 98: a shorter gap at the end.
      expect(keptValues(99, [], 12.9, {autoSkipKeepEnds: true}))
        .toEqual([0, 9, 18, 27, 36, 45, 54, 63, 72, 81, 90, 98]);
    });

    it('should keep the same ticks when off', function() {
      expect(keptValues(20, [], 100, {maxTicksLimit: 7})).toEqual([0, 3, 6, 9, 12, 15, 18]);
      expect(keptValues(20, [], 100, {maxTicksLimit: 7, autoSkipKeepEnds: false})).toEqual([0, 3, 6, 9, 12, 15, 18]);
      expect(keptValues(50, [], 10, {autoSkipKeepEnds: false})).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45]);
    });

    it('should keep the same ticks when the last one is kept anyway', function() {
      // 19 / 7 = 2.7, a step of 3 lands on 18.
      expect(keptValues(19, [], 100, {maxTicksLimit: 7, autoSkipKeepEnds: true}))
        .toEqual([0, 3, 6, 9, 12, 15, 18]);
    });

    it('should keep the last tick of descending ticks, the smallest value', function() {
      expect(keptValues(20, [], 100, {maxTicksLimit: 7, autoSkipKeepEnds: true}, true))
        .toEqual([19, 16, 13, 10, 7, 4, 0]);
    });

    it('should keep the last tick after the majors', function() {
      // 181 / 30 = 6 ticks per label: 172 is 8 ticks from 180, so both stay.
      const kept = keptValues(181, [0, 31, 59, 90, 120, 151], 30, {autoSkipKeepEnds: true});

      expect(kept.slice(-3)).toEqual([165, 172, 180]);
    });

    it('should drop a major that is closer than one label to the last tick', function() {
      // 33 / 10 = 3.3 ticks per label, a step of 5 from the majors 0 and 30.
      expect(keptValues(33, [0, 30], 10, {autoSkipKeepEnds: true})).toEqual([0, 5, 10, 15, 20, 25, 32]);
      expect(keptValues(33, [0, 30], 10, {})).toEqual([0, 5, 10, 15, 20, 25, 30]);
    });

    it('should keep the last tick when only some majors are kept', function() {
      // 50 majors with room for 10: every fifth major, and 99 in place of 90.
      const majors = [];
      for (let i = 0; i < 100; i += 2) {
        majors.push(i);
      }
      expect(keptValues(100, majors, 10, {autoSkipKeepEnds: true})).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 99]);
    });
  });
});
