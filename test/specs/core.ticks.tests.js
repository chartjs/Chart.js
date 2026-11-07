function getLabels(scale) {
  return scale.ticks.map(t => t.label);
}

describe('Test tick generators', function() {
  // formatters are used as default config values so users want to be able to reference them
  it('Should expose formatters api', function() {
    expect(typeof Chart.Ticks).toBeDefined();
    expect(typeof Chart.Ticks.formatters).toBeDefined();
    expect(typeof Chart.Ticks.formatters.values).toBe('function');
    expect(typeof Chart.Ticks.formatters.numeric).toBe('function');
  });

  it('Should generate linear spaced ticks with correct precision', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: []
        }],
      },
      options: {
        plugins: {
          legend: false
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            ticks: {
              callback: function(value) {
                return value.toString();
              }
            }
          },
          y: {
            type: 'linear',
            ticks: {
              callback: function(value) {
                return value.toString();
              }
            }
          }
        }
      }
    });

    var xLabels = getLabels(chart.scales.x);
    var yLabels = getLabels(chart.scales.y);

    expect(xLabels).toEqual(['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1']);
    expect(yLabels).toEqual(['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1']);
  });

  it('Should generate logarithmic spaced ticks with correct precision', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: []
        }],
      },
      options: {
        plugins: {
          legend: false
        },
        scales: {
          x: {
            type: 'logarithmic',
            position: 'bottom',
            min: 0.1,
            max: 1,
            ticks: {
              autoSkip: false,
              callback: function(value) {
                return value.toString();
              }
            }
          },
          y: {
            type: 'logarithmic',
            min: 0.1,
            max: 1,
            ticks: {
              autoSkip: false,
              callback: function(value) {
                return value.toString();
              }
            }
          }
        }
      }
    });

    var xLabels = getLabels(chart.scales.x);
    var yLabels = getLabels(chart.scales.y);

    expect(xLabels).toEqual(['0.1', '0.11', '0.12', '0.13', '0.14', '0.15', '0.16', '0.17', '0.18', '0.19', '0.2', '0.25', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1']);
    expect(yLabels).toEqual(['0.1', '0.11', '0.12', '0.13', '0.14', '0.15', '0.16', '0.17', '0.18', '0.19', '0.2', '0.25', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1']);
  });

  describe('formatters.numeric', function() {
    it('should not fail on empty or 1 item array', function() {
      const scale = {chart: {options: {locale: 'en'}}, options: {ticks: {format: {}}}};
      expect(Chart.Ticks.formatters.numeric.apply(scale, [1, 0, []])).toEqual('1');
      expect(Chart.Ticks.formatters.numeric.apply(scale, [1, 0, [{value: 1}]])).toEqual('1');
      expect(Chart.Ticks.formatters.numeric.apply(scale, [1, 0, [{value: 1}, {value: 1.01}]])).toEqual('1.00');
    });

    function formatTicks(values) {
      const scale = {chart: {options: {locale: 'en-US'}}, options: {ticks: {format: {}}}};
      const ticks = values.map(value => ({value}));
      return values.map((value, index) => Chart.Ticks.formatters.numeric.call(scale, value, index, ticks));
    }

    it('should show the significand digits needed by the tick spacing in scientific notation', function() {
      expect(formatTicks([1e15, 1.5e15, 2e15, 2.5e15, 3e15, 3.5e15, 4e15, 4.5e15, 5e15])).toEqual(
        ['1.0E15', '1.5E15', '2.0E15', '2.5E15', '3.0E15', '3.5E15', '4.0E15', '4.5E15', '5.0E15']);
      expect(formatTicks([0, 2e15, 4e15, 6e15, 8e15, 1e16, 1.2e16, 1.4e16, 1.6e16, 1.8e16, 2e16])).toEqual(
        ['0', '2E15', '4E15', '6E15', '8E15', '1.0E16', '1.2E16', '1.4E16', '1.6E16', '1.8E16', '2.0E16']);
      expect(formatTicks([0, 1e-5, 2e-5, 3e-5, 4e-5, 5e-5, 6e-5])).toEqual(
        ['0', '1E-5', '2E-5', '3E-5', '4E-5', '5E-5', '6E-5']);
      expect(formatTicks([-1e-8, 0, 1e-8, 2e-8, 3e-8])).toEqual(['-1E-8', '0', '1E-8', '2E-8', '3E-8']);
    });

    it('should give distinct labels to ticks that are not multiples of the tick spacing', function() {
      // bounds: 'data' generates the ticks as min + k * spacing, then adds max
      expect(formatTicks([-0.0936, -0.0736, -0.0536, -0.0336, -0.0136, 0.0064, 0.0264, 0.0464, 0.0664, 0.0864, 0.0917])).toEqual(
        ['-0.094', '-0.074', '-0.054', '-0.034', '-0.014', '0.006', '0.026', '0.046', '0.066', '0.086', '0.092']);
    });
  });

  it('Should generate distinct labels for linear ticks with bounds: data', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['a', 'b'],
        datasets: [{
          data: [-0.0936, 0.0917]
        }],
      },
      options: {
        scales: {
          y: {
            bounds: 'data',
            ticks: {
              autoSkip: false
            }
          }
        }
      }
    });

    var labels = getLabels(chart.scales.y);
    expect(labels[0]).toEqual('-0.094');
    expect(labels[labels.length - 1]).toEqual('0.092');
    expect(new Set(labels).size).toEqual(labels.length);
  });
});
