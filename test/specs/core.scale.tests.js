function getLabels(scale) {
  return scale.ticks.map(t => t.label);
}

describe('Core.scale', function() {
  describe('auto', jasmine.fixture.specs('core.scale'));

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
});
