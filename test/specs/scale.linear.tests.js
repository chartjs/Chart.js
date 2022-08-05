function getLabels(scale) {
  return scale.ticks.map(t => t.label);
}

describe('Linear Scale', function() {
  describe('auto', jasmine.fixture.specs('scale.linear'));

  it('Should register the constructor with the registry', function() {
    var Constructor = Chart.registry.getScale('linear');
    expect(Constructor).not.toBe(undefined);
    expect(typeof Constructor).toBe('function');
  });

  it('Should have the correct default config', function() {
    var defaultConfig = Chart.defaults.scales.linear;

    expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
  });

  it('Should correctly determine the max & min data values', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [10, 5, 0, -5, 78, -100]
        }, {
          yAxisID: 'y2',
          data: [-1000, 1000],
        }, {
          yAxisID: 'y',
          data: [150]
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear'
          },
          y2: {
            type: 'linear',
            position: 'right',
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(-100);
    expect(chart.scales.y.max).toBe(150);
  });

  it('Should handle when only a min value is provided', () => {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [200]
        }],
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            min: 250
          }
        }
      }
    });

    expect(chart.scales.y.min).toBe(250);
  });

  it('Should handle when only a max value is provided', () => {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [200]
        }],
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            max: 150
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.max).toBe(150);
  });

  it('Should correctly determine the max & min of string data values', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: ['10', '5', '0', '-5', '78', '-100']
        }, {
          yAxisID: 'y2',
          data: ['-1000', '1000'],
        }, {
          yAxisID: 'y',
          data: ['150']
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear'
          },
          y2: {
            type: 'linear',
            position: 'right'
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(-100);
    expect(chart.scales.y.max).toBe(150);
  });

  it('Should correctly determine the max & min when no values provided and suggested minimum and maximum are set', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: []
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            suggestedMin: -10,
            suggestedMax: 15
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(-10);
    expect(chart.scales.y.max).toBe(15);
  });

  it('Should correctly determine the max & min when no datasets are associated and suggested minimum and maximum are set', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: []
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            suggestedMin: -10,
            suggestedMax: 0
          }
        }
      }
    });

    expect(chart.scales.y.min).toBe(-10);
    expect(chart.scales.y.max).toBe(0);
  });

  it('Should correctly determine the max & min data values ignoring hidden datasets', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: ['10', '5', '0', '-5', '78', '-100']
        }, {
          yAxisID: 'y2',
          data: ['-1000', '1000'],
        }, {
          yAxisID: 'y',
          data: ['150'],
          hidden: true
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear'
          },
          y2: {
            position: 'right',
            type: 'linear'
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(-100);
    expect(chart.scales.y.max).toBe(80);
  });

  it('Should correctly determine the max & min data values ignoring data that is NaN', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [null, 90, NaN, undefined, 45, 30, Infinity, -Infinity]
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            beginAtZero: false
          }
        }
      }
    });

    expect(chart.scales.y.min).toBe(30);
    expect(chart.scales.y.max).toBe(90);

    // Scale is now stacked
    chart.scales.y.options.stacked = true;
    chart.update();

    expect(chart.scales.y.min).toBe(30);
    expect(chart.scales.y.max).toBe(90);

    chart.scales.y.options.beginAtZero = true;
    chart.update();

    expect(chart.scales.y.min).toBe(0);
    expect(chart.scales.y.max).toBe(90);
  });

  it('Should correctly determine the max & min data values for small numbers', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [-1e-8, 3e-8, -4e-8, 6e-8]
        }],
        labels: ['a', 'b', 'c', 'd']
      },
      options: {
        scales: {
          y: {
            type: 'linear'
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min * 1e8).toBeCloseTo(-4);
    expect(chart.scales.y.max * 1e8).toBeCloseTo(6);
  });

  it('Should correctly determine the max & min for scatter data', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [{
            x: 10,
            y: 100
          }, {
            x: -10,
            y: 0
          }, {
            x: 0,
            y: 0
          }, {
            x: 99,
            y: 7
          }]
        }],
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });
    chart.update();

    expect(chart.scales.x.min).toBe(-20);
    expect(chart.scales.x.max).toBe(100);
    expect(chart.scales.y.min).toBe(0);
    expect(chart.scales.y.max).toBe(100);
  });

  it('Should correctly get the label for the given index', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [{
            x: 10,
            y: 100
          }, {
            x: -10,
            y: 0
          }, {
            x: 0,
            y: 0
          }, {
            x: 99,
            y: 7
          }]
        }],
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });
    chart.update();

    expect(chart.scales.y.getLabelForValue(7)).toBe('7');
  });

  it('Should correctly use the locale setting when getting a label', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [{
            x: 10,
            y: 100
          }, {
            x: -10,
            y: 0
          }, {
            x: 0,
            y: 0
          }, {
            x: 99,
            y: 7
          }]
        }],
      },
      options: {
        locale: 'de-DE',
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });
    chart.update();

    expect(chart.scales.y.getLabelForValue(7.07)).toBe('7,07');
  });

  it('Should correctly determine the min and max data values when stacked mode is turned on', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [10, 5, 0, -5, 78, -100],
          type: 'bar'
        }, {
          yAxisID: 'y2',
          data: [-1000, 1000],
        }, {
          yAxisID: 'y',
          data: [150, 0, 0, -100, -10, 9],
          type: 'bar'
        }, {
          yAxisID: 'y',
          data: [10, 10, 10, 10, 10, 10],
          type: 'line'
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            stacked: true
          },
          y2: {
            position: 'right',
            type: 'linear'
          }
        }
      }
    });
    chart.update();

    expect(chart.scales.y.min).toBe(-150);
    expect(chart.scales.y.max).toBe(200);
  });

  it('Should correctly determine the min and max data values when stacked mode is turned on and there are hidden datasets', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [10, 5, 0, -5, 78, -100],
        }, {
          yAxisID: 'y2',
          data: [-1000, 1000],
        }, {
          yAxisID: 'y',
          data: [150, 0, 0, -100, -10, 9],
        }, {
          yAxisID: 'y',
          data: [10, 20, 30, 40, 50, 60],
          hidden: true
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            stacked: true
          },
          y2: {
            position: 'right',
            type: 'linear'
          }
        }
      }
    });
    chart.update();

    expect(chart.scales.y.min).toBe(-150);
    expect(chart.scales.y.max).toBe(200);
  });

  it('Should correctly determine the min and max data values when stacked mode is turned on there are multiple types of datasets', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          type: 'bar',
          data: [10, 5, 0, -5, 78, -100]
        }, {
          type: 'line',
          data: [10, 10, 10, 10, 10, 10],
        }, {
          type: 'bar',
          data: [150, 0, 0, -100, -10, 9]
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            stacked: true
          }
        }
      }
    });

    chart.scales.y.determineDataLimits();
    expect(chart.scales.y.min).toBe(-105);
    expect(chart.scales.y.max).toBe(160);
  });

  it('Should ensure that the scale has a max and min that are not equal', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear'
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(0);
    expect(chart.scales.y.max).toBe(1);
  });

  it('Should ensure that the scale has a max and min that are not equal - large positive numbers', function() {
    // https://github.com/chartjs/Chart.js/issues/9377
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          // Value larger than Number.MAX_SAFE_INTEGER
          data: [10000000000000000]
        }],
        labels: ['a']
      },
      options: {
        scales: {
          y: {
            type: 'linear'
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(10000000000000000 * 0.95);
    expect(chart.scales.y.max).toBe(10000000000000000 * 1.05);
  });

  it('Should ensure that the scale has a max and min that are not equal - large negative numbers', function() {
    // https://github.com/chartjs/Chart.js/issues/9377
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          // Value larger than Number.MAX_SAFE_INTEGER
          data: [-10000000000000000]
        }],
        labels: ['a']
      },
      options: {
        scales: {
          y: {
            type: 'linear'
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.max).toBe(-10000000000000000 * 0.95);
    expect(chart.scales.y.min).toBe(-10000000000000000 * 1.05);
  });

  it('Should ensure that the scale has a max and min that are not equal when beginAtZero is set', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            beginAtZero: true
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(0);
    expect(chart.scales.y.max).toBe(1);
  });

  it('Should use the suggestedMin and suggestedMax options', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [1, 1, 1, 2, 1, 0]
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            suggestedMax: 10,
            suggestedMin: -10
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(-10);
    expect(chart.scales.y.max).toBe(10);
  });

  it('Should use the min and max options', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [1, 1, 1, 2, 1, 0]
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            max: 1010,
            min: -1010
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(-1010);
    expect(chart.scales.y.max).toBe(1010);
    var labels = getLabels(chart.scales.y);
    expect(labels[0]).toBe('-1,010');
    expect(labels[labels.length - 1]).toBe('1,010');
  });

  it('Should use min, max and stepSize to create fixed spaced ticks', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [10, 3, 6, 8, 3, 1]
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            min: 1,
            max: 11,
            ticks: {
              stepSize: 2
            }
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(1);
    expect(chart.scales.y.max).toBe(11);
    expect(getLabels(chart.scales.y)).toEqual(['1', '3', '5', '7', '9', '11']);
  });

  it('Should not generate insane amounts of ticks with small stepSize and large range', function() {
    var chart = window.acquireChart({
      type: 'bar',
      options: {
        scales: {
          y: {
            type: 'linear',
            min: 1,
            max: 1E10,
            ticks: {
              stepSize: 2,
              autoSkip: false
            }
          }
        }
      }
    });

    expect(chart.scales.y.min).toBe(1);
    expect(chart.scales.y.max).toBe(1E10);
    expect(chart.scales.y.ticks.length).toBeLessThanOrEqual(1000);
  });

  it('Should create decimal steps if stepSize is a decimal number', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [10, 3, 6, 8, 3, 1]
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            ticks: {
              stepSize: 2.5
            }
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(chart.scales.y.min).toBe(0);
    expect(chart.scales.y.max).toBe(10);
    expect(getLabels(chart.scales.y)).toEqual(['0', '2.5', '5', '7.5', '10']);
  });

  describe('precision', function() {
    it('Should create integer steps if precision is 0', function() {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            yAxisID: 'y',
            data: [0, 1, 2, 1, 0, 1]
          }],
          labels: ['a', 'b', 'c', 'd', 'e', 'f']
        },
        options: {
          scales: {
            y: {
              type: 'linear',
              ticks: {
                precision: 0
              }
            }
          }
        }
      });

      expect(chart.scales.y).not.toEqual(undefined); // must construct
      expect(chart.scales.y.min).toBe(0);
      expect(chart.scales.y.max).toBe(2);
      expect(getLabels(chart.scales.y)).toEqual(['0', '1', '2']);
    });

    it('Should round the step size to the given number of decimal places', function() {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            yAxisID: 'y',
            data: [0, 0.001, 0.002, 0.003, 0, 0.001]
          }],
          labels: ['a', 'b', 'c', 'd', 'e', 'f']
        },
        options: {
          scales: {
            y: {
              type: 'linear',
              ticks: {
                precision: 2
              }
            }
          }
        }
      });

      expect(chart.scales.y).not.toEqual(undefined); // must construct
      expect(chart.scales.y.min).toBe(0);
      expect(chart.scales.y.max).toBe(0.01);
      expect(getLabels(chart.scales.y)).toEqual(['0', '0.01']);
    });
  });


  it('should forcibly include 0 in the range if the beginAtZero option is used', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [20, 30, 40, 50]
        }],
        labels: ['a', 'b', 'c', 'd']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            beginAtZero: false
          }
        }
      }
    });

    expect(chart.scales.y).not.toEqual(undefined); // must construct
    expect(getLabels(chart.scales.y)).toEqual(['20', '25', '30', '35', '40', '45', '50']);

    chart.scales.y.options.beginAtZero = true;
    chart.update();
    expect(getLabels(chart.scales.y)).toEqual(['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50']);

    chart.data.datasets[0].data = [-20, -30, -40, -50];
    chart.update();
    expect(getLabels(chart.scales.y)).toEqual(['-50', '-45', '-40', '-35', '-30', '-25', '-20', '-15', '-10', '-5', '0']);

    chart.scales.y.options.beginAtZero = false;
    chart.update();
    expect(getLabels(chart.scales.y)).toEqual(['-50', '-45', '-40', '-35', '-30', '-25', '-20']);
  });

  it('Should generate tick marks in the correct order in reversed mode', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['a', 'b', 'c', 'd']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            reverse: true
          }
        }
      }
    });

    expect(getLabels(chart.scales.y)).toEqual(['80', '70', '60', '50', '40', '30', '20', '10', '0']);
    expect(chart.scales.y.start).toBe(80);
    expect(chart.scales.y.end).toBe(0);
  });

  it('should use the correct number of decimal places in the default format function', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [0.06, 0.005, 0, 0.025, 0.0078]
        }],
        labels: ['a', 'b', 'c', 'd']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
          }
        }
      }
    });
    expect(getLabels(chart.scales.y)).toEqual(['0', '0.01', '0.02', '0.03', '0.04', '0.05', '0.06']);
  });

  it('Should correctly limit the maximum number of ticks', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        labels: ['a', 'b'],
        datasets: [{
          data: [0.5, 2.5]
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });

    expect(getLabels(chart.scales.y)).toEqual(['0.5', '1.0', '1.5', '2.0', '2.5']);

    chart.options.scales.y.ticks.maxTicksLimit = 11;
    chart.update();

    expect(getLabels(chart.scales.y)).toEqual(['0.5', '1.0', '1.5', '2.0', '2.5']);

    chart.options.scales.y.ticks.maxTicksLimit = 21;
    chart.update();

    expect(getLabels(chart.scales.y)).toEqual([
      '0.5',
      '0.6', '0.7', '0.8', '0.9', '1.0', '1.1', '1.2', '1.3', '1.4', '1.5',
      '1.6', '1.7', '1.8', '1.9', '2.0', '2.1', '2.2', '2.3', '2.4', '2.5'
    ]);

    chart.options.scales.y.ticks.maxTicksLimit = 11;
    chart.options.scales.y.ticks.stepSize = 0.01;
    chart.update();

    expect(getLabels(chart.scales.y)).toEqual(['0.5', '1.0', '1.5', '2.0', '2.5']);

    chart.options.scales.y.min = 0.3;
    chart.options.scales.y.max = 2.8;
    chart.update();

    expect(getLabels(chart.scales.y)).toEqual(['0.3', '0.8', '1.3', '1.8', '2.3', '2.8']);
  });

  it('Should bound to data', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['a', 'b'],
        datasets: [{
          data: [1, 99]
        }]
      },
      options: {
        scales: {
          y: {
            bounds: 'data'
          }
        }
      }
    });

    expect(chart.scales.y.min).toEqual(1);
    expect(chart.scales.y.max).toEqual(99);
  });

  it('Should build labels using the user supplied callback', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          yAxisID: 'y',
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['a', 'b', 'c', 'd']
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            ticks: {
              callback: function(value, index) {
                return index.toString();
              }
            }
          }
        }
      }
    });

    // Just the index
    expect(getLabels(chart.scales.y)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
  });

  it('Should get the correct pixel value for a point', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: [-1, 1],
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [-1, 1]
        }],
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });

    var xScale = chart.scales.x;
    expect(xScale.getPixelForValue(1)).toBeCloseToPixel(501); // right - paddingRight
    expect(xScale.getPixelForValue(-1)).toBeCloseToPixel(31 + 3); // left + paddingLeft + tick padding
    expect(xScale.getPixelForValue(0)).toBeCloseToPixel(266 + 3 / 2); // halfway*/

    expect(xScale.getValueForPixel(501)).toBeCloseTo(1, 1e-2);
    expect(xScale.getValueForPixel(31)).toBeCloseTo(-1, 1e-2);
    expect(xScale.getValueForPixel(266)).toBeCloseTo(0, 1e-2);

    var yScale = chart.scales.y;
    expect(yScale.getPixelForValue(1)).toBeCloseToPixel(32); // right - paddingRight
    expect(yScale.getPixelForValue(-1)).toBeCloseToPixel(484); // left + paddingLeft
    expect(yScale.getPixelForValue(0)).toBeCloseToPixel(258); // halfway*/

    expect(yScale.getValueForPixel(32)).toBeCloseTo(1, 1e-2);
    expect(yScale.getValueForPixel(484)).toBeCloseTo(-1, 1e-2);
    expect(yScale.getValueForPixel(258)).toBeCloseTo(0, 1e-2);
  });

  it('should fit correctly', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [{
            x: 10,
            y: 100
          }, {
            x: -10,
            y: 0
          }, {
            x: 0,
            y: 0
          }, {
            x: 99,
            y: 7
          }]
        }],
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });

    var xScale = chart.scales.x;
    var yScale = chart.scales.y;
    expect(xScale.paddingTop).toBeCloseToPixel(0);
    expect(xScale.paddingBottom).toBeCloseToPixel(0);
    expect(xScale.paddingLeft).toBeCloseToPixel(12);
    expect(xScale.paddingRight).toBeCloseToPixel(13.5);
    expect(xScale.width).toBeCloseToPixel(468 - 3); // minus tick padding
    expect(xScale.height).toBeCloseToPixel(30);

    expect(yScale.paddingTop).toBeCloseToPixel(10);
    expect(yScale.paddingBottom).toBeCloseToPixel(10);
    expect(yScale.paddingLeft).toBeCloseToPixel(0);
    expect(yScale.paddingRight).toBeCloseToPixel(0);
    expect(yScale.width).toBeCloseToPixel(31 + 3); // plus tick padding
    expect(yScale.height).toBeCloseToPixel(450);

    // Extra size when scale label showing
    xScale.options.title.display = true;
    yScale.options.title.display = true;
    chart.update();

    expect(xScale.paddingTop).toBeCloseToPixel(0);
    expect(xScale.paddingBottom).toBeCloseToPixel(0);
    expect(xScale.paddingLeft).toBeCloseToPixel(12);
    expect(xScale.paddingRight).toBeCloseToPixel(13.5);
    expect(xScale.width).toBeCloseToPixel(442);
    expect(xScale.height).toBeCloseToPixel(50);

    expect(yScale.paddingTop).toBeCloseToPixel(10);
    expect(yScale.paddingBottom).toBeCloseToPixel(10);
    expect(yScale.paddingLeft).toBeCloseToPixel(0);
    expect(yScale.paddingRight).toBeCloseToPixel(0);
    expect(yScale.width).toBeCloseToPixel(58);
    expect(yScale.height).toBeCloseToPixel(429);
  });

  it('should fit correctly when display is turned off', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [{
            x: 10,
            y: 100
          }, {
            x: -10,
            y: 0
          }, {
            x: 0,
            y: 0
          }, {
            x: 99,
            y: 7
          }]
        }],
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            type: 'linear',
            grid: {
              drawTicks: false,
            },
            border: {
              display: false
            },
            title: {
              display: false,
              lineHeight: 1.2
            },
            ticks: {
              display: false,
              padding: 0
            }
          }
        }
      }
    });

    var yScale = chart.scales.y;
    expect(yScale.width).toBeCloseToPixel(0);
  });

  it('max and min value should be valid and finite when charts datasets are hidden', function() {
    var barData = {
      labels: ['S1', 'S2', 'S3'],
      datasets: [{
        label: 'Closed',
        backgroundColor: '#382765',
        data: [2500, 2000, 1500]
      }, {
        label: 'In Progress',
        backgroundColor: '#7BC225',
        data: [1000, 2000, 1500]
      }, {
        label: 'Assigned',
        backgroundColor: '#ffC225',
        data: [1000, 2000, 1500]
      }]
    };

    var chart = window.acquireChart({
      type: 'bar',
      data: barData,
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });

    barData.datasets.forEach(function(data, index) {
      var meta = chart.getDatasetMeta(index);
      meta.hidden = true;
      chart.update();
    });

    expect(chart.scales.x.min).toEqual(0);
    expect(chart.scales.x.max).toEqual(1);
  });

  it('max and min value should be valid when min is set and all datasets are hidden', function() {
    var barData = {
      labels: ['S1', 'S2', 'S3'],
      datasets: [{
        label: 'dataset 1',
        backgroundColor: '#382765',
        data: [2500, 2000, 1500],
        hidden: true,
      }]
    };

    var chart = window.acquireChart({
      type: 'bar',
      data: barData,
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            min: 20
          }
        }
      }
    });

    expect(chart.scales.x.min).toEqual(20);
    expect(chart.scales.x.max).toEqual(21);
  });

  it('min settings should be used if set to zero', function() {
    var barData = {
      labels: ['S1', 'S2', 'S3'],
      datasets: [{
        label: 'dataset 1',
        backgroundColor: '#382765',
        data: [2500, 2000, 1500]
      }]
    };

    var chart = window.acquireChart({
      type: 'bar',
      data: barData,
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            min: 0,
            max: 3000
          }
        }
      }
    });

    expect(chart.scales.x.min).toEqual(0);
  });

  it('max settings should be used if set to zero', function() {
    var barData = {
      labels: ['S1', 'S2', 'S3'],
      datasets: [{
        label: 'dataset 1',
        backgroundColor: '#382765',
        data: [-2500, -2000, -1500]
      }]
    };

    var chart = window.acquireChart({
      type: 'bar',
      data: barData,
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            min: -3000,
            max: 0
          }
        }
      }
    });

    expect(chart.scales.x.max).toEqual(0);
  });

  it('Should get correct pixel values when horizontal', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [0.05, -25, 10, 15, 20, 25, 30, 35]
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            type: 'linear',
          }
        }
      }
    });

    var start = chart.chartArea.left;
    var end = chart.chartArea.right;
    var min = -30;
    var max = 40;
    var scale = chart.scales.x;

    expect(scale.getPixelForValue(max)).toBeCloseToPixel(end);
    expect(scale.getPixelForValue(min)).toBeCloseToPixel(start);
    expect(scale.getValueForPixel(end)).toBeCloseTo(max, 4);
    expect(scale.getValueForPixel(start)).toBeCloseTo(min, 4);

    scale.options.reverse = true;
    chart.update();

    start = chart.chartArea.left;
    end = chart.chartArea.right;

    expect(scale.getPixelForValue(max)).toBeCloseToPixel(start);
    expect(scale.getPixelForValue(min)).toBeCloseToPixel(end);
    expect(scale.getValueForPixel(end)).toBeCloseTo(min, 4);
    expect(scale.getValueForPixel(start)).toBeCloseTo(max, 4);
  });

  it('Should get correct pixel values when vertical', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [0.05, -25, 10, 15, 20, 25, 30, 35]
        }]
      },
      options: {
        scales: {
          y: {
            type: 'linear',
          }
        }
      }
    });

    var start = chart.chartArea.bottom;
    var end = chart.chartArea.top;
    var min = -30;
    var max = 40;
    var scale = chart.scales.y;

    expect(scale.getPixelForValue(max)).toBeCloseToPixel(end);
    expect(scale.getPixelForValue(min)).toBeCloseToPixel(start);
    expect(scale.getValueForPixel(end)).toBeCloseTo(max, 4);
    expect(scale.getValueForPixel(start)).toBeCloseTo(min, 4);

    scale.options.reverse = true;
    chart.update();

    start = chart.chartArea.bottom;
    end = chart.chartArea.top;

    expect(scale.getPixelForValue(max)).toBeCloseToPixel(start);
    expect(scale.getPixelForValue(min)).toBeCloseToPixel(end);
    expect(scale.getValueForPixel(end)).toBeCloseTo(min, 4);
    expect(scale.getValueForPixel(start)).toBeCloseTo(max, 4);
  });

  it('should not throw errors when chart size is negative', function() {
    function createChart() {
      return window.acquireChart({
        type: 'bar',
        data: {
          labels: [0, 1, 2, 3, 4, 5, 6, 7, '7+'],
          datasets: [{
            data: [29.05, 4, 15.69, 11.69, 2.84, 4, 0, 3.84, 4],
          }],
        },
        options: {
          plugins: false,
          layout: {
            padding: {top: 30, left: 1, right: 1, bottom: 1}
          }
        }
      }, {
        canvas: {
          height: 0,
          width: 0
        }
      });
    }

    expect(createChart).not.toThrow();
  });
});
