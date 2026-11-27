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
    it('should apply number format options to zero ticks', function() {
      for (const test of [
        {format: {style: 'percent'}, expected: '0%'},
        {format: {style: 'currency', currency: 'USD'}, expected: '$0'},
        {format: {style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2}, expected: '$0.00'}
      ]) {
        const chart = window.acquireChart({
          type: 'line',
          data: {datasets: [{data: [0, 1]}]},
          options: {
            locale: 'en-US',
            scales: {
              y: {min: 0, max: 1, ticks: {format: test.format}}
            }
          }
        });
        expect(chart.scales.y.ticks[0].label).toBe(test.expected);
      }
    });

    it('should not fail on zero ticks when the format sets only one fraction digits bound', function() {
      const scale = {chart: {options: {locale: 'en-US'}}, options: {ticks: {format: {minimumFractionDigits: 2}}}};
      const ticks = [{value: 0}, {value: 0.25}, {value: 0.5}];
      expect(Chart.Ticks.formatters.numeric.call(scale, 0, 0, ticks)).toBe('0.00');

      scale.options.ticks.format = {maximumFractionDigits: 3};
      expect(Chart.Ticks.formatters.numeric.call(scale, 0, 0, ticks)).toBe('0');

      scale.options.ticks.format = {style: 'currency', currency: 'USD', minimumFractionDigits: 1};
      expect(Chart.Ticks.formatters.numeric.call(scale, 0, 0, ticks)).toBe('$0.0');
    });

    it('should keep zero ticks free of automatic precision and notation', function() {
      const scale = {chart: {options: {locale: 'en-US'}}, options: {ticks: {}}};
      for (const ticks of [[], [{value: 0}], [{value: 0}, {value: 0.01}], [{value: 0}, {value: 1e16}]]) {
        expect(Chart.Ticks.formatters.numeric.call(scale, 0, 0, ticks)).toBe('0');
      }
    });

    it('should not fail on empty or 1 item array', function() {
      const scale = {chart: {options: {locale: 'en'}}, options: {ticks: {format: {}}}};
      expect(Chart.Ticks.formatters.numeric.apply(scale, [1, 0, []])).toEqual('1');
      expect(Chart.Ticks.formatters.numeric.apply(scale, [1, 0, [{value: 1}]])).toEqual('1');
      expect(Chart.Ticks.formatters.numeric.apply(scale, [1, 0, [{value: 1}, {value: 1.01}]])).toEqual('1.00');
    });

    it('should not add a decimal for floating point error in the tick spacing', function() {
      const scale = {chart: {options: {locale: 'en-US'}}, options: {ticks: {}}};
      // 1.4 - 1.3 and 0.0024 - 0.0023 are a little less than the 0.1 and 0.0001 steps
      const ticks = [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8].map(value => ({value}));
      expect(ticks.map((t, i) => Chart.Ticks.formatters.numeric.call(scale, t.value, i, ticks)))
        .toEqual(['1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8']);

      const small = [0.0022, 0.0023, 0.0024, 0.0025].map(value => ({value}));
      expect(small.map((t, i) => Chart.Ticks.formatters.numeric.call(scale, t.value, i, small)))
        .toEqual(['0.0022', '0.0023', '0.0024', '0.0025']);
    });

    it('should label linear ticks with the decimals of their step', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {labels: ['a', 'b'], datasets: [{data: [1.27, 1.78]}]},
        options: {locale: 'en-US', scales: {y: {ticks: {maxTicksLimit: 8}}}}
      });
      expect(getLabels(chart.scales.y)).toEqual(['1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8']);
    });

    it('should not fail when the format sets only one fraction digits bound', function() {
      const scale = {chart: {options: {locale: 'en-US'}}, options: {ticks: {format: {style: 'percent', maximumFractionDigits: 0}}}};
      expect(Chart.Ticks.formatters.numeric.apply(scale, [0.15, 1, [{value: 0.1}, {value: 0.15}, {value: 0.2}]])).toEqual('15%');

      scale.options.ticks.format = {style: 'currency', currency: 'EUR', minimumFractionDigits: 2};
      expect(Chart.Ticks.formatters.numeric.apply(scale, [1500, 1, [{value: 1000}, {value: 1500}, {value: 2000}]])).toEqual('€1,500.00');
    });
  });
});
