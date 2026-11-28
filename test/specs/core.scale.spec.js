function getLabels(scale) {
  return scale.ticks.map(t => t.label);
}

describe('Core.scale', function() {
  it('should provide default scale label options', function() {
    expect(Chart.defaults.scale.title).toEqual({
      color: Chart.defaults.color,
      display: false,
      text: '',
      padding: {
        top: 4,
        bottom: 4
      }
    });
  });

  describe('displaying xAxis ticks with autoSkip=true', function() {
    function getChart(data) {
      return window.acquireChart({
        type: 'line',
        data: data,
        options: {
          scales: {
            x: {
              ticks: {
                autoSkip: true
              }
            }
          }
        }
      });
    }

    function getChartBigData(maxTicksLimit) {
      return window.acquireChart({
        type: 'line',
        data: {
          labels: new Array(300).fill('red'),
          datasets: [{
            data: new Array(300).fill(5),
          }]
        },
        options: {
          scales: {
            x: {
              ticks: {
                autoSkip: true,
                maxTicksLimit
              }
            }
          }
        }
      });
    }

    function lastTick(chart) {
      var xAxis = chart.scales.x;
      var ticks = xAxis.getTicks();
      return ticks[ticks.length - 1];
    }

    it('should use autoSkip amount of ticks when maxTicksLimit is set to a larger number as autoSkip calculation', function() {
      var chart = getChartBigData(300);
      expect(chart.scales.x.ticks.length).toEqual(20);
    });

    it('should use maxTicksLimit amount of ticks when maxTicksLimit is set to a smaller number as autoSkip calculation', function() {
      var chart = getChartBigData(3);
      expect(chart.scales.x.ticks.length).toEqual(3);
    });

    it('should display the last tick if it fits evenly with other ticks', function() {
      var chart = getChart({
        labels: [
          'January 2018', 'February 2018', 'March 2018', 'April 2018',
          'May 2018', 'June 2018', 'July 2018', 'August 2018',
          'September 2018'
        ],
        datasets: [{
          data: [12, 19, 3, 5, 2, 3, 7, 8, 9]
        }]
      });

      expect(lastTick(chart).label).toEqual('September 2018');
    });

    it('should not display the last tick if it does not fit evenly', function() {
      var chart = getChart({
        labels: [
          'January 2018', 'February 2018', 'March 2018', 'April 2018',
          'May 2018', 'June 2018', 'July 2018', 'August 2018',
          'September 2018', 'October 2018', 'November 2018', 'December 2018',
          'January 2019', 'February 2019', 'March 2019', 'April 2019',
          'May 2019', 'June 2019', 'July 2019', 'August 2019',
          'September 2019', 'October 2019', 'November 2019', 'December 2019',
          'January 2020', 'February 2020', 'March 2020', 'April 2020'
        ],
        datasets: [{
          data: [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7]
        }]
      });

      expect(lastTick(chart).label).toEqual('March 2020');
    });
  });

  describe('ticks.autoSkipKeepEnds', function() {
    function labelsChart(count, width, ticks) {
      var labels = [];
      for (var i = 0; i < count; i++) {
        labels.push('L' + i);
      }
      return window.acquireChart({
        type: 'line',
        data: {
          labels,
          datasets: [{data: labels.map((label, index) => index)}]
        },
        options: {
          plugins: {legend: false},
          scales: {
            x: {ticks: Object.assign({maxRotation: 0}, ticks)}
          }
        }
      }, {
        canvas: {width, height: 100}
      });
    }

    // Weekly bars on a time axis of 24 days with a tick each day. Every fifth
    // tick is kept, and a label fits in the 4 days from the 20th to the 24th.
    function barsOnTime(autoSkipKeepEnds) {
      var data = [];
      for (var day = 0; day <= 24; day += 7) {
        data.push({x: Date.UTC(2024, 0, 1 + day), y: day});
      }
      return window.acquireChart({
        type: 'bar',
        data: {datasets: [{data}]},
        options: {
          plugins: {legend: false},
          scales: {
            x: {
              type: 'time',
              min: Date.UTC(2024, 0, 1),
              max: Date.UTC(2024, 0, 25),
              time: {unit: 'day'},
              ticks: {source: 'auto', maxRotation: 0, autoSkipKeepEnds}
            },
            y: {display: false}
          }
        }
      }, {
        canvas: {width: 270, height: 100}
      });
    }

    it('should be off by default', function() {
      expect(Chart.defaults.scale.ticks.autoSkipKeepEnds).toBe(false);
    });

    // https://github.com/chartjs/Chart.js/issues/11816
    it('should keep the last label within maxTicksLimit', function() {
      var chart = labelsChart(20, 512, {maxTicksLimit: 7, autoSkipKeepEnds: true});

      expect(getLabels(chart.scales.x)).toEqual(['L0', 'L3', 'L6', 'L9', 'L12', 'L15', 'L19']);
    });

    // https://github.com/chartjs/Chart.js/issues/6154
    it('should keep the last label when the labels fill the axis', function() {
      var off = labelsChart(50, 300, {});
      var on = labelsChart(50, 300, {autoSkipKeepEnds: true});

      expect(getLabels(off.scales.x)).toEqual(['L0', 'L5', 'L10', 'L15', 'L20', 'L25', 'L30', 'L35', 'L40', 'L45']);
      expect(getLabels(on.scales.x)).toEqual(['L0', 'L5', 'L10', 'L15', 'L20', 'L25', 'L30', 'L35', 'L40', 'L49']);
    });

    it('should keep the same labels when off', function() {
      var chart = labelsChart(20, 512, {maxTicksLimit: 7, autoSkipKeepEnds: false});

      expect(getLabels(chart.scales.x)).toEqual(['L0', 'L3', 'L6', 'L9', 'L12', 'L15', 'L18']);
    });

    it('should not make bars narrower', function() {
      var off = barsOnTime(false);
      var on = barsOnTime(true);
      var days = (chart) => chart.scales.x.ticks.map((tick) => new Date(tick.value).getUTCDate());
      // In days: the last label makes room for itself, so the axis is shorter in pixels.
      var widthInDays = (chart) => {
        var scale = chart.scales.x;
        var day = scale.getPixelForValue(Date.UTC(2024, 0, 2)) - scale.getPixelForValue(Date.UTC(2024, 0, 1));
        return chart.getDatasetMeta(0).data[0].width / day;
      };

      expect(days(off)).toEqual([1, 6, 11, 16, 21]);
      expect(days(on)).toEqual([1, 6, 11, 16, 21, 25]);
      expect(widthInDays(on)).toBeCloseTo(widthInDays(off), 6);
    });

    // Bars on a daily time axis from `days[0]` to `days[1]`, at the days of `data`.
    function barsOnDays(days, data, x) {
      return window.acquireChart({
        type: 'bar',
        data: {datasets: [{data: data.map((day) => ({x: Date.UTC(2024, 0, 1 + day), y: day + 1}))}]},
        options: {
          plugins: {legend: false},
          scales: {
            x: Object.assign({
              type: 'time',
              min: Date.UTC(2024, 0, 1 + days[0]),
              max: Date.UTC(2024, 0, 1 + days[1]),
              time: {unit: 'day'}
            }, x),
            y: {display: false}
          }
        }
      }, {
        canvas: {width: 600, height: 100}
      });
    }

    function tickDays(scale) {
      return scale.ticks.map((tick) => Math.round((tick.value - Date.UTC(2024, 0, 1)) / 864e5));
    }

    it('should size bars by the gap between two kept ticks', function() {
      // Bars 40 days apart on an axis of 20 days: the gap from the first to
      // the added last tick, the only one, sizes them.
      var chart = barsOnDays([0, 20], [0, 40], {
        offsetAfterAutoskip: true,
        ticks: {source: 'auto', maxRotation: 0, maxTicksLimit: 2, autoSkipKeepEnds: true}
      });
      var scale = chart.scales.x;
      var gap = scale.getPixelForTick(1) - scale.getPixelForTick(0);

      expect(tickDays(scale)).toEqual([0, 20]);
      expect(chart.getDatasetMeta(0).data[0].width).toBeCloseTo(gap * 0.8 * 0.9, 6);
      // The end offset is half that gap: no third tick to size it from.
      expect(scale.right - scale.getPixelForTick(1)).toBeCloseTo(gap / 2, 4);
    });

    it('should size bars by the gap before an added last tick of three', function() {
      // 4 daily ticks with room for 3: 0 and 2 kept, 3 added a day after 2.
      var chart = barsOnDays([0, 3], [0, 3], {
        ticks: {source: 'auto', maxRotation: 0, maxTicksLimit: 3, autoSkipKeepEnds: true}
      });
      var scale = chart.scales.x;
      var gap = scale.getPixelForTick(1) - scale.getPixelForTick(0);

      expect(tickDays(scale)).toEqual([0, 2, 3]);
      expect(chart.getDatasetMeta(0).data[0].width).toBeCloseTo(gap * 0.8 * 0.9, 6);
    });

    it('should forget the added last tick when autoSkip is turned off', function() {
      // 0, 5, …, 20 and the bound 23. With wide labels: 0, 10 and the added 23.
      var chart = window.acquireChart({
        type: 'bar',
        data: {datasets: [{data: [{x: 0, y: 1}, {x: 10, y: 2}, {x: 20, y: 3}]}]},
        options: {
          plugins: {legend: false},
          scales: {
            x: {type: 'linear', min: 0, max: 23, ticks: {stepSize: 5, autoSkipPadding: 90, autoSkipKeepEnds: true}},
            y: {display: false}
          }
        }
      }, {
        canvas: {width: 400, height: 150}
      });
      var scale = chart.scales.x;

      expect(scale.ticks.map((tick) => tick.value)).toEqual([0, 10, 23]);

      chart.options.scales.x.ticks.autoSkip = false;
      chart.update();

      var end = scale.getPixelForTick(5) - scale.getPixelForTick(4);
      expect(scale.ticks.map((tick) => tick.value)).toEqual([0, 5, 10, 15, 20, 23]);
      expect(chart.getDatasetMeta(0).data[0].width).toBeCloseTo(end * 0.8 * 0.9, 6);
    });

    // A hook that hands back the same tick objects on every update.
    function reusedTicksChart() {
      var cache;
      return window.acquireChart({
        type: 'bar',
        data: {datasets: [{data: [{x: 0, y: 1}, {x: 10, y: 2}, {x: 20, y: 3}]}]},
        options: {
          plugins: {legend: false},
          scales: {
            x: {
              type: 'linear',
              min: 0,
              max: 25,
              ticks: {stepSize: 9, includeBounds: true, autoSkipPadding: 40, autoSkipKeepEnds: true},
              afterBuildTicks: function(scale) {
                cache = cache || scale.ticks.slice();
                scale.ticks = cache.slice();
              }
            },
            y: {display: false}
          }
        }
      }, {
        canvas: {width: 130, height: 150}
      });
    }

    ['autoSkip', 'display'].forEach(function(option) {
      it('should forget the added last tick of reused ticks when ticks.' + option + ' is turned off', function() {
        var chart = reusedTicksChart();
        var scale = chart.scales.x;

        // Wide labels: 0, and 25 added.
        expect(scale.ticks.map((tick) => tick.value)).toEqual([0, 25]);

        chart.options.scales.x.ticks[option] = false;
        chart.update();

        var end = scale.getPixelForTick(3) - scale.getPixelForTick(2);
        expect(scale.ticks.map((tick) => tick.value)).toEqual([0, 9, 18, 25]);
        expect(chart.getDatasetMeta(0).data[0].width).toBeCloseTo(end * 0.8 * 0.9, 6);
      });
    });

    [false, true].forEach(function(autoSkipKeepEnds) {
      // Monthly ticks: February 2024 is the shortest gap, and the last. Nothing is skipped or added.
      function monthly(offsetAfterAutoskip) {
        return window.acquireChart({
          type: 'bar',
          data: {datasets: [{data: [{x: Date.UTC(2024, 0, 1), y: 1}, {x: Date.UTC(2024, 2, 1), y: 2}]}]},
          options: {
            plugins: {legend: false},
            scales: {
              x: {
                type: 'time',
                offsetAfterAutoskip,
                min: Date.UTC(2024, 0, 1),
                max: Date.UTC(2024, 2, 1),
                time: {unit: 'month'},
                ticks: {source: 'auto', maxRotation: 0, autoSkipKeepEnds}
              },
              y: {display: false}
            }
          }
        }, {
          canvas: {width: 300, height: 100}
        });
      }

      it('should size bars by a shorter last gap of uneven ticks, autoSkipKeepEnds: ' + autoSkipKeepEnds, function() {
        var chart = monthly(false);
        var scale = chart.scales.x;
        var february = scale.getPixelForTick(2) - scale.getPixelForTick(1);

        expect(scale.ticks.length).toBe(3);
        expect(chart.getDatasetMeta(0).data[0].width).toBeCloseTo(february * 0.8 * 0.9, 6);
      });

      it('should size the end offset by the last gap of uneven ticks, autoSkipKeepEnds: ' + autoSkipKeepEnds, function() {
        var scale = monthly(true).scales.x;
        var february = scale.getPixelForTick(2) - scale.getPixelForTick(1);

        expect(scale.right - scale.getPixelForTick(2)).toBeCloseTo(february / 2, 4);
      });

      it('should size bars by a shorter last gap of generated linear ticks, autoSkipKeepEnds: ' + autoSkipKeepEnds, function() {
        // Ticks 0, 10, 20 and the bound 25: the gap of 5 is generated, not added.
        var chart = window.acquireChart({
          type: 'bar',
          data: {datasets: [{data: [{x: 0, y: 1}, {x: 10, y: 2}, {x: 20, y: 3}]}]},
          options: {
            plugins: {legend: false},
            scales: {
              x: {type: 'linear', min: 0, max: 25, ticks: {includeBounds: true, stepSize: 10, autoSkipKeepEnds}},
              y: {display: false}
            }
          }
        }, {
          canvas: {width: 400, height: 150}
        });
        var scale = chart.scales.x;
        var end = scale.getPixelForTick(3) - scale.getPixelForTick(2);

        expect(scale.ticks.map((tick) => tick.value)).toEqual([0, 10, 20, 25]);
        expect(chart.getDatasetMeta(0).data[0].width).toBeCloseTo(end * 0.8 * 0.9, 6);
      });
    });

    it('should not clip the last bar on a timeseries axis', function() {
      // The timeseries scale sizes its offsets from all its timestamps, not the kept ticks.
      var data = [0, 3, 6, 9, 12, 15, 19].map((day) => ({x: Date.UTC(2024, 0, 1 + day), y: day + 1}));
      var chart = window.acquireChart({
        type: 'bar',
        data: {datasets: [{data}]},
        options: {
          plugins: {legend: false},
          scales: {
            x: {
              type: 'timeseries',
              offsetAfterAutoskip: true,
              min: Date.UTC(2024, 0, 1),
              max: Date.UTC(2024, 0, 20),
              time: {unit: 'day'},
              ticks: {source: 'auto', maxRotation: 0, maxTicksLimit: 8, autoSkipKeepEnds: true}
            },
            y: {display: false}
          }
        }
      }, {
        canvas: {width: 1000, height: 100}
      });
      var scale = chart.scales.x;
      var bars = chart.getDatasetMeta(0).data;
      var lastBar = bars[bars.length - 1];

      expect(scale.ticks.map((tick) => new Date(tick.value).getUTCDate())).toEqual([1, 4, 7, 10, 13, 16, 20]);
      expect(lastBar.x + lastBar.width / 2).toBeLessThanOrEqual(scale.right + 1e-6);
    });

    it('should not clip the last bar when the offsets follow the kept ticks', function() {
      // Bars at least 3 days apart, about 2.2 days wide; daily ticks every third
      // one kept, and the last a day after the one before it.
      var data = [0, 3, 6, 9, 12, 15, 19].map((day) => ({x: Date.UTC(2024, 0, 1 + day), y: day + 1}));
      var chart = window.acquireChart({
        type: 'bar',
        data: {datasets: [{data}]},
        options: {
          plugins: {legend: false},
          scales: {
            x: {
              type: 'time',
              offsetAfterAutoskip: true,
              min: Date.UTC(2024, 0, 1),
              max: Date.UTC(2024, 0, 20),
              time: {unit: 'day'},
              ticks: {source: 'auto', maxRotation: 0, maxTicksLimit: 8, autoSkipKeepEnds: true}
            },
            y: {display: false}
          }
        }
      }, {
        canvas: {width: 1000, height: 100}
      });
      var scale = chart.scales.x;
      var days = scale.ticks.map((tick) => new Date(tick.value).getUTCDate());
      var bars = chart.getDatasetMeta(0).data;
      var lastBar = bars[bars.length - 1];

      expect(days).toEqual([1, 4, 7, 10, 13, 16, 19, 20]);
      expect(lastBar.x + lastBar.width / 2).toBeLessThanOrEqual(scale.right + 1e-6);
    });

    // The kept last label is at least one label's room from the one before it.
    // (The other gaps are the step, counted before the axis is fit, as without the option.)
    function expectRoom(scale) {
      var count = scale.ticks.length;
      var end = scale.getPixelForTick(count - 1) - scale.getPixelForTick(count - 2);

      expect(Math.abs(end)).toBeGreaterThanOrEqual(scale._tickSize());
    }

    function axisChart(type, x, data, width) {
      var generated;
      var chart = window.acquireChart({
        type,
        data,
        options: {
          plugins: {legend: false},
          scales: {
            x: Object.assign({
              afterBuildTicks: function(scale) {
                generated = scale.ticks.slice();
              }
            }, x),
            y: {display: false}
          }
        }
      }, {
        canvas: {width, height: 100}
      });
      return {scale: chart.scales.x, last: generated[generated.length - 1]};
    }

    it('should keep the last tick a label apart on a logarithmic axis', function() {
      var {scale, last} = axisChart('scatter', {
        type: 'logarithmic', min: 1, max: 100000, ticks: {maxRotation: 0, autoSkipKeepEnds: true}
      }, {datasets: [{data: [{x: 1, y: 1}, {x: 100000, y: 2}]}]}, 300);

      expect(scale.ticks[scale.ticks.length - 1]).toBe(last);
      expectRoom(scale);
    });

    it('should keep the last tick a label apart on a reversed linear axis', function() {
      var {scale, last} = axisChart('scatter', {
        min: 0, max: 97, reverse: true, ticks: {stepSize: 1, maxRotation: 0, autoSkipKeepEnds: true}
      }, {datasets: [{data: [{x: 0, y: 1}, {x: 97, y: 2}]}]}, 300);

      expect(last.value).toBe(0);
      expect(scale.ticks[scale.ticks.length - 1]).toBe(last);
      expectRoom(scale);
    });

    it('should keep the last tick a label apart on a time axis', function() {
      var {scale, last} = axisChart('line', {
        type: 'time', min: Date.UTC(2024, 0, 1), max: Date.UTC(2024, 1, 11),
        time: {unit: 'day'}, ticks: {source: 'auto', maxRotation: 0, autoSkipKeepEnds: true}
      }, {datasets: [{data: [{x: Date.UTC(2024, 0, 1), y: 1}, {x: Date.UTC(2024, 1, 11), y: 2}]}]}, 300);

      expect(scale.ticks[scale.ticks.length - 1]).toBe(last);
      expectRoom(scale);
    });

    it('should keep the last tick a label apart on a category axis with offset', function() {
      var labels = [];
      for (var i = 0; i < 50; i++) {
        labels.push('L' + i);
      }
      var {scale, last} = axisChart('bar', {
        ticks: {maxRotation: 0, autoSkipKeepEnds: true}
      }, {labels, datasets: [{data: labels.map((label, index) => index)}]}, 300);

      expect(scale.ticks[scale.ticks.length - 1]).toBe(last);
      expectRoom(scale);
    });
  });

  var gridLineTests = [{
    labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
    offsetGridLines: false,
    offset: false,
    expected: [0.5, 128.5, 256.5, 384.5, 512.5]
  }, {
    labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
    offsetGridLines: false,
    offset: true,
    expected: [51.5, 153.5, 256.5, 358.5, 460.5]
  }, {
    labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
    offsetGridLines: true,
    offset: false,
    expected: [64.5, 192.5, 320.5, 448.5]
  }, {
    labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
    offsetGridLines: true,
    offset: true,
    expected: [0.5, 102.5, 204.5, 307.5, 409.5, 512.5]
  }, {
    labels: ['tick1'],
    offsetGridLines: false,
    offset: false,
    expected: [0.5]
  }, {
    labels: ['tick1'],
    offsetGridLines: false,
    offset: true,
    expected: [256.5]
  }, {
    labels: ['tick1'],
    offsetGridLines: true,
    offset: false,
    expected: [512.5]
  }, {
    labels: ['tick1'],
    offsetGridLines: true,
    offset: true,
    expected: [0.5, 512.5]
  }];

  gridLineTests.forEach(function(test) {
    it('should get the correct pixels for gridLine(s) for the horizontal scale when offsetGridLines is ' + test.offsetGridLines + ' and offset is ' + test.offset, function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: []
          }],
          labels: test.labels
        },
        options: {
          scales: {
            x: {
              grid: {
                offset: test.offsetGridLines,
                drawTicks: false
              },
              ticks: {
                display: false
              },
              offset: test.offset
            },
            y: {
              display: false
            }
          },
          plugins: {
            legend: false
          }
        }
      });

      var xScale = chart.scales.x;
      xScale.ctx = window.createMockContext();
      chart.draw();

      expect(xScale.ctx.getCalls().filter(function(x) {
        return x.name === 'moveTo' && x.args[1] === 0;
      }).map(function(x) {
        return x.args[0];
      })).toEqual(test.expected);
    });
  });

  gridLineTests.forEach(function(test) {
    it('should get the correct pixels for gridLine(s) for the vertical scale when offsetGridLines is ' + test.offsetGridLines + ' and offset is ' + test.offset, function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: []
          }],
          labels: test.labels
        },
        options: {
          scales: {
            x: {
              display: false
            },
            y: {
              type: 'category',
              grid: {
                offset: test.offsetGridLines,
                drawTicks: false
              },
              ticks: {
                display: false
              },
              offset: test.offset
            }
          },
          plugins: {
            legend: false
          }
        }
      });

      var yScale = chart.scales.y;
      yScale.ctx = window.createMockContext();
      chart.draw();

      expect(yScale.ctx.getCalls().filter(function(x) {
        return x.name === 'moveTo' && x.args[0] === 1;
      }).map(function(x) {
        return x.args[1];
      })).toEqual(test.expected);
    });
  });

  it('should add the correct padding for long tick labels', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: [
          'This is a very long label',
          'This is a very long label'
        ],
        datasets: [{
          data: [0, 1]
        }]
      },
      options: {
        scales: {
          y: {
            display: false
          }
        },
        plugins: {
          legend: false
        }
      }
    }, {
      canvas: {
        height: 100,
        width: 200
      }
    });

    var scale = chart.scales.x;
    expect(scale.left).toBeGreaterThan(100);
    expect(scale.right).toBeGreaterThan(190);
  });

  describe('given the axes display option is set to auto', function() {
    describe('for the x axes', function() {
      it('should draw the axes if at least one associated dataset is visible', function() {
        var chart = window.acquireChart({
          type: 'line',
          data: {
            datasets: [{
              data: [100, 200, 100, 50],
              xAxisId: 'foo',
              hidden: true,
              labels: ['Q1', 'Q2', 'Q3', 'Q4']
            }, {
              data: [100, 200, 100, 50],
              xAxisId: 'foo',
              labels: ['Q1', 'Q2', 'Q3', 'Q4']
            }]
          },
          options: {
            scales: {
              x: {
                display: 'auto'
              },
              y: {
                type: 'category',
              }
            }
          }
        });

        var scale = chart.scales.x;
        scale.ctx = window.createMockContext();
        chart.draw();

        expect(scale.ctx.getCalls().length).toBeGreaterThan(0);
        expect(scale.height).toBeGreaterThan(0);
      });

      it('should not draw the axes if no associated datasets are visible', function() {
        var chart = window.acquireChart({
          type: 'line',
          data: {
            datasets: [{
              data: [100, 200, 100, 50],
              xAxisId: 'foo',
              hidden: true,
              labels: ['Q1', 'Q2', 'Q3', 'Q4']
            }]
          },
          options: {
            scales: {
              x: {
                display: 'auto'
              }
            }
          }
        });

        var scale = chart.scales.x;
        scale.ctx = window.createMockContext();
        chart.draw();

        expect(scale.ctx.getCalls().length).toBe(0);
        expect(scale.height).toBe(0);
      });
    });

    describe('for the y axes', function() {
      it('should draw the axes if at least one associated dataset is visible', function() {
        var chart = window.acquireChart({
          type: 'line',
          data: {
            datasets: [{
              data: [100, 200, 100, 50],
              yAxisId: 'foo',
              hidden: true,
              labels: ['Q1', 'Q2', 'Q3', 'Q4']
            }, {
              data: [100, 200, 100, 50],
              yAxisId: 'foo',
              labels: ['Q1', 'Q2', 'Q3', 'Q4']
            }]
          },
          options: {
            scales: {
              y: {
                display: 'auto'
              }
            }
          }
        });

        var scale = chart.scales.y;
        scale.ctx = window.createMockContext();
        chart.draw();

        expect(scale.ctx.getCalls().length).toBeGreaterThan(0);
        expect(scale.width).toBeGreaterThan(0);
      });

      it('should not draw the axes if no associated datasets are visible', function() {
        var chart = window.acquireChart({
          type: 'line',
          data: {
            datasets: [{
              data: [100, 200, 100, 50],
              yAxisId: 'foo',
              hidden: true,
              labels: ['Q1', 'Q2', 'Q3', 'Q4']
            }]
          },
          options: {
            scales: {
              y: {
                display: 'auto'
              }
            }
          }
        });

        var scale = chart.scales.y;
        scale.ctx = window.createMockContext();
        chart.draw();

        expect(scale.ctx.getCalls().length).toBe(0);
        expect(scale.width).toBe(0);
      });
    });
  });

  describe('afterBuildTicks', function() {
    it('should allow filtering of ticks', function() {
      var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
      var chart = window.acquireChart({
        type: 'line',
        options: {
          scales: {
            x: {
              type: 'category',
              labels: labels,
              afterBuildTicks: function(scale) {
                scale.ticks = scale.ticks.slice(1);
              }
            }
          }
        }
      });

      var scale = chart.scales.x;
      expect(getLabels(scale)).toEqual(labels.slice(1));
    });

    it('should allow no return value from callback', function() {
      var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
      var chart = window.acquireChart({
        type: 'line',
        options: {
          scales: {
            x: {
              type: 'category',
              labels: labels,
              afterBuildTicks: function() { }
            }
          }
        }
      });

      var scale = chart.scales.x;
      expect(getLabels(scale)).toEqual(labels);
    });

    it('should allow empty ticks', function() {
      var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
      var chart = window.acquireChart({
        type: 'line',
        options: {
          scales: {
            x: {
              type: 'category',
              labels: labels,
              afterBuildTicks: function(scale) {
                scale.ticks = [];
              }
            }
          }
        }
      });

      var scale = chart.scales.x;
      expect(scale.ticks.length).toBe(0);
    });
  });

  describe('_layers', function() {
    it('should default to three layers', function() {
      var chart = window.acquireChart({
        type: 'line',
        options: {
          scales: {
            x: {
              type: 'linear',
            }
          }
        }
      });

      var scale = chart.scales.x;
      expect(scale._layers().length).toEqual(3);
    });

    it('should create the chart with custom scale ids without axis or position options', function() {
      function createChart() {
        return window.acquireChart({
          type: 'scatter',
          data: {
            datasets: [{
              data: [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}],
              xAxisID: 'customIDx',
              yAxisID: 'customIDy'
            }]
          },
          options: {
            scales: {
              customIDx: {
                type: 'linear',
                display: false
              },
              customIDy: {
                type: 'linear',
                display: false
              }
            }
          }
        });
      }

      expect(createChart).not.toThrow();
    });

    it('should default to one layer for custom scales', function() {
      class CustomScale extends Chart.Scale {
        draw() {}
        convertTicksToLabels() {
          return ['tick'];
        }
      }
      CustomScale.id = 'customScale';
      CustomScale.defaults = {};
      Chart.register(CustomScale);

      var chart = window.acquireChart({
        type: 'line',
        options: {
          scales: {
            x: {
              type: 'customScale',
              grid: {
                z: 10
              },
              ticks: {
                z: 20
              }
            }
          }
        }
      });

      var scale = chart.scales.x;
      expect(scale._layers().length).toEqual(1);
      expect(scale._layers()[0].z).toEqual(20);
    });

    it('should default to one layer for custom scales for axis', function() {
      class CustomScale1 extends Chart.Scale {
        draw() {}
        convertTicksToLabels() {
          return ['tick'];
        }
      }
      CustomScale1.id = 'customScale1';
      CustomScale1.defaults = {axis: 'x'};
      Chart.register(CustomScale1);

      var chart = window.acquireChart({
        type: 'line',
        options: {
          scales: {
            my: {
              type: 'customScale1',
              grid: {
                z: 10
              },
              ticks: {
                z: 20
              }
            }
          }
        }
      });

      var scale = chart.scales.my;
      expect(scale._layers().length).toEqual(1);
      expect(scale._layers()[0].z).toEqual(20);
    });

    it('should fail for custom scales without any axis or position', function() {
      class CustomScale2 extends Chart.Scale {
        draw() {}
      }
      CustomScale2.id = 'customScale2';
      CustomScale2.defaults = {};
      Chart.register(CustomScale2);

      function createChart() {
        return window.acquireChart({
          type: 'line',
          options: {
            scales: {
              my: {
                type: 'customScale2'
              }
            }
          }
        });
      }

      expect(createChart).toThrow(new Error('Cannot determine type of \'my\' axis. Please provide \'axis\' or \'position\' option.'));
    });

    it('should return 3 layers when z is not equal between ticks and grid', function() {
      var chart = window.acquireChart({
        type: 'line',
        options: {
          scales: {
            x: {
              type: 'linear',
              ticks: {
                z: 10
              }
            }
          }
        }
      });

      expect(chart.scales.x._layers().length).toEqual(3);

      chart = window.acquireChart({
        type: 'line',
        options: {
          scales: {
            x: {
              type: 'linear',
              grid: {
                z: 11
              }
            }
          }
        }
      });

      expect(chart.scales.x._layers().length).toEqual(3);

      chart = window.acquireChart({
        type: 'line',
        options: {
          scales: {
            x: {
              type: 'linear',
              ticks: {
                z: 10
              },
              grid: {
                z: 11
              }
            }
          }
        }
      });

      expect(chart.scales.x._layers().length).toEqual(3);

    });

  });

  describe('min and max', function() {
    it('should be limited to visible data', function() {
      var chart = window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [{
            data: [{x: 100, y: 100}, {x: -100, y: -100}]
          }, {
            data: [{x: 10, y: 10}, {x: -10, y: -10}]
          }]
        },
        options: {
          scales: {
            x: {
              id: 'x',
              type: 'linear',
              min: -20,
              max: 20
            },
            y: {
              id: 'y',
              type: 'linear'
            }
          }
        }
      });

      expect(chart.scales.x.min).toEqual(-20);
      expect(chart.scales.x.max).toEqual(20);
      expect(chart.scales.y.min).toEqual(-10);
      expect(chart.scales.y.max).toEqual(10);
    });
  });

  describe('overrides', () => {
    it('should create new scale', () => {
      const chart = window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [{
            data: [{x: 100, y: 100}, {x: -100, y: -100}]
          }, {
            data: [{x: 10, y: 10}, {x: -10, y: -10}]
          }]
        },
        options: {
          scales: {
            x2: {
              type: 'linear',
              min: -20,
              max: 20
            }
          }
        }
      });

      expect(Object.keys(chart.scales).sort()).toEqual(['x', 'x2', 'y']);
    });

    it('should create new scale with custom name', () => {
      const chart = window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [{
            data: [{x: 100, y: 100}, {x: -100, y: -100}]
          }, {
            data: [{x: 10, y: 10}, {x: -10, y: -10}]
          }]
        },
        options: {
          scales: {
            scaleX: {
              axis: 'x',
              type: 'linear',
              min: -20,
              max: 20
            }
          }
        }
      });

      expect(Object.keys(chart.scales).sort()).toEqual(['scaleX', 'x', 'y']);
    });

    it('should throw error on scale with custom name without axis type', () => {
      expect(() => window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [{
            data: [{x: 100, y: 100}, {x: -100, y: -100}]
          }, {
            data: [{x: 10, y: 10}, {x: -10, y: -10}]
          }]
        },
        options: {
          scales: {
            scaleX: {
              type: 'linear',
              min: -20,
              max: 20
            }
          }
        }
      })).toThrow();
    });

    it('should read options first to determine axis', () => {
      const chart = window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [{
            data: [{x: 100, y: 100}, {x: -100, y: -100}]
          }, {
            data: [{x: 10, y: 10}, {x: -10, y: -10}]
          }]
        },
        options: {
          scales: {
            xavier: {
              axis: 'y',
              type: 'linear',
              min: -20,
              max: 20
            }
          }
        }
      });

      expect(chart.scales.xavier.axis).toBe('y');
    });
    it('should center labels when rotated in x axis', () => {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3]
          }]
        },
        options: {
          scales: {
            x: {
              ticks: {
                minRotation: 90,
              }
            }
          }
        }
      });
      const mapper = item => parseFloat(item.options.translation[0].toFixed(2));
      const expected = [20.15, 113.6, 207.05, 300.5, 393.95, 487.4];
      const actual = chart.scales.x.getLabelItems().map(mapper);
      const len = expected.length;
      for (let i = 0; i < len; ++i) {
        const actualValue = actual[i];
        const expectedValue = expected[i];
        expect(actualValue).toBeCloseTo(expectedValue, 1);
      }
    });
  });
  describe('ticks.align inner', () => {
    const linearData = [{x: 200, y: 12}, {x: 451, y: 14}, {x: 999, y: 14}];

    function getInnerLabels(scaleOptions, data, labels) {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels,
          datasets: [{data}]
        },
        options: {
          scales: {
            x: Object.assign({
              ticks: {
                align: 'inner',
                showLabelBackdrop: true,
                backdropPadding: 0
              }
            }, scaleOptions)
          }
        }
      });
      return chart.scales.x.getLabelItems()
        .slice()
        .sort((a, b) => a.options.translation[0] - b.options.translation[0]);
    }

    function expectInnerAlignment(items) {
      const first = items[0];
      const last = items[items.length - 1];
      expect(first.options.textAlign).toBe('left');
      expect(first.options.backdrop.left).toBe(0);
      expect(last.options.textAlign).toBe('right');
      expect(last.options.backdrop.left).toBe(-last.options.backdrop.width);
      items.slice(1, -1).forEach(item => expect(item.options.textAlign).toBe('center'));
    }

    it('should align the outermost labels inwards on a linear axis', () => {
      expectInnerAlignment(getInnerLabels({type: 'linear', min: 200, max: 1000}, linearData));
    });

    it('should align the outermost labels inwards on a reversed linear axis', () => {
      expectInnerAlignment(getInnerLabels({type: 'linear', min: 200, max: 1000, reverse: true}, linearData));
    });

    it('should align the outermost labels inwards on a reversed category axis', () => {
      expectInnerAlignment(getInnerLabels({reverse: true}, [1, 2, 3], ['Label1', 'Label2', 'Label3']));
    });
  });
  describe('Scale Title stroke', ()=>{
    function getChartWithScaleTitleStroke() {
      return window.acquireChart({
        type: 'line',
        options: {
          scales: {
            x: {
              type: 'linear',
              title: {
                display: true,
                text: 'title-x',
                color: '#ddd',
                strokeWidth: 1,
                strokeColor: '#333'
              }
            },
            y: {
              type: 'linear',
              title: {
                display: true,
                text: 'title-y',
                color: '#ddd',
                strokeWidth: 2,
                strokeColor: '#222'
              }
            }
          }
        }
      });
    }

    function getChartWithoutScaleTitleStroke() {
      return window.acquireChart({
        type: 'line',
        options: {
          scales: {
            x: {
              type: 'linear',
              title: {
                display: true,
                text: 'title-x',
                color: '#ddd'
              }
            },
            y: {
              type: 'linear',
              title: {
                display: true,
                text: 'title-y',
                color: '#ddd'
              }
            }
          }
        }
      });
    }

    it('should draw a scale title stroke when provided x-axis', function() {
      var chart = getChartWithScaleTitleStroke();
      var scale = chart.scales.x;
      expect(scale.options.title.strokeColor).toEqual('#333');
      expect(scale.options.title.strokeWidth).toEqual(1);
    });

    it('should draw a scale title stroke when provided y-axis', function() {
      var chart = getChartWithScaleTitleStroke();
      var scale = chart.scales.y;
      expect(scale.options.title.strokeColor).toEqual('#222');
      expect(scale.options.title.strokeWidth).toEqual(2);
    });

    it('should not draw a scale title stroke when not provided', function() {
      var chart = getChartWithoutScaleTitleStroke();
      var scales = chart.scales;
      expect(scales.y.options.title.strokeColor).toBeUndefined();
      expect(scales.y.options.title.strokeWidth).toBeUndefined();
      expect(scales.x.options.title.strokeColor).toBeUndefined();
      expect(scales.x.options.title.strokeWidth).toBeUndefined();
    });
  });
});
