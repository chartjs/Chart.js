function getLabels(scale) {
  return scale.ticks.map(t => t.label);
}

function getValues(scale) {
  return scale.ticks.map(t => t.value);
}

// One point per value, placed on the symlog axis (`axis`) and spread along the other one
function points(values, axis) {
  return values.map((v, i) => (axis === 'y' ? {x: i, y: v} : {x: v, y: i}));
}

function createChart(axis, values, scaleOptions, type, size) {
  return window.acquireChart({
    type: type || 'scatter',
    data: {
      labels: values.map((v, i) => i),
      datasets: [{
        data: type && type !== 'scatter' ? values : points(values, axis)
      }]
    },
    options: {
      scales: {
        [axis]: Object.assign({type: 'symlog'}, scaleOptions)
      }
    }
  }, {
    canvas: size || {width: 600, height: 400}
  });
}

// Pixel where the axis starts (min when not reversed) and ends
function axisEnds(chart, axis) {
  const area = chart.chartArea;
  return axis === 'y' ? {start: area.bottom, end: area.top} : {start: area.left, end: area.right};
}

// Smallest gap in pixels between neighbouring tick labels along the axis
function minLabelGap(scale) {
  const ctx = scale.ctx;
  const font = Chart.helpers.toFont(scale.options.ticks.font);
  ctx.save();
  ctx.font = font.string;
  const boxes = scale.ticks.map((tick, i) => {
    const pixel = scale.getPixelForTick(i);
    const size = scale.isHorizontal() ? ctx.measureText(tick.label).width : font.lineHeight;
    return [pixel - size / 2, pixel + size / 2];
  }).sort((a, b) => a[0] - b[0]);
  ctx.restore();
  let gap = Infinity;
  for (let i = 1; i < boxes.length; i++) {
    gap = Math.min(gap, boxes[i][0] - boxes[i - 1][1]);
  }
  return gap;
}

function expectCloseTo(actual, expected) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(Math.abs(expected) * 1e-9 + 1e-9);
}

const viralLoad = [0, 0, 35, 0, 120, 4200, 87000, 2.3e6, 6.1e7, 1e8];
const changeFromBaseline = viralLoad.map(v => v - 4200);

describe('Symlog Scale tests', function() {
  describe('auto', jasmine.fixture.specs('scale.symlog'));

  it('should register', function() {
    var Constructor = Chart.registry.getScale('symlog');
    expect(Constructor).not.toBe(undefined);
    expect(typeof Constructor).toBe('function');
  });

  it('should have the correct default config', function() {
    var defaultConfig = Chart.defaults.scales.symlog;
    expect(defaultConfig).toEqual({
      linearThreshold: 1,
      ticks: {
        callback: Chart.Ticks.formatters.symlog
      }
    });
    expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
  });

  it('should not register or change the linear and logarithmic scales', function() {
    expect(Chart.registry.getScale('symlog')).not.toBe(Chart.registry.getScale('linear'));
    expect(Chart.defaults.scales.linear.ticks.callback).toBe(Chart.Ticks.formatters.numeric);
    expect(Chart.defaults.scales.logarithmic.ticks.callback).toBe(Chart.Ticks.formatters.logarithmic);
  });

  describe('data limits', function() {
    it('should include negative values and zero', function() {
      var chart = createChart('y', [-4200, 0, 35, 1.2e8], {bounds: 'data'});
      expect(chart.scales.y.min).toBe(-4200);
      expect(chart.scales.y.max).toBe(1.2e8);
    });

    it('should round the ends outward with bounds: ticks', function() {
      var chart = createChart('y', [-4200, 0, 35, 1.2e8]);
      expect(chart.scales.y.min).toBe(-5000);
      expect(chart.scales.y.max).toBe(2e8);
    });

    it('should parse string data', function() {
      var chart = createChart('y', ['-4200', '0', '35', '120000000'], {bounds: 'data'});
      expect(chart.scales.y.min).toBe(-4200);
      expect(chart.scales.y.max).toBe(1.2e8);
    });

    it('should ignore hidden datasets', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [-10, 0, 10]}, {data: [-1e6, 0, 1e6], hidden: true}]
        },
        options: {scales: {y: {type: 'symlog', bounds: 'data'}}}
      });
      expect(chart.scales.y.min).toBe(-10);
      expect(chart.scales.y.max).toBe(10);
    });

    it('should stack positive and negative values', function() {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          labels: ['a', 'b'],
          datasets: [{data: [100, -100]}, {data: [1e4, -1e4]}]
        },
        options: {scales: {x: {stacked: true}, y: {type: 'symlog', stacked: true, bounds: 'data'}}}
      });
      expect(chart.scales.y.min).toBe(-10100);
      expect(chart.scales.y.max).toBe(10100);
    });
  });

  ['y', 'x'].forEach(function(axis) {
    describe('positions on the ' + axis + ' axis', function() {
      it('should map the ends of the axis to the edges of the chart area', function() {
        var chart = createChart(axis, changeFromBaseline);
        var scale = chart.scales[axis];
        var ends = axisEnds(chart, axis);

        expect(scale.getPixelForValue(scale.min)).toBeCloseToPixel(ends.start);
        expect(scale.getPixelForValue(scale.max)).toBeCloseToPixel(ends.end);
        expectCloseTo(scale.getValueForPixel(scale.getPixelForValue(scale.min)), scale.min);
        expectCloseTo(scale.getValueForPixel(scale.getPixelForValue(scale.max)), scale.max);
      });

      it('should place negative values, zero and positive values in order', function() {
        var chart = createChart(axis, [-5e6, -3000, -12, 0, 7, 400, 2e5, 9e7]);
        var meta = chart.getDatasetMeta(0);
        var pixels = meta.data.map(p => p[axis]);
        var direction = axis === 'y' ? -1 : 1;

        meta.data.forEach(function(point) {
          expect(point.skip).toBe(false);
          expect(isFinite(point[axis])).toBe(true);
        });
        for (var i = 1; i < pixels.length; i++) {
          expect((pixels[i] - pixels[i - 1]) * direction).toBeGreaterThan(0);
        }
      });

      it('should put zero in the middle of a symmetric range and mirror values around it', function() {
        var chart = createChart(axis, [-1e8, 0, 1e8]);
        var scale = chart.scales[axis];
        var ends = axisEnds(chart, axis);
        var middle = (ends.start + ends.end) / 2;

        expect(scale.getPixelForValue(0)).toBeCloseToPixel(middle);
        [1, 10, 1000, 1e6].forEach(function(value) {
          var above = scale.getPixelForValue(value) - middle;
          var below = scale.getPixelForValue(-value) - middle;
          expect(Math.abs(above + below)).toBeLessThan(0.5);
        });
      });

      it('should give each order of magnitude the same space far from zero', function() {
        var chart = createChart(axis, [-1e8, 0, 1e8]);
        var scale = chart.scales[axis];
        var decade = scale.getPixelForValue(1e4) - scale.getPixelForValue(1e3);

        [1e4, 1e5, 1e6, 1e7].forEach(function(value) {
          expect(scale.getPixelForValue(value * 10) - scale.getPixelForValue(value)).toBeCloseTo(decade, 1);
        });
      });

      it('should get the value back from a pixel', function() {
        var chart = createChart(axis, changeFromBaseline);
        var scale = chart.scales[axis];

        [-5000, -4200, -12, -0.5, 0, 0.5, 7, 400, 2e5, 6.1e7, 1e8].forEach(function(value) {
          expectCloseTo(scale.getValueForPixel(scale.getPixelForValue(value)), value);
        });
      });

      it('should keep precision on ranges that are narrow next to their values', function() {
        var chart = createChart(axis, [1e15, 1e15 + 10]);
        var scale = chart.scales[axis];
        var ends = axisEnds(chart, axis);

        expect(scale.getPixelForValue(1e15)).toBeCloseToPixel(ends.start);
        expect(scale.getPixelForValue(1e15 + 10)).toBeCloseToPixel(ends.end);
        expect(scale.getPixelForValue(1e15 + 5)).toBeCloseToPixel((ends.start + ends.end) / 2);
      });

      it('should reverse the axis', function() {
        var chart = createChart(axis, changeFromBaseline, {reverse: true});
        var scale = chart.scales[axis];
        var ends = axisEnds(chart, axis);

        expect(scale.getPixelForValue(scale.min)).toBeCloseToPixel(ends.end);
        expect(scale.getPixelForValue(scale.max)).toBeCloseToPixel(ends.start);
        expectCloseTo(scale.getValueForPixel(ends.end), scale.min);
        expectCloseTo(scale.getValueForPixel(ends.start), scale.max);
        expect(getValues(scale)).toEqual(getValues(scale).slice().sort((a, b) => b - a));
      });

      it('should return NaN for null and NaN values', function() {
        var chart = createChart(axis, changeFromBaseline);
        expect(chart.scales[axis].getPixelForValue(null)).toBeNaN();
        expect(chart.scales[axis].getPixelForValue(NaN)).toBeNaN();
      });
    });
  });

  it('should draw bars from zero in both directions', function() {
    var chart = createChart('y', [-2000, 0, 5e6], {}, 'bar');
    var zero = chart.scales.y.getPixelForValue(0);
    var bars = chart.getDatasetMeta(0).data;

    bars.forEach(function(bar) {
      expect(bar.base).toBeCloseToPixel(zero);
    });
    expect(bars[0].y).toBeGreaterThan(zero);
    expect(bars[2].y).toBeLessThan(zero);
  });

  describe('linearThreshold', function() {
    it('should default to 1', function() {
      var chart = createChart('y', changeFromBaseline);
      expect(chart.scales.y.options.linearThreshold).toBe(1);
    });

    it('should space values much smaller than the threshold almost evenly', function() {
      var chart = createChart('y', changeFromBaseline, {linearThreshold: 100});
      var scale = chart.scales.y;
      var zeroToFive = scale.getPixelForValue(0) - scale.getPixelForValue(5);
      var fiveToTen = scale.getPixelForValue(5) - scale.getPixelForValue(10);

      expect(fiveToTen / zeroToFive).toBeGreaterThan(0.95);
      expect(scale.getPixelForValue(-5) - scale.getPixelForValue(0)).toBeCloseTo(zeroToFive, 6);
    });

    it('should give small values more room with a smaller threshold', function() {
      function zeroTo100(threshold) {
        var scale = createChart('y', changeFromBaseline, {linearThreshold: threshold}).scales.y;
        return scale.getPixelForValue(0) - scale.getPixelForValue(100);
      }
      expect(zeroTo100(10)).toBeGreaterThan(zeroTo100(100));
      expect(zeroTo100(1)).toBeGreaterThan(zeroTo100(10));
    });

    it('should place values at sign(x) * ln(1 + |x| / linearThreshold)', function() {
      var chart = createChart('y', [-1000, 1e5], {linearThreshold: 10});
      var scale = chart.scales.y;
      var ends = axisEnds(chart, 'y');
      var t = function(value) {
        return Math.sign(value) * Math.log1p(Math.abs(value) / 10);
      };

      [-1000, -25, -10, -3, 0, 3, 10, 25, 1000, 1e5].forEach(function(value) {
        var decimal = (t(value) - t(scale.min)) / (t(scale.max) - t(scale.min));
        expect(scale.getPixelForValue(value)).toBeCloseToPixel(ends.start + decimal * (ends.end - ends.start));
      });
    });

    it('should change gradually, without a cutoff at the threshold', function() {
      var scale = createChart('y', [-1e4, 1e4], {linearThreshold: 100}).scales.y;
      var zeroTo50 = scale.getPixelForValue(0) - scale.getPixelForValue(50);
      var fiftyTo100 = scale.getPixelForValue(50) - scale.getPixelForValue(100);
      var slope = function(value) {
        return scale.getPixelForValue(value) - scale.getPixelForValue(value + 1);
      };

      // already compressed before the threshold: ln(2 / 1.5) / ln(1.5) = 0.71, 1 if it were linear up to 100
      expect(fiftyTo100 / zeroTo50).toBeCloseTo(Math.log(2 / 1.5) / Math.log(1.5), 2);
      // and no jump at the threshold
      expect(slope(99) / slope(100)).toBeCloseTo(1, 1);
      expect(slope(10)).toBeGreaterThan(slope(100));
      expect(slope(100)).toBeGreaterThan(slope(1000));
    });

    it('should use evenly spaced ticks inside the threshold', function() {
      expect(getLabels(createChart('y', [-20, 20], {linearThreshold: 100}).scales.y))
        .toEqual(['-20', '-15', '-10', '-5', '0', '5', '10', '15', '20']);
      expect(getLabels(createChart('y', [-20, 20], {linearThreshold: 10}).scales.y))
        .toEqual(['-20', '-10', '-5', '0', '5', '10', '20']);
    });

    it('should warn once and use 1 for invalid values', function() {
      spyOn(console, 'warn');
      [0, -5, 'abc', '10', NaN, null, Infinity].forEach(function(threshold) {
        console.warn.calls.reset();
        var chart = createChart('y', changeFromBaseline, {linearThreshold: threshold});
        chart.update();
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn.calls.argsFor(0)[0]).toContain('scales.y.linearThreshold');
        expect(chart.scales.y._linearThreshold).toBe(1);
        expect(getLabels(chart.scales.y)).toEqual(['-5K', '-100', '0', '100', '10K', '1M', '100M']);
      });
    });

    it('should warn again when an invalid value comes back after a valid one', function() {
      spyOn(console, 'warn');
      var chart = createChart('y', changeFromBaseline, {linearThreshold: -1});
      chart.options.scales.y.linearThreshold = 10;
      chart.update();
      chart.options.scales.y.linearThreshold = -1;
      chart.update();
      expect(console.warn).toHaveBeenCalledTimes(2);
    });

    it('should not warn for valid values', function() {
      spyOn(console, 'warn');
      [1, 100, 0.01].forEach(function(threshold) {
        createChart('y', changeFromBaseline, {linearThreshold: threshold});
      });
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('ticks', function() {
    it('should generate ticks for counts with zeros', function() {
      expect(getLabels(createChart('y', viralLoad).scales.y))
        .toEqual(['0', '10', '100', '1K', '10K', '100K', '1M', '10M', '100M']);
    });

    it('should generate ticks on both sides of zero', function() {
      expect(getLabels(createChart('y', changeFromBaseline).scales.y))
        .toEqual(['-5K', '-100', '0', '100', '10K', '1M', '100M']);
      expect(getLabels(createChart('y', [-1e8, 0, 1e8]).scales.y))
        .toEqual(['-100M', '-1M', '-10K', '-100', '0', '100', '10K', '1M', '100M']);
    });

    it('should prefer powers of ten next to the axis ends', function() {
      expect(getLabels(createChart('y', [35, 120, 4200, 1e8]).scales.y))
        .toEqual(['30', '100', '1K', '10K', '100K', '1M', '10M', '100M']);
      expect(getLabels(createChart('y', [-5e6, -3, -100]).scales.y))
        .toEqual(['-5M', '-1M', '-100K', '-10K', '-1K', '-100', '-10', '-3']);
    });

    it('should add 2x and 5x ticks when every decade has room for them', function() {
      expect(getLabels(createChart('y', [8000, 800000]).scales.y))
        .toEqual(['8K', '20K', '50K', '100K', '200K', '500K', '800K']);
      expect(getLabels(createChart('y', [2.3e6, 6.1e7]).scales.y))
        .toEqual(['2M', '5M', '10M', '20M', '50M', '70M']);
    });

    it('should keep a power of ten next to an end when its label fits', function() {
      expect(getLabels(createChart('y', [0, 5000, 120000]).scales.y))
        .toEqual(['0', '1', '10', '100', '1K', '10K', '100K', '200K']);
      expect(getLabels(createChart('y', [35, 120, 4200, 87000, 2.3e6, 6.1e7, 1e8], {}, 'scatter', {width: 400, height: 300}).scales.y))
        .toEqual(['30', '100', '1K', '10K', '100K', '1M', '10M', '100M']);
    });

    it('should not put a 2x or 5x tick in place of a power of ten that does not fit', function() {
      expect(getLabels(createChart('y', [80, 300000]).scales.y))
        .toEqual(['80', '1K', '10K', '100K', '300K']);
      expect(getLabels(createChart('y', [60, 4000000]).scales.y))
        .toEqual(['60', '1K', '10K', '100K', '1M', '4M']);
    });

    it('should generate evenly spaced ticks on ranges that are narrow next to their values', function() {
      expect(getLabels(createChart('y', [120, 150, 180]).scales.y))
        .toEqual(['120', '130', '140', '150', '160', '170', '180']);
      expect(getLabels(createChart('y', [4000, 4010]).scales.y))
        .toEqual(['4,000', '4,002', '4,004', '4,006', '4,008', '4,010']);
      expect(getLabels(createChart('y', [0, 8]).scales.y))
        .toEqual(['0', '0.5', '1', '2', '4', '6', '8']);
    });

    it('should generate ticks around a single value', function() {
      expect(getLabels(createChart('y', [42]).scales.y))
        .toEqual(['39', '40', '41', '42', '43', '44', '45']);
    });

    it('should respect maxTicksLimit', function() {
      var scale = createChart('y', changeFromBaseline, {ticks: {maxTicksLimit: 5}}).scales.y;
      expect(scale.ticks.length).toBeLessThanOrEqual(5);
    });

    it('should ignore stepSize, count and precision', function() {
      var expected = getLabels(createChart('y', changeFromBaseline).scales.y);
      [{stepSize: 1000}, {count: 4}, {precision: 2}].forEach(function(ticks) {
        expect(getLabels(createChart('y', changeFromBaseline, {ticks: ticks}).scales.y)).toEqual(expected);
      });
    });

    it('should not flag major ticks, and enabling major ticks should not drop any', function() {
      var off = createChart('y', [-1e8, 0, 1e8]).scales.y;
      var on = createChart('y', [-1e8, 0, 1e8], {ticks: {major: {enabled: true}}}).scales.y;
      expect(off.ticks.filter(t => t.major).length).toBe(0);
      expect(getLabels(on)).toEqual(getLabels(off));
    });

    [
      ['counts with zeros', viralLoad],
      ['change from baseline', changeFromBaseline],
      ['a symmetric range', [-1e8, 0, 1e8]],
      ['a narrow range', [4000, 4010]],
      ['plain number labels', [98000, 102300]],
      ['2x and 5x ticks', [8000, 800000]]
    ].forEach(function(setup) {
      ['y', 'x'].forEach(function(axis) {
        it('should not overlap, rotate or skip labels for ' + setup[0] + ' on the ' + axis + ' axis', function() {
          var built;
          var chart = createChart(axis, setup[1], {afterBuildTicks: function(scale) {
            built = scale.ticks.length;
          }});
          var scale = chart.scales[axis];

          expect(scale.labelRotation).toBe(0);
          expect(scale.ticks.length).toBe(built);
          expect(minLabelGap(scale)).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('labels', function() {
    it('should use compact labels when they can tell the ticks apart', function() {
      expect(getLabels(createChart('y', [2.3e6, 6.1e7]).scales.y)[5]).toBe('70M');
      expect(getLabels(createChart('y', [950, 1040]).scales.y))
        .toEqual(['950', '960', '970', '980', '990', '1K', '1.01K', '1.02K', '1.03K', '1.04K']);
    });

    it('should use plain numbers on the whole axis when compact labels cannot tell the ticks apart', function() {
      expect(getLabels(createChart('y', [98000, 102300]).scales.y))
        .toEqual(['98,000', '98,500', '99,000', '99,500', '100,000', '100,500', '101,000', '101,500', '102,000', '102,500']);
      expect(getLabels(createChart('y', [99.2, 100.4]).scales.y))
        .toEqual(['99.2', '99.4', '99.6', '99.8', '100.0', '100.2', '100.4']);
    });

    it('should use scientific notation for extreme magnitudes', function() {
      expect(getLabels(createChart('y', [0, 3e15]).scales.y).pop()).toBe('3E15');
      expect(getLabels(createChart('y', [0, 3e14]).scales.y).pop()).toBe('300T');
      expect(getLabels(createChart('y', [2e-5, 7e-5], {linearThreshold: 1e-6}).scales.y))
        .toEqual(['2E-5', '3E-5', '4E-5', '5E-5', '6E-5', '7E-5']);
    });

    it('should keep the digits of a bound', function() {
      expect(getLabels(createChart('y', [4000, 1e8], {min: 3999.5}).scales.y)[0]).toBe('3.9995K');
      expect(getLabels(createChart('y', [4000, 4010], {min: 3999.5}).scales.y)[0]).toBe('3,999.5');
    });

    it('should use the format option', function() {
      expect(getLabels(createChart('y', changeFromBaseline, {ticks: {format: {notation: 'standard'}}}).scales.y))
        .toEqual(['-5,000', '-100', '0', '100', '10,000', '1,000,000', '100,000,000']);
    });

    it('should use the locale', function() {
      var chart = window.acquireChart({
        type: 'scatter',
        data: {datasets: [{data: points([-1e8, 0, 1e8], 'y')}]},
        options: {locale: 'de-DE', scales: {y: {type: 'symlog'}}}
      }, {canvas: {width: 600, height: 400}});
      // Intl puts a non-breaking space before 'Mio.'
      var labels = getLabels(chart.scales.y).map(label => label.replace(/\s/g, ' '));
      expect(labels).toContain('100 Mio.');
      expect(labels).toContain('10.000');
    });

    it('should pass the actual tick values to the callback', function() {
      var values = [];
      var chart = createChart('y', changeFromBaseline, {ticks: {callback: function(value) {
        values.push(value);
        return '' + value;
      }}});
      expect(getLabels(chart.scales.y)).toEqual(['-5000', '-100', '0', '100', '10000', '1000000', '100000000']);
      expect(values).toContain(-5000);
      expect(values).toContain(1e8);
    });

    it('should show full values in the tooltip on the y axis', async function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: changeFromBaseline.map((v, i) => 'day ' + i),
          datasets: [{label: 'Change', data: changeFromBaseline}]
        },
        options: {scales: {y: {type: 'symlog'}}}
      }, {canvas: {width: 600, height: 400}});
      var point = chart.getDatasetMeta(0).data[8];

      await jasmine.triggerMouseEvent(chart, 'mousemove', {x: point.x, y: point.y});

      expect(chart.tooltip.opacity).toBe(1);
      expect(chart.tooltip.title).toEqual(['day 8']);
      expect(chart.tooltip.body.map(b => b.lines)).toEqual([['Change: 60,995,800']]);
    });

    it('should show full values in the tooltip on the x axis', async function() {
      var chart = window.acquireChart({
        type: 'scatter',
        data: {datasets: [{label: 'Change', data: points(changeFromBaseline, 'x')}]},
        options: {scales: {x: {type: 'symlog'}}}
      }, {canvas: {width: 600, height: 400}});
      var point = chart.getDatasetMeta(0).data[0];

      await jasmine.triggerMouseEvent(chart, 'mousemove', {x: point.x, y: point.y});

      expect(chart.tooltip.opacity).toBe(1);
      expect(chart.tooltip.body.map(b => b.lines)).toEqual([['Change: (-4,200, 0)']]);
    });

    it('should format with Ticks.formatters.symlog when called directly', function() {
      var chart = createChart('y', changeFromBaseline);
      expect(Chart.Ticks.formatters.symlog.call(chart.scales.y, 1e6, 0, [{value: 1e6}])).toBe('1M');
      expect(Chart.Ticks.formatters.symlog.call(chart.scales.y, 0, 0, [{value: 0}])).toBe('0');
    });
  });

  ['y', 'x'].forEach(function(axis) {
    describe('range options on the ' + axis + ' axis', function() {
      function bounds(values, options) {
        var scale = createChart(axis, values, options).scales[axis];
        var sorted = scale.ticks.slice().sort((a, b) => a.value - b.value);
        return {min: scale.min, max: scale.max, low: sorted[0].label, high: sorted[sorted.length - 1].label, scale: scale};
      }

      it('should use min and max and show them as ticks', function() {
        var result = bounds([4000, 4010], {min: 3999.5});
        expect(result.min).toBe(3999.5);
        expect(result.low).toBe('3,999.5');

        result = bounds([4000, 4010], {max: 4010.5});
        expect(result.max).toBe(4010.5);
        expect(result.high).toBe('4,010.5');

        result = bounds([35, 1e8], {min: 0, max: 5e8});
        expect([result.min, result.max]).toEqual([0, 5e8]);
        expect([result.low, result.high]).toEqual(['0', '500M']);
      });

      it('should use min and max inside the data range', function() {
        var result = bounds([4000, 4010], {min: 4002, max: 4007});
        expect([result.min, result.max]).toEqual([4002, 4007]);
        expect([result.low, result.high]).toEqual(['4,002', '4,007']);
      });

      it('should not show min and max as ticks with includeBounds: false', function() {
        var result = bounds([4000, 4010], {min: 3999.5, ticks: {includeBounds: false}});
        expect(result.min).toBe(3999.5);
        expect(result.low).toBe('4,000');
      });

      it('should use suggestedMin and suggestedMax only to widen the range', function() {
        expect(bounds([4000, 4010], {suggestedMin: 3995}).min).toBe(3994);
        expect(bounds([4000, 4010], {suggestedMax: 4017}).max).toBe(4018);
        expect(bounds([4000, 4010], {suggestedMin: 4005, suggestedMax: 4006}).min).toBe(4000);
        expect(bounds([4000, 4010], {suggestedMin: 4005, suggestedMax: 4006}).max).toBe(4010);
        expect(bounds([35, 1e8], {suggestedMin: -1000}).min).toBe(-1000);
      });

      it('should reverse the ticks and keep min and max', function() {
        var result = bounds([4000, 4010], {reverse: true, min: 3999.5});
        expect(result.min).toBe(3999.5);
        expect(getLabels(result.scale)).toEqual(['4,010', '4,008', '4,006', '4,004', '4,002', '3,999.5']);
      });

      it('should let min win over beginAtZero', function() {
        var result = bounds([35, 1e8], {beginAtZero: true, min: 10});
        expect(result.min).toBe(10);
        expect(result.low).toBe('10');
      });
    });
  });

  describe('grace', function() {
    function topGap(chart) {
      var meta = chart.getDatasetMeta(0);
      var highest = Math.min.apply(null, meta.data.map(p => p.y));
      return highest - chart.chartArea.top;
    }

    it('should apply a percentage in transformed space', function() {
      var chart = createChart('y', viralLoad, {grace: '5%', beginAtZero: true});
      expect(chart.scales.y.min).toBe(0);
      expect(chart.scales.y.max).toBe(2e8);
      expect(topGap(chart)).toBeGreaterThan(5);
    });

    it('should not add orders of magnitude below zero', function() {
      var chart = createChart('y', viralLoad, {grace: '5%'});
      expect(chart.scales.y.min).toBeGreaterThan(-1);
      expect(chart.scales.y.min).toBeLessThan(0);
    });

    it('should apply a number in data units', function() {
      var chart = createChart('y', viralLoad, {grace: 2e7, bounds: 'data'});
      expect(chart.scales.y.min).toBe(-2e7);
      expect(chart.scales.y.max).toBe(1.2e8);
    });

    it('should not pad ends set with min or max', function() {
      var chart = createChart('y', viralLoad, {grace: '5%', max: 1e8, beginAtZero: true});
      expect(chart.scales.y.max).toBe(1e8);
      expect(chart.scales.y.min).toBe(0);
    });

    it('should widen the axis with bounds: data', function() {
      var chart = createChart('y', viralLoad, {grace: '5%', bounds: 'data'});
      expect(chart.scales.y.max).toBeGreaterThan(1.5e8);
      expect(chart.scales.y.max).toBeLessThan(1.6e8);
      expect(topGap(chart)).toBeGreaterThan(5);
    });

    it('should not accumulate over updates and resizes', function() {
      var chart = createChart('y', viralLoad, {grace: '5%'});
      var expected = [chart.scales.y.min, chart.scales.y.max];
      chart.update();
      chart.update();
      chart.resize(500, 300);
      chart.resize(600, 400);
      expect([chart.scales.y.min, chart.scales.y.max]).toEqual(expected);
    });
  });

  describe('bounds: data', function() {
    it('should use the data limits', function() {
      var scale = createChart('y', [-4200, 0, 6.1e7], {bounds: 'data'}).scales.y;
      expect(scale.min).toBe(-4200);
      expect(scale.max).toBe(6.1e7);
      getValues(scale).forEach(function(value) {
        expect(value).toBeGreaterThanOrEqual(-4200);
        expect(value).toBeLessThanOrEqual(6.1e7);
      });
    });

    it('should add a tick between the outermost tick and an end that is not a tick', function() {
      expect(getLabels(createChart('y', [0, 300, 9000], {bounds: 'data'}).scales.y))
        .toEqual(['0', '1', '10', '100', '1K', '5K']);
      expect(getLabels(createChart('y', [-4200, 0, 6.1e7], {bounds: 'data'}).scales.y))
        .toEqual(['-2K', '-100', '0', '100', '10K', '1M', '50M']);
    });

    it('should generate ticks on a narrow range', function() {
      expect(getLabels(createChart('y', [4000, 4010], {bounds: 'data'}).scales.y))
        .toEqual(['4,000', '4,002', '4,004', '4,006', '4,008', '4,010']);
    });
  });

  describe('odd data', function() {
    var cases = {
      'no data': [],
      'only nulls': [null, null, null],
      'nulls between values': [null, 5, null, 1e6, null, -30],
      'only zeros': [0, 0, 0],
      'a single zero': [0],
      'only negative values': [-5e6, -3, -100],
      'a single negative value': [-42],
      'NaN, Infinity and undefined': [NaN, 5, Infinity, -Infinity, undefined, 12],
      strings: ['12', '-3e4', 'abc'],
      'tiny values': [1e-12, 2e-12],
      'huge values': [1e300, 1e307],
      'the largest numbers': [-Number.MAX_VALUE, 0, Number.MAX_VALUE],
      'a narrow range of large values': [1e15, 1e15 + 10]
    };
    var variants = {
      'default options': {},
      grace: {grace: '5%'},
      'bounds: data': {bounds: 'data'},
      beginAtZero: {beginAtZero: true},
      reverse: {reverse: true},
      'linearThreshold: 100': {linearThreshold: 100}
    };

    Object.keys(cases).forEach(function(name) {
      ['scatter', 'line', 'bar'].forEach(function(type) {
        it('should handle ' + name + ' in a ' + type + ' chart', function() {
          Object.keys(variants).forEach(function(variant) {
            var chart;
            expect(function() {
              chart = createChart('y', cases[name], variants[variant], type);
            }).not.toThrow();
            var scale = chart.scales.y;

            expect(isFinite(scale.min)).withContext(variant + ' min').toBe(true);
            expect(isFinite(scale.max)).withContext(variant + ' max').toBe(true);
            scale.ticks.forEach(function(tick, i) {
              expect(isFinite(tick.value)).withContext(variant + ' tick value').toBe(true);
              expect(isFinite(scale.getPixelForTick(i))).withContext(variant + ' tick pixel').toBe(true);
              expect(tick.label).not.toMatch(/NaN|Infinity|undefined/);
            });
            chart.getDatasetMeta(0).data.forEach(function(element, i) {
              var value = chart.getDatasetMeta(0)._parsed[i].y;
              if (isFinite(value) && value !== null) {
                expect(isFinite(element.y)).withContext(variant + ' element ' + i).toBe(true);
              }
            });
          });
        });
      });
    });

    it('should handle charts without datasets', function() {
      expect(function() {
        window.acquireChart({
          type: 'line',
          data: {datasets: []},
          options: {scales: {y: {type: 'symlog'}}}
        });
      }).not.toThrow();
    });

    it('should handle data on the x axis', function() {
      Object.keys(cases).forEach(function(name) {
        expect(function() {
          createChart('x', cases[name]);
        }).withContext(name).not.toThrow();
      });
    });
  });
});
