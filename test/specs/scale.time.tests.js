// Time scale tests
describe('Time scale tests', function() {
  describe('auto', jasmine.fixture.specs('scale.time'));

  function createScale(data, options, dimensions) {
    var width = (dimensions && dimensions.width) || 400;
    var height = (dimensions && dimensions.height) || 50;

    options = options || {};
    options.type = 'time';
    options.id = 'xScale0';

    var chart = window.acquireChart({
      type: 'line',
      data: data,
      options: {
        scales: {
          x: options
        }
      }
    }, {canvas: {width: width, height: height}});


    return chart.scales.x;
  }

  function getLabels(scale) {
    return scale.ticks.map(t => t.label);
  }

  beforeEach(function() {
    // Need a time matcher for getValueFromPixel
    jasmine.addMatchers({
      toBeCloseToTime: function() {
        return {
          compare: function(time, expected) {
            var result = false;
            var actual = moment(time);
            var diff = actual.diff(expected.value, expected.unit, true);
            result = Math.abs(diff) < (expected.threshold !== undefined ? expected.threshold : 0.01);

            return {
              pass: result
            };
          }
        };
      }
    });
  });

  it('should load moment.js as a dependency', function() {
    expect(window.moment).not.toBe(undefined);
  });

  it('should register the constructor with the registry', function() {
    var Constructor = Chart.registry.getScale('time');
    expect(Constructor).not.toBe(undefined);
    expect(typeof Constructor).toBe('function');
  });

  it('should have the correct default config', function() {
    var defaultConfig = Chart.defaults.scales.time;
    expect(defaultConfig).toEqual({
      bounds: 'data',
      adapters: {},
      time: {
        parser: false, // false == a pattern string from or a custom callback that converts its argument to a timestamp
        unit: false, // false == automatic or override with week, month, year, etc.
        round: false, // none, or override with week, month, year, etc.
        isoWeekday: false, // override week start day
        minUnit: 'millisecond',
        displayFormats: {}
      },
      ticks: {
        source: 'auto',
        major: {
          enabled: false
        }
      }
    });
  });

  it('should correctly determine the unit', function() {
    var date = moment('Jan 01 1990', 'MMM DD YYYY');
    var data = [];
    for (var i = 0; i < 60; i++) {
      data.push({x: date.valueOf(), y: Math.random()});
      date = date.clone().add(1, 'month');
    }

    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          data: data
        }],
      },
      options: {
        scales: {
          x: {
            type: 'time',
            ticks: {
              source: 'data',
              autoSkip: true
            }
          },
        }
      }
    });

    var scale = chart.scales.x;

    expect(scale._unit).toEqual('month');
  });

  describe('when specifying limits', function() {
    var mockData = {
      labels: ['2015-01-01T20:00:00', '2015-01-02T20:00:00', '2015-01-03T20:00:00'],
    };

    var config;
    beforeEach(function() {
      config = Chart.helpers.clone(Chart.defaults.scales.time);
      config.ticks.source = 'labels';
      config.time.unit = 'day';
    });

    it('should use the min option when less than first label for building ticks', function() {
      config.min = '2014-12-29T04:00:00';

      var labels = getLabels(createScale(mockData, config));
      expect(labels[0]).toEqual('Jan 1');
    });

    it('should use the min option when greater than first label for building ticks', function() {
      config.min = '2015-01-02T04:00:00';

      var labels = getLabels(createScale(mockData, config));
      expect(labels[0]).toEqual('Jan 2');
    });

    it('should use the max option when greater than last label for building ticks', function() {
      config.max = '2015-01-05T06:00:00';

      var labels = getLabels(createScale(mockData, config));
      expect(labels[labels.length - 1]).toEqual('Jan 3');
    });

    it('should use the max option when less than last label for building ticks', function() {
      config.max = '2015-01-02T23:00:00';

      var labels = getLabels(createScale(mockData, config));
      expect(labels[labels.length - 1]).toEqual('Jan 2');
    });
  });

  it('should use the isoWeekday option', function() {
    var mockData = {
      labels: [
        '2015-01-01T20:00:00', // Thursday
        '2015-01-02T20:00:00', // Friday
        '2015-01-03T20:00:00' // Saturday
      ]
    };

    var config = Chart.helpers.mergeIf({
      bounds: 'ticks',
      time: {
        unit: 'week',
        isoWeekday: 3 // Wednesday
      }
    }, Chart.defaults.scales.time);

    var scale = createScale(mockData, config);
    var ticks = getLabels(scale);

    expect(ticks).toEqual(['Dec 31, 2014', 'Jan 7, 2015']);
  });

  describe('when rendering several days', function() {
    beforeEach(function() {
      this.chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            xAxisID: 'x',
            data: []
          }],
          labels: [
            '2015-01-01T20:00:00',
            '2015-01-02T21:00:00',
            '2015-01-03T22:00:00',
            '2015-01-05T23:00:00',
            '2015-01-07T03:00',
            '2015-01-08T10:00',
            '2015-01-10T12:00'
          ]
        },
        options: {
          scales: {
            x: {
              type: 'time',
              position: 'bottom'
            },
          }
        }
      });

      this.scale = this.chart.scales.x;
    });

    it('should be bounded by the nearest week beginnings', function() {
      var chart = this.chart;
      var scale = this.scale;
      expect(scale.getValueForPixel(scale.left)).toBeGreaterThan(moment(chart.data.labels[0]).startOf('week'));
      expect(scale.getValueForPixel(scale.right)).toBeLessThan(moment(chart.data.labels[chart.data.labels.length - 1]).add(1, 'week').endOf('week'));
    });

    it('should convert between screen coordinates and times', function() {
      var chart = this.chart;
      var scale = this.scale;
      var timeRange = moment(scale.max).valueOf() - moment(scale.min).valueOf();
      var msPerPix = timeRange / scale.width;
      var firstPointOffsetMs = moment(chart.config.data.labels[0]).valueOf() - scale.min;
      var firstPointPixel = scale.left + firstPointOffsetMs / msPerPix;
      var lastPointOffsetMs = moment(chart.config.data.labels[chart.config.data.labels.length - 1]).valueOf() - scale.min;
      var lastPointPixel = scale.left + lastPointOffsetMs / msPerPix;

      expect(scale.getPixelForValue(moment('2015-01-01T20:00:00').valueOf())).toBeCloseToPixel(firstPointPixel);
      expect(scale.getPixelForValue(moment(chart.data.labels[0]).valueOf())).toBeCloseToPixel(firstPointPixel);
      expect(scale.getValueForPixel(firstPointPixel)).toBeCloseToTime({
        value: moment(chart.data.labels[0]),
        unit: 'hour',
      });

      expect(scale.getPixelForValue(moment('2015-01-10T12:00').valueOf())).toBeCloseToPixel(lastPointPixel);
      expect(scale.getValueForPixel(lastPointPixel)).toBeCloseToTime({
        value: moment(chart.data.labels[6]),
        unit: 'hour'
      });
    });
  });

  describe('when rendering several years', function() {
    beforeEach(function() {
      this.chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['2005-07-04', '2017-01-20'],
        },
        options: {
          scales: {
            x: {
              type: 'time',
              bounds: 'ticks',
              position: 'bottom'
            },
          }
        }
      }, {canvas: {width: 800, height: 200}});

      this.scale = this.chart.scales.x;
    });

    it('should be bounded by nearest step\'s year start and end', function() {
      var scale = this.scale;
      var ticks = scale.getTicks();
      var step = ticks[1].value - ticks[0].value;
      var stepsAmount = Math.floor((scale.max - scale.min) / step);

      expect(scale.getValueForPixel(scale.left)).toBeCloseToTime({
        value: moment(scale.min).startOf('year'),
        unit: 'hour',
      });
      expect(scale.getValueForPixel(scale.right)).toBeCloseToTime({
        value: moment(scale.min + step * stepsAmount).endOf('year'),
        unit: 'hour',
      });
    });

    it('should build the correct ticks', function() {
      expect(getLabels(this.scale)).toEqual(['2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018']);
    });

    it('should have ticks with accurate labels', function() {
      var scale = this.scale;
      var ticks = scale.getTicks();
      // pixelsPerTick is an aproximation which assumes same number of milliseconds per year (not true)
      // we use a threshold of 1 day so that we still match these values
      var pixelsPerTick = scale.width / (ticks.length - 1);

      for (var i = 0; i < ticks.length - 1; i++) {
        var offset = pixelsPerTick * i;
        expect(scale.getValueForPixel(scale.left + offset)).toBeCloseToTime({
          value: moment(ticks[i].label + '-01-01'),
          unit: 'day',
          threshold: 1,
        });
      }
    });
  });

  it('should get the correct label for a data value', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          data: [null, 10, 3]
        }],
        labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00', '2015-01-03T22:00:00', '2015-01-05T23:00:00', '2015-01-07T03:00', '2015-01-08T10:00', '2015-01-10T12:00'], // days
      },
      options: {
        scales: {
          x: {
            type: 'time',
            position: 'bottom',
            ticks: {
              source: 'labels',
              autoSkip: false
            }
          }
        }
      }
    });

    var xScale = chart.scales.x;
    var controller = chart.getDatasetMeta(0).controller;
    expect(xScale.getLabelForValue(controller.getParsed(0)[xScale.id])).toBeTruthy();
    expect(xScale.getLabelForValue(controller.getParsed(0)[xScale.id])).toBe('Jan 1, 2015, 8:00:00 pm');
    expect(xScale.getLabelForValue(xScale.getValueForPixel(xScale.getPixelForTick(6)))).toBe('Jan 10, 2015, 12:00:00 pm');
  });

  describe('when ticks.callback is specified', function() {
    beforeEach(function() {
      this.chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            xAxisID: 'x',
            data: [0, 0]
          }],
          labels: ['2015-01-01T20:00:00', '2015-01-01T20:01:00']
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                displayFormats: {
                  second: 'h:mm:ss'
                }
              },
              ticks: {
                callback: function(value) {
                  return '<' + value + '>';
                }
              }
            }
          }
        }
      });
      this.scale = this.chart.scales.x;
    });

    it('should get the correct labels for ticks', function() {
      var labels = getLabels(this.scale);

      expect(labels.length).toEqual(21);
      expect(labels[0]).toEqual('<8:00:00>');
      expect(labels[labels.length - 1]).toEqual('<8:01:00>');
    });

    it('should update ticks.callback correctly', function() {
      var chart = this.chart;
      chart.options.scales.x.ticks.callback = function(value) {
        return '{' + value + '}';
      };
      chart.update();

      var labels = getLabels(this.scale);
      expect(labels.length).toEqual(21);
      expect(labels[0]).toEqual('{8:00:00}');
      expect(labels[labels.length - 1]).toEqual('{8:01:00}');
    });
  });

  it('should get the correct label when time is specified as a string', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          data: [{x: '2015-01-01T20:00:00', y: 10}, {x: '2015-01-02T21:00:00', y: 3}]
        }],
      },
      options: {
        scales: {
          x: {
            type: 'time',
            position: 'bottom'
          },
        }
      }
    });

    var xScale = chart.scales.x;
    var controller = chart.getDatasetMeta(0).controller;
    var value = controller.getParsed(0)[xScale.id];
    expect(xScale.getLabelForValue(value)).toBeTruthy();
    expect(xScale.getLabelForValue(value)).toBe('Jan 1, 2015, 8:00:00 pm');
  });

  it('should round to isoWeekday', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [{x: '2020-04-12T20:00:00', y: 1}, {x: '2020-04-13T20:00:00', y: 2}]
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            ticks: {
              source: 'data'
            },
            time: {
              unit: 'week',
              round: 'week',
              isoWeekday: 1,
              displayFormats: {
                week: 'WW'
              }
            }
          },
        }
      }
    });

    expect(getLabels(chart.scales.x)).toEqual(['15', '16']);
  });

  it('should get the correct label for a timestamp', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          data: [
            {t: +new Date('2018-01-08 05:14:23.234'), y: 10},
            {t: +new Date('2018-01-09 06:17:43.426'), y: 3}
          ]
        }],
      },
      options: {
        parsing: {xAxisKey: 't'},
        scales: {
          x: {
            type: 'time',
            position: 'bottom'
          },
        }
      }
    });

    var xScale = chart.scales.x;
    var controller = chart.getDatasetMeta(0).controller;
    var label = xScale.getLabelForValue(controller.getParsed(0)[xScale.id]);
    expect(label).toEqual('Jan 8, 2018, 5:14:23 am');
  });

  it('should get the correct pixel for only one data in the dataset', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['2016-05-27'],
        datasets: [{
          xAxisID: 'x',
          data: [5]
        }]
      },
      options: {
        scales: {
          x: {
            display: true,
            type: 'time'
          }
        }
      }
    });

    var xScale = chart.scales.x;
    var pixel = xScale.getPixelForValue(moment('2016-05-27').valueOf());

    expect(xScale.getValueForPixel(pixel)).toEqual(moment(chart.data.labels[0]).valueOf());
  });

  it('does not create a negative width chart when hidden', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: []
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            ticks: {
              min: moment().subtract(1, 'months'),
              max: moment(),
            }
          },
        },
        responsive: true,
      },
    }, {
      wrapper: {
        style: 'display: none',
      },
    });
    expect(chart.scales.y.width).toEqual(0);
    expect(chart.scales.y.maxWidth).toEqual(0);
    expect(chart.width).toEqual(0);
  });

  describe('when ticks.source', function() {
    describe('is "labels"', function() {
      beforeEach(function() {
        this.chart = window.acquireChart({
          type: 'line',
          data: {
            labels: ['2017', '2019', '2020', '2025', '2042'],
            datasets: [{data: [0, 1, 2, 3, 4, 5]}]
          },
          options: {
            scales: {
              x: {
                type: 'time',
                time: {
                  parser: 'YYYY'
                },
                ticks: {
                  source: 'labels'
                }
              }
            }
          }
        });
      });

      it ('should generate ticks from "data.labels"', function() {
        var scale = this.chart.scales.x;

        expect(scale.min).toEqual(+moment('2017', 'YYYY'));
        expect(scale.max).toEqual(+moment('2042', 'YYYY'));
        expect(getLabels(scale)).toEqual([
          '2017', '2019', '2020', '2025', '2042']);
      });
      it ('should not add ticks for min and max if they extend the labels range', function() {
        var chart = this.chart;
        var scale = chart.scales.x;
        var options = chart.options.scales.x;

        options.min = '2012';
        options.max = '2051';
        chart.update();

        expect(scale.min).toEqual(+moment('2012', 'YYYY'));
        expect(scale.max).toEqual(+moment('2051', 'YYYY'));
        expect(getLabels(scale)).toEqual([
          '2017', '2019', '2020', '2025', '2042']);
      });
      it ('should not duplicate ticks if min and max are the labels limits', function() {
        var chart = this.chart;
        var scale = chart.scales.x;
        var options = chart.options.scales.x;

        options.min = '2017';
        options.max = '2042';
        chart.update();

        expect(scale.min).toEqual(+moment('2017', 'YYYY'));
        expect(scale.max).toEqual(+moment('2042', 'YYYY'));
        expect(getLabels(scale)).toEqual([
          '2017', '2019', '2020', '2025', '2042']);
      });
      it ('should correctly handle empty `data.labels` using "day" if `time.unit` is undefined`', function() {
        var chart = this.chart;
        var scale = chart.scales.x;

        chart.data.labels = [];
        chart.update();

        expect(scale.min).toEqual(+moment().startOf('day'));
        expect(scale.max).toEqual(+moment().endOf('day') + 1);
        expect(getLabels(scale)).toEqual([]);
      });
      it ('should correctly handle empty `data.labels` using `time.unit`', function() {
        var chart = this.chart;
        var scale = chart.scales.x;
        var options = chart.options.scales.x;

        options.time.unit = 'year';
        chart.data.labels = [];
        chart.update();

        expect(scale.min).toEqual(+moment().startOf('year'));
        expect(scale.max).toEqual(+moment().endOf('year') + 1);
        expect(getLabels(scale)).toEqual([]);
      });
    });

    describe('is "data"', function() {
      beforeEach(function() {
        this.chart = window.acquireChart({
          type: 'line',
          data: {
            labels: ['2017', '2019', '2020', '2025', '2042'],
            datasets: [
              {data: [0, 1, 2, 3, 4, 5]},
              {data: [
                {x: '2018', y: 6},
                {x: '2020', y: 7},
                {x: '2043', y: 8}
              ]}
            ]
          },
          options: {
            scales: {
              x: {
                type: 'time',
                time: {
                  parser: 'YYYY'
                },
                ticks: {
                  source: 'data'
                }
              }
            }
          }
        });
      });

      it ('should generate ticks from "datasets.data"', function() {
        var scale = this.chart.scales.x;

        expect(scale.min).toEqual(+moment('2017', 'YYYY'));
        expect(scale.max).toEqual(+moment('2043', 'YYYY'));
        expect(getLabels(scale)).toEqual([
          '2017', '2018', '2019', '2020', '2025', '2042', '2043']);
      });
      it ('should not add ticks for min and max if they extend the labels range', function() {
        var chart = this.chart;
        var scale = chart.scales.x;
        var options = chart.options.scales.x;

        options.min = '2012';
        options.max = '2051';
        chart.update();

        expect(scale.min).toEqual(+moment('2012', 'YYYY'));
        expect(scale.max).toEqual(+moment('2051', 'YYYY'));
        expect(getLabels(scale)).toEqual([
          '2017', '2018', '2019', '2020', '2025', '2042', '2043']);
      });
      it ('should not duplicate ticks if min and max are the labels limits', function() {
        var chart = this.chart;
        var scale = chart.scales.x;
        var options = chart.options.scales.x;

        options.min = '2017';
        options.max = '2043';
        chart.update();

        expect(scale.min).toEqual(+moment('2017', 'YYYY'));
        expect(scale.max).toEqual(+moment('2043', 'YYYY'));
        expect(getLabels(scale)).toEqual([
          '2017', '2018', '2019', '2020', '2025', '2042', '2043']);
      });
      it ('should correctly handle empty `data.labels` using "day" if `time.unit` is undefined`', function() {
        var chart = this.chart;
        var scale = chart.scales.x;

        chart.data.labels = [];
        chart.update();

        expect(scale.min).toEqual(+moment('2018', 'YYYY'));
        expect(scale.max).toEqual(+moment('2043', 'YYYY'));
        expect(getLabels(scale)).toEqual([
          '2018', '2020', '2043']);
      });
      it ('should correctly handle empty `data.labels` and hidden datasets using `time.unit`', function() {
        var chart = this.chart;
        var scale = chart.scales.x;
        var options = chart.options.scales.x;

        options.time.unit = 'year';
        chart.data.labels = [];
        var meta = chart.getDatasetMeta(1);
        meta.hidden = true;
        chart.update();

        expect(scale.min).toEqual(+moment().startOf('year'));
        expect(scale.max).toEqual(+moment().endOf('year') + 1);
        expect(getLabels(scale)).toEqual([]);
      });
    });
  });

  [true, false].forEach(function(normalized) {
    describe('when normalized is ' + normalized + ' and scale type', function() {
      describe('is "timeseries"', function() {
        beforeEach(function() {
          this.chart = window.acquireChart({
            type: 'line',
            data: {
              labels: ['2017', '2019', '2020', '2025', '2042'],
              datasets: [{data: [0, 1, 2, 3, 4]}]
            },
            options: {
              normalized,
              scales: {
                x: {
                  type: 'timeseries',
                  time: {
                    parser: 'YYYY'
                  },
                  ticks: {
                    source: 'labels'
                  }
                },
                y: {
                  display: false
                }
              }
            }
          });
        });

        it ('should space data out with the same gap, whatever their time values', function() {
          var scale = this.chart.scales.x;
          var start = scale.left;
          var slice = scale.width / 4;

          expect(scale.getPixelForValue(moment('2017').valueOf(), 0)).toBeCloseToPixel(start);
          expect(scale.getPixelForValue(moment('2019').valueOf(), 1)).toBeCloseToPixel(start + slice);
          expect(scale.getPixelForValue(moment('2020').valueOf(), 2)).toBeCloseToPixel(start + slice * 2);
          expect(scale.getPixelForValue(moment('2025').valueOf(), 3)).toBeCloseToPixel(start + slice * 3);
          expect(scale.getPixelForValue(moment('2042').valueOf(), 4)).toBeCloseToPixel(start + slice * 4);
        });
        it ('should add a step before if scale.min is before the first data', function() {
          var chart = this.chart;
          var scale = chart.scales.x;
          var options = chart.options.scales.x;

          options.min = '2012';
          chart.update();

          var start = scale.left;
          var slice = scale.width / 5;

          expect(scale.getPixelForValue(moment('2017').valueOf(), 1)).toBeCloseToPixel(86);
          expect(scale.getPixelForValue(moment('2042').valueOf(), 5)).toBeCloseToPixel(start + slice * 5);
        });
        it ('should add a step after if scale.max is after the last data', function() {
          var chart = this.chart;
          var scale = chart.scales.x;
          var options = chart.options.scales.x;

          options.max = '2050';
          chart.update();

          var start = scale.left;

          expect(scale.getPixelForValue(moment('2017').valueOf(), 0)).toBeCloseToPixel(start);
          expect(scale.getPixelForValue(moment('2042').valueOf(), 4)).toBeCloseToPixel(388);
        });
        it ('should add steps before and after if scale.min/max are outside the data range', function() {
          var chart = this.chart;
          var scale = chart.scales.x;
          var options = chart.options.scales.x;

          options.min = '2012';
          options.max = '2050';
          chart.update();

          expect(scale.getPixelForValue(moment('2017').valueOf(), 1)).toBeCloseToPixel(71);
          expect(scale.getPixelForValue(moment('2042').valueOf(), 5)).toBeCloseToPixel(401);
        });
      });
      describe('is "time"', function() {
        beforeEach(function() {
          this.chart = window.acquireChart({
            type: 'line',
            data: {
              labels: ['2017', '2019', '2020', '2025', '2042'],
              datasets: [{data: [0, 1, 2, 3, 4, 5]}]
            },
            options: {
              scales: {
                x: {
                  type: 'time',
                  time: {
                    parser: 'YYYY'
                  },
                  ticks: {
                    source: 'labels'
                  }
                },
                y: {
                  display: false
                }
              }
            }
          });
        });

        it ('should space data out with a gap relative to their time values', function() {
          var scale = this.chart.scales.x;
          var start = scale.left;
          var slice = scale.width / (2042 - 2017);

          expect(scale.getPixelForValue(moment('2017').valueOf(), 0)).toBeCloseToPixel(start);
          expect(scale.getPixelForValue(moment('2019').valueOf(), 1)).toBeCloseToPixel(start + slice * (2019 - 2017));
          expect(scale.getPixelForValue(moment('2020').valueOf(), 2)).toBeCloseToPixel(start + slice * (2020 - 2017));
          expect(scale.getPixelForValue(moment('2025').valueOf(), 3)).toBeCloseToPixel(start + slice * (2025 - 2017));
          expect(scale.getPixelForValue(moment('2042').valueOf(), 4)).toBeCloseToPixel(start + slice * (2042 - 2017));
        });
        it ('should take in account scale min and max if outside the ticks range', function() {
          var chart = this.chart;
          var scale = chart.scales.x;
          var options = chart.options.scales.x;

          options.min = '2012';
          options.max = '2050';
          chart.update();

          var start = scale.left;
          var slice = scale.width / (2050 - 2012);

          expect(scale.getPixelForValue(moment('2017').valueOf(), 0)).toBeCloseToPixel(start + slice * (2017 - 2012));
          expect(scale.getPixelForValue(moment('2019').valueOf(), 1)).toBeCloseToPixel(start + slice * (2019 - 2012));
          expect(scale.getPixelForValue(moment('2020').valueOf(), 2)).toBeCloseToPixel(start + slice * (2020 - 2012));
          expect(scale.getPixelForValue(moment('2025').valueOf(), 3)).toBeCloseToPixel(start + slice * (2025 - 2012));
          expect(scale.getPixelForValue(moment('2042').valueOf(), 4)).toBeCloseToPixel(start + slice * (2042 - 2012));
        });
      });
    });
  });

  describe('when bounds', function() {
    describe('is "data"', function() {
      it ('should preserve the data range', function() {
        var chart = window.acquireChart({
          type: 'line',
          data: {
            labels: ['02/20 08:00', '02/21 09:00', '02/22 10:00', '02/23 11:00'],
            datasets: [{data: [0, 1, 2, 3, 4, 5]}]
          },
          options: {
            scales: {
              x: {
                type: 'time',
                bounds: 'data',
                time: {
                  parser: 'MM/DD HH:mm',
                  unit: 'day'
                }
              },
              y: {
                display: false
              }
            }
          }
        });

        var scale = chart.scales.x;

        expect(scale.min).toEqual(+moment('02/20 08:00', 'MM/DD HH:mm'));
        expect(scale.max).toEqual(+moment('02/23 11:00', 'MM/DD HH:mm'));
        expect(scale.getPixelForValue(moment('02/20 08:00', 'MM/DD HH:mm').valueOf())).toBeCloseToPixel(scale.left);
        expect(scale.getPixelForValue(moment('02/23 11:00', 'MM/DD HH:mm').valueOf())).toBeCloseToPixel(scale.left + scale.width);
        expect(getLabels(scale)).toEqual([
          'Feb 21', 'Feb 22', 'Feb 23']);
      });
    });

    describe('is "labels"', function() {
      it('should preserve the label range', function() {
        var chart = window.acquireChart({
          type: 'line',
          data: {
            labels: ['02/20 08:00', '02/21 09:00', '02/22 10:00', '02/23 11:00'],
            datasets: [{data: [0, 1, 2, 3, 4, 5]}]
          },
          options: {
            scales: {
              x: {
                type: 'time',
                bounds: 'ticks',
                time: {
                  parser: 'MM/DD HH:mm',
                  unit: 'day'
                }
              },
              y: {
                display: false
              }
            }
          }
        });

        var scale = chart.scales.x;
        var ticks = scale.getTicks();

        expect(scale.min).toEqual(ticks[0].value);
        expect(scale.max).toEqual(ticks[ticks.length - 1].value);
        expect(scale.getPixelForValue(moment('02/20 08:00', 'MM/DD HH:mm').valueOf())).toBeCloseToPixel(60);
        expect(scale.getPixelForValue(moment('02/23 11:00', 'MM/DD HH:mm').valueOf())).toBeCloseToPixel(426);
        expect(getLabels(scale)).toEqual([
          'Feb 20', 'Feb 21', 'Feb 22', 'Feb 23', 'Feb 24']);
      });
    });
  });

  describe('when min and/or max are defined', function() {
    ['auto', 'data', 'labels'].forEach(function(source) {
      ['data', 'ticks'].forEach(function(bounds) {
        describe('and ticks.source is "' + source + '" and bounds "' + bounds + '"', function() {
          beforeEach(function() {
            this.chart = window.acquireChart({
              type: 'line',
              data: {
                labels: ['02/20 08:00', '02/21 09:00', '02/22 10:00', '02/23 11:00'],
                datasets: [{data: [0, 1, 2, 3, 4, 5]}]
              },
              options: {
                scales: {
                  x: {
                    type: 'time',
                    bounds: bounds,
                    time: {
                      parser: 'MM/DD HH:mm',
                      unit: 'day'
                    },
                    ticks: {
                      source: source
                    }
                  },
                  y: {
                    display: false
                  }
                }
              }
            });
          });

          it ('should expand scale to the min/max range', function() {
            var chart = this.chart;
            var scale = chart.scales.x;
            var options = chart.options.scales.x;
            var min = '02/19 07:00';
            var max = '02/24 08:00';
            var minMillis = +moment(min, 'MM/DD HH:mm');
            var maxMillis = +moment(max, 'MM/DD HH:mm');

            options.min = min;
            options.max = max;
            chart.update();

            expect(scale.min).toEqual(minMillis);
            expect(scale.max).toEqual(maxMillis);
            expect(scale.getPixelForValue(minMillis)).toBeCloseToPixel(scale.left);
            expect(scale.getPixelForValue(maxMillis)).toBeCloseToPixel(scale.left + scale.width);
            scale.getTicks().forEach(function(tick) {
              expect(tick.value >= minMillis).toBeTruthy();
              expect(tick.value <= maxMillis).toBeTruthy();
            });
          });
          it ('should shrink scale to the min/max range', function() {
            var chart = this.chart;
            var scale = chart.scales.x;
            var options = chart.options.scales.x;
            var min = '02/21 07:00';
            var max = '02/22 20:00';
            var minMillis = +moment(min, 'MM/DD HH:mm');
            var maxMillis = +moment(max, 'MM/DD HH:mm');

            options.min = min;
            options.max = max;
            chart.update();

            expect(scale.min).toEqual(minMillis);
            expect(scale.max).toEqual(maxMillis);
            expect(scale.getPixelForValue(minMillis)).toBeCloseToPixel(scale.left);
            expect(scale.getPixelForValue(maxMillis)).toBeCloseToPixel(scale.left + scale.width);
            scale.getTicks().forEach(function(tick) {
              expect(tick.value >= minMillis).toBeTruthy();
              expect(tick.value <= maxMillis).toBeTruthy();
            });
          });
        });
      });
    });
  });

  ['auto', 'data', 'labels'].forEach(function(source) {
    ['timeseries', 'time'].forEach(function(type) {
      describe('when ticks.source is "' + source + '" and scale type is "' + type + '"', function() {
        beforeEach(function() {
          this.chart = window.acquireChart({
            type: 'line',
            data: {
              labels: ['2017', '2018', '2019', '2020', '2021'],
              datasets: [{data: [0, 1, 2, 3, 4]}]
            },
            options: {
              scales: {
                x: {
                  type: type,
                  time: {
                    parser: 'YYYY',
                    unit: 'year'
                  },
                  ticks: {
                    source: source
                  }
                }
              }
            }
          });
        });

        it ('should not add offset from the edges', function() {
          var scale = this.chart.scales.x;

          expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(scale.left);
          expect(scale.getPixelForValue(moment('2021').valueOf())).toBeCloseToPixel(scale.left + scale.width);
        });

        it ('should add offset from the edges if offset is true', function() {
          var chart = this.chart;
          var scale = chart.scales.x;
          var options = chart.options.scales.x;

          options.offset = true;
          chart.update();

          var numTicks = scale.ticks.length;
          var firstTickInterval = scale.getPixelForTick(1) - scale.getPixelForTick(0);
          var lastTickInterval = scale.getPixelForTick(numTicks - 1) - scale.getPixelForTick(numTicks - 2);

          expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(scale.left + firstTickInterval / 2);
          expect(scale.getPixelForValue(moment('2021').valueOf())).toBeCloseToPixel(scale.left + scale.width - lastTickInterval / 2);
        });

        it ('should not add offset if min and max extend the labels range', function() {
          var chart = this.chart;
          var scale = chart.scales.x;
          var options = chart.options.scales.x;

          options.min = '2012';
          options.max = '2051';
          chart.update();

          expect(scale.getPixelForValue(moment('2012').valueOf())).toBeCloseToPixel(scale.left);
          expect(scale.getPixelForValue(moment('2051').valueOf())).toBeCloseToPixel(scale.left + scale.width);
        });
      });
    });
  });

  it ('should handle offset when there are more data points than ticks', function() {
    const chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [{x: 631180800000, y: '31.84'}, {x: 631267200000, y: '30.89'}, {x: 631353600000, y: '33.00'}, {x: 631440000000, y: '33.52'}, {x: 631526400000, y: '32.24'}, {x: 631785600000, y: '32.74'}, {x: 631872000000, y: '31.45'}, {x: 631958400000, y: '32.60'}, {x: 632044800000, y: '31.77'}, {x: 632131200000, y: '32.45'}, {x: 632390400000, y: '31.13'}, {x: 632476800000, y: '31.82'}, {x: 632563200000, y: '30.81'}, {x: 632649600000, y: '30.07'}, {x: 632736000000, y: '29.31'}, {x: 632995200000, y: '29.82'}, {x: 633081600000, y: '30.20'}, {x: 633168000000, y: '30.78'}, {x: 633254400000, y: '30.72'}, {x: 633340800000, y: '31.62'}, {x: 633600000000, y: '30.64'}, {x: 633686400000, y: '32.36'}, {x: 633772800000, y: '34.66'}, {x: 633859200000, y: '33.96'}, {x: 633945600000, y: '34.20'}, {x: 634204800000, y: '32.20'}, {x: 634291200000, y: '32.44'}, {x: 634377600000, y: '32.72'}, {x: 634464000000, y: '32.95'}, {x: 634550400000, y: '32.95'}, {x: 634809600000, y: '30.88'}, {x: 634896000000, y: '29.44'}, {x: 634982400000, y: '29.36'}, {x: 635068800000, y: '28.84'}, {x: 635155200000, y: '30.85'}, {x: 635414400000, y: '32.00'}, {x: 635500800000, y: '32.74'}, {x: 635587200000, y: '33.16'}, {x: 635673600000, y: '34.73'}, {x: 635760000000, y: '32.89'}, {x: 636019200000, y: '32.41'}, {x: 636105600000, y: '31.15'}, {x: 636192000000, y: '30.63'}, {x: 636278400000, y: '29.60'}, {x: 636364800000, y: '29.31'}, {x: 636624000000, y: '29.83'}, {x: 636710400000, y: '27.97'}, {x: 636796800000, y: '26.18'}, {x: 636883200000, y: '26.06'}, {x: 636969600000, y: '26.34'}, {x: 637228800000, y: '27.75'}, {x: 637315200000, y: '29.05'}, {x: 637401600000, y: '28.82'}, {x: 637488000000, y: '29.43'}, {x: 637574400000, y: '29.53'}, {x: 637833600000, y: '28.50'}, {x: 637920000000, y: '28.87'}, {x: 638006400000, y: '28.11'}, {x: 638092800000, y: '27.79'}, {x: 638179200000, y: '28.18'}, {x: 638438400000, y: '28.27'}, {x: 638524800000, y: '28.29'}, {x: 638611200000, y: '29.63'}, {x: 638697600000, y: '29.13'}, {x: 638784000000, y: '26.57'}, {x: 639039600000, y: '27.19'}, {x: 639126000000, y: '27.48'}, {x: 639212400000, y: '27.79'}, {x: 639298800000, y: '28.48'}, {x: 639385200000, y: '27.88'}, {x: 639644400000, y: '25.63'}, {x: 639730800000, y: '25.02'}, {x: 639817200000, y: '25.26'}, {x: 639903600000, y: '25.00'}, {x: 639990000000, y: '26.23'}, {x: 640249200000, y: '26.22'}, {x: 640335600000, y: '26.36'}, {x: 640422000000, y: '25.45'}, {x: 640508400000, y: '24.62'}, {x: 640594800000, y: '26.65'}, {x: 640854000000, y: '26.28'}, {x: 640940400000, y: '27.25'}, {x: 641026800000, y: '25.93'}],
          backgroundColor: '#ff6666'
        }]
      },
      options: {
        scales: {
          x: {
            type: 'timeseries',
            offset: true,
            ticks: {
              source: 'data',
              autoSkip: true,
              autoSkipPadding: 0,
              maxRotation: 0
            }
          },
          y: {
            type: 'linear',
            grid: {
              drawBorder: false
            }
          }
        }
      },
      plugins: {
        legend: false
      }
    });
    const scale = chart.scales.x;
    expect(scale.getPixelForDecimal(0)).toBeCloseToPixel(29);
    expect(scale.getPixelForDecimal(1.0)).toBeCloseToPixel(512);
  });

  ['data', 'labels'].forEach(function(source) {
    ['timeseries', 'time'].forEach(function(type) {
      describe('when ticks.source is "' + source + '" and scale type is "' + type + '"', function() {
        beforeEach(function() {
          this.chart = window.acquireChart({
            type: 'line',
            data: {
              labels: ['2017', '2019', '2020', '2025', '2042'],
              datasets: [{data: [0, 1, 2, 3, 4, 5]}]
            },
            options: {
              scales: {
                x: {
                  id: 'x',
                  type: type,
                  time: {
                    parser: 'YYYY'
                  },
                  ticks: {
                    source: source
                  }
                }
              }
            }
          });
        });

        it ('should add offset if min and max extend the labels range and offset is true', function() {
          var chart = this.chart;
          var scale = chart.scales.x;
          var options = chart.options.scales.x;

          options.min = '2012';
          options.max = '2051';
          options.offset = true;
          chart.update();

          var numTicks = scale.ticks.length;
          var firstTickInterval = scale.getPixelForTick(1) - scale.getPixelForTick(0);
          var lastTickInterval = scale.getPixelForTick(numTicks - 1) - scale.getPixelForTick(numTicks - 2);
          expect(scale.getPixelForValue(moment('2012').valueOf())).toBeCloseToPixel(scale.left + firstTickInterval / 2);
          expect(scale.getPixelForValue(moment('2051').valueOf())).toBeCloseToPixel(scale.left + scale.width - lastTickInterval / 2);
        });
      });
    });
  });

  describe('Deprecations', function() {
    describe('options.time.displayFormats', function() {
      it('should generate defaults from adapter presets', function() {
        var chart = window.acquireChart({
          type: 'line',
          data: {},
          options: {
            scales: {
              x: {
                type: 'time'
              }
            }
          }
        });

        // NOTE: built-in adapter uses moment
        var expected = {
          datetime: 'MMM D, YYYY, h:mm:ss a',
          millisecond: 'h:mm:ss.SSS a',
          second: 'h:mm:ss a',
          minute: 'h:mm a',
          hour: 'hA',
          day: 'MMM D',
          week: 'll',
          month: 'MMM YYYY',
          quarter: '[Q]Q - YYYY',
          year: 'YYYY'
        };

        expect(chart.scales.x.options.time.displayFormats).toEqual(expected);
        expect(chart.options.scales.x.time.displayFormats).toEqual(expected);
      });

      it('should merge user formats with adapter presets', function() {
        var chart = window.acquireChart({
          type: 'line',
          data: {},
          options: {
            scales: {
              x: {
                type: 'time',
                time: {
                  displayFormats: {
                    millisecond: 'foo',
                    hour: 'bar',
                    month: 'bla'
                  }
                }
              }
            }
          }
        });

        // NOTE: built-in adapter uses moment
        var expected = {
          datetime: 'MMM D, YYYY, h:mm:ss a',
          millisecond: 'foo',
          second: 'h:mm:ss a',
          minute: 'h:mm a',
          hour: 'bar',
          day: 'MMM D',
          week: 'll',
          month: 'bla',
          quarter: '[Q]Q - YYYY',
          year: 'YYYY'
        };

        expect(chart.scales.x.options.time.displayFormats).toEqual(expected);
        expect(chart.options.scales.x.time.displayFormats).toEqual(expected);
      });
    });
  });
});
