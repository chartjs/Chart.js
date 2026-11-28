function getLabels(scale) {
  return scale.ticks.map(t => t.label);
}

describe('Linear Scale', function() {
  it('Should register the constructor with the registry', function() {
    var Constructor = Chart.registry.getScale('linear');
    expect(Constructor).not.toBe(undefined);
    expect(typeof Constructor).toBe('function');
  });

  it('Should have the correct default config', function() {
    var defaultConfig = Chart.defaults.scales.linear;

    expect(defaultConfig.ticks.callback).toEqual(expect.any(Function));
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

  [5, '20%'].forEach(function(grace) {
    [{min: 24.4, max: 75.6}, {min: 24.4}, {max: 75.6}].forEach(function(bounds) {
      it('should apply grace ' + grace + ' only to data bounds with ' + JSON.stringify(bounds), function() {
        var chart = window.acquireChart({
          type: 'line',
          data: {
            datasets: [{data: Array.from({length: 11}, (_, i) => ({x: i, y: 10 + i * 8}))}]
          },
          options: {
            parsing: false,
            scales: {
              x: {type: 'linear'},
              y: {...bounds, grace}
            }
          }
        });
        var scale = chart.scales.y;
        var ticks = scale.ticks.map(tick => tick.value);

        if (bounds.min !== undefined) {
          expect(scale.min).toBe(bounds.min);
          expect(ticks.every(value => value >= bounds.min)).toBe(true);
        } else {
          expect(scale.min).toBeLessThan(10);
        }
        if (bounds.max !== undefined) {
          expect(scale.max).toBe(bounds.max);
          expect(ticks.every(value => value <= bounds.max)).toBe(true);
        } else {
          expect(scale.max).toBeGreaterThan(90);
        }
        expect(ticks).toEqual(ticks.slice().sort((a, b) => a - b));

        if (bounds.min !== undefined && bounds.max !== undefined) {
          chart.options.scales.y.min = 29.4;
          chart.options.scales.y.max = 70.6;
          chart.update();
          expect(scale.min).toBe(29.4);
          expect(scale.max).toBe(70.6);

          delete chart.options.scales.y.min;
          delete chart.options.scales.y.max;
          chart.update();
          expect(scale.min).toBeLessThan(10);
          expect(scale.max).toBeGreaterThan(90);
        }
      });
    });
  });

  it('should continue to add grace to suggested bounds', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['a', 'b'],
        datasets: [{data: [10, 90]}]
      },
      options: {
        scales: {
          y: {suggestedMin: -20, suggestedMax: 120, grace: 10}
        }
      }
    });

    expect(chart.scales.y.min).toBeLessThan(-20);
    expect(chart.scales.y.max).toBeGreaterThan(120);
  });

  it('should generate the same ticks for explicit bounds with and without grace', function() {
    function getTicks(grace) {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b'],
          datasets: [{data: [10, 90]}]
        },
        options: {
          scales: {
            y: {min: 0, max: 100, grace}
          }
        }
      });
      return chart.scales.y.ticks.map(tick => tick.value);
    }

    expect(getTicks('10%')).toEqual(getTicks(undefined));
    expect(getTicks(20)).toEqual(getTicks(undefined));
  });

  it('should not apply grace when min and max are the same', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['a', 'b'],
        datasets: [{data: [1, 9]}]
      },
      options: {
        scales: {
          y: {min: 5, max: 5, grace: 5}
        }
      }
    });
    var ticks = chart.scales.y.ticks.map(tick => tick.value);

    expect(chart.scales.y.min).toBe(5);
    expect(chart.scales.y.max).toBe(5);
    expect(ticks).toEqual(ticks.slice().sort((a, b) => a - b));
  });

  [[[10, 20, 80], 90], [[10, 20, 90], 100]].forEach(function([data, last]) {
    it('should end the axis at its last tick with grace and stepSize for data ' + JSON.stringify(data), function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data}]
        },
        options: {
          scales: {
            y: {grace: '10%', ticks: {stepSize: 10}}
          }
        }
      });
      var scale = chart.scales.y;
      var expected = Array.from({length: last / 10 + 1}, (_, i) => i * 10);

      expect(scale.ticks.map(tick => tick.value)).toEqual(expected);
      expect(scale.min).toBe(0);
      expect(scale.max).toBe(last);
    });
  });

  it('should count the stepSize limit on min and max when buildTicks runs without a range', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['a', 'b', 'c'],
        datasets: [{data: [10, 20, 80]}]
      },
      options: {
        scales: {
          y: {ticks: {stepSize: 10}}
        }
      }
    });
    var scale = chart.scales.y;
    scale._range = undefined;

    expect(scale.buildTicks().map(tick => tick.value)).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
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

  it('Should use stepSize increments and keep max as the final shorter interval', function() {
    var chart = window.acquireChart({
      type: 'bar',
      options: {
        scales: {
          y: {
            type: 'linear',
            min: 0,
            max: 3333,
            ticks: {
              stepSize: 500
            }
          }
        }
      }
    });

    expect(chart.scales.y.ticks.map(tick => tick.value)).toEqual([
      0, 500, 1000, 1500, 2000, 2500, 3000, 3333
    ]);
  });

  it('Should use stepSize for floating point ranges that are effectively divisible', function() {
    var chart = window.acquireChart({
      type: 'bar',
      options: {
        scales: {
          y: {
            type: 'linear',
            min: 0,
            max: 0.3,
            ticks: {
              stepSize: 0.1
            }
          }
        }
      }
    });

    expect(chart.scales.y.ticks.map(tick => +tick.value.toFixed(1))).toEqual([0, 0.1, 0.2, 0.3]);
  });

  it('Should use stepSize when the range is divisible within the precision of min and max', function() {
    var chart = window.acquireChart({
      type: 'bar',
      options: {
        scales: {
          y: {
            type: 'linear',
            min: 8089.45,
            max: 8089.66,
            ticks: {
              stepSize: 0.03
            }
          }
        }
      }
    });

    expect(chart.scales.y.ticks.map(tick => +tick.value.toFixed(2))).toEqual([
      8089.45, 8089.48, 8089.51, 8089.54, 8089.57, 8089.6, 8089.63, 8089.66
    ]);
  });

  it('Should use stepSize when a negative range is divisible within the precision of min and max', function() {
    var chart = window.acquireChart({
      type: 'bar',
      options: {
        scales: {
          y: {
            type: 'linear',
            min: -8089.66,
            max: -8089.45,
            ticks: {
              stepSize: 0.03
            }
          }
        }
      }
    });

    expect(chart.scales.y.ticks.map(tick => +tick.value.toFixed(2))).toEqual([
      -8089.66, -8089.63, -8089.6, -8089.57, -8089.54, -8089.51, -8089.48, -8089.45
    ]);
  });

  it('Should not treat a step count a fraction of a step from whole as whole', function() {
    var chart = window.acquireChart({
      type: 'bar',
      options: {
        scales: {
          y: {
            type: 'linear',
            min: 0,
            max: 3.0005,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });

    // 3 is replaced by max, because the two labels would overlap.
    expect(chart.scales.y.ticks.map(tick => tick.value)).toEqual([0, 1, 2, 3.0005]);
  });

  it('Should not generate any ticks > max if max is specified', function() {
    var chart = window.acquireChart({
      type: 'line',
      options: {
        scales: {
          x: {
            type: 'linear',
            min: 2.404e-8,
            max: 2.4143e-8,
            ticks: {
              includeBounds: false,
            },
          },
        },
      },
    });

    expect(chart.scales.x.min).toBe(2.404e-8);
    expect(chart.scales.x.max).toBe(2.4143e-8);
    expect(chart.scales.x.ticks[chart.scales.x.ticks.length - 1].value).toBeLessThanOrEqual(2.4143e-8);
  });

  it('Should generate ticks free of floating point drift when min and max are not round', function() {
    var chart = window.acquireChart({
      type: 'line',
      options: {
        scales: {
          y: {
            type: 'linear',
            min: 49.894,
            max: 51.5264,
          },
        },
      },
    });

    var values = chart.scales.y.ticks.map(function(tick) {
      return tick.value;
    });

    // the ticks between the bounds are multiples of the 0.2 spacing,
    // so none of them needs more than four decimals to be written exactly
    values.forEach(function(value) {
      expect(value).toBe(Math.round(value * 1e4) / 1e4);
    });
    expect(values).toContain(50);
    expect(values).toContain(51);
  });

  it('Should generate ticks free of floating point drift on a negative range', function() {
    var chart = window.acquireChart({
      type: 'line',
      options: {
        scales: {
          y: {
            type: 'linear',
            min: -49.706,
            max: -48.0736,
          },
        },
      },
    });

    var values = chart.scales.y.ticks.map(function(tick) {
      return tick.value;
    });

    // without the rounding of the nice bounds some of these come out as -49.400000000000006, -49.00000000000001, ...
    expect(values).toEqual([-49.706, -49.6, -49.4, -49.2, -49, -48.8, -48.6, -48.4, -48.2, -48.0736]);
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

  function getDataBoundsScale(data, y) {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['a', 'b'],
        datasets: [{data}]
      },
      options: {
        scales: {
          y: {bounds: 'data', ...y, ticks: {autoSkip: false, ...y.ticks}}
        }
      }
    });
    return chart.scales.y;
  }

  it('Should leave the data bounds out of the ticks with bounds: data and includeBounds: false', function() {
    var scale = getDataBoundsScale([0, 97], {ticks: {includeBounds: false}});

    expect(scale.ticks.map(tick => tick.value)).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    expect(scale.min).toBe(0);
    expect(scale.max).toBe(97);
  });

  it('Should place the ticks on the grid between off-grid data bounds with bounds: data', function() {
    var scale = getDataBoundsScale([0.31, 0.97], {});

    expect(scale.ticks.map(tick => tick.value)).toEqual([0.31, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.97]);
  });

  it('Should give a data range below the minimum spacing only its two bounds with bounds: data', function() {
    // The data bounds are not user bounds: they do not keep the ticks going below
    // the minimum spacing, where 100 would repeat.
    var scale = getDataBoundsScale([100, 100.00000000000003], {});

    expect(scale.ticks.map(tick => tick.value)).toEqual([100, 100.00000000000003]);
  });

  it('Should space count ticks evenly between the data bounds with bounds: data', function() {
    var scale = getDataBoundsScale([1, 99], {ticks: {count: 3}});

    expect(scale.ticks.map(tick => tick.value)).toEqual([1, 50, 99]);
  });

  it('Should leave the data minimum out of the ticks with bounds: data and includeBounds: false', function() {
    var scale = getDataBoundsScale([0.31, 0.97], {ticks: {includeBounds: false}});

    expect(scale.ticks.map(tick => tick.value)).toEqual([0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
    expect(scale.min).toBe(0.31);
    expect(scale.max).toBe(0.97);
  });

  it('Should drop a grid tick within one label of the data minimum with bounds: data', function() {
    var scale = getDataBoundsScale([0.39, 0.97], {});

    expect(scale.ticks.map(tick => tick.value)).toEqual([0.39, 0.5, 0.6, 0.7, 0.8, 0.9, 0.97]);
  });

  // One bound from the data is enough: only a user min and max together space
  // stepSize ticks from min.
  [
    {data: [3, 53], y: {}},
    {data: [3, 40], y: {max: 53}},
    {data: [10, 53], y: {min: 3}}
  ].forEach(function({data, y}) {
    it('Should align stepSize ticks to multiples of the step with bounds: data, data ' + JSON.stringify(data) + ' and ' + JSON.stringify(y), function() {
      var scale = getDataBoundsScale(data, {...y, ticks: {stepSize: 10}});

      expect(scale.ticks.map(tick => tick.value)).toEqual([3, 10, 20, 30, 40, 50, 53]);
    });
  });

  function getDataBoundsXScale(data, width) {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{data: data.map((x, i) => ({x, y: i}))}]
      },
      options: {
        scales: {
          x: {bounds: 'data', ticks: {autoSkip: false}}
        }
      }
    }, {
      canvas: {width, height: 200}
    });
    return chart.scales.x;
  }

  [
    // noise digits made the minimum look as long as the axis
    [1.8100024990071555, 98.81000249900715],
    // the labels really are as long as the axis: the max does not replace the min
    [1000000000001, 1000000000099]
  ].forEach(function(data) {
    it('Should keep the tick at the data minimum of ' + JSON.stringify(data) + ' on a narrow horizontal axis', function() {
      var values = getDataBoundsXScale(data, 120).ticks.map(tick => tick.value);

      expect(values[0]).toBe(data[0]);
      expect(values[values.length - 1]).toBe(data[1]);
    });
  });

  it('Should keep the tick at a user min with noise digits on a narrow horizontal axis', function() {
    // bounds: 'ticks' with user bounds: the min label is sized from the digits it shows.
    var min = -0.161490405286425;
    var max = -0.1614903997258063;
    var chart = window.acquireChart({
      type: 'scatter',
      data: {datasets: [{data: [{x: min, y: 0}, {x: max, y: 1}]}]},
      options: {scales: {x: {min, max, ticks: {autoSkip: false}}}}
    }, {
      canvas: {width: 150, height: 200}
    });

    expect(chart.scales.x.ticks.map(tick => tick.value)).toEqual([min, max]);
  });

  it('Should size a data bound label with one decimal more than the ticks', function() {
    // "12.5", not "13": the 200 and 800 grid ticks are within one such label of the bounds.
    var values = getDataBoundsXScale([12.5, 987.5], 240).ticks.map(tick => tick.value);

    expect(values).toEqual([12.5, 400, 600, 987.5]);
  });

  it('Should keep the same grid ticks whatever noise digits the data bounds carry', function() {
    var noisy = [1.8100024990071555, 98.81000249900715];
    var clean = [1.81, 98.81];
    var inner = values => values.slice(1, -1);
    var noisyValues = getDataBoundsXScale(noisy, 300).ticks.map(tick => tick.value);
    var cleanValues = getDataBoundsXScale(clean, 300).ticks.map(tick => tick.value);

    expect(noisyValues[0]).toBe(noisy[0]);
    expect(noisyValues[noisyValues.length - 1]).toBe(noisy[1]);
    expect(inner(noisyValues)).toEqual(inner(cleanValues));
    expect(inner(noisyValues).length).toBeGreaterThan(0);
  });

  it('Should give a fractional data max its own tick, without a duplicate, when bounding to data', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['a', 'b'],
        datasets: [{
          data: [0, 5.4]
        }]
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            bounds: 'data',
            ticks: {
              autoSkip: false
            }
          }
        }
      }
    });

    // 4.7.0 data-bounds rule: the data max is a bound, so it gets a tick after the grid.
    expect(getLabels(chart.scales.y)).toEqual(['0', '1', '2', '3', '4', '5', '5.4']);
  });

  it('Should keep every spacing tick below a data max that is not a multiple of the spacing', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['a', 'b'],
        datasets: [{
          data: [0, 3200]
        }]
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            bounds: 'data',
            ticks: {
              autoSkip: false
            }
          }
        }
      }
    });

    expect(chart.scales.y.ticks.map(tick => tick.value)).toEqual([
      0, 500, 1000, 1500, 2000, 2500, 3000, 3200
    ]);
  });

  it('Should not repeat the last tick when the tick count is whole within the precision of the bounds', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['a', 'b'],
        datasets: [{
          data: [1.6285, 1.6287]
        }]
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            ticks: {
              stepSize: 0.003,
              includeBounds: false
            }
          }
        }
      }
    });

    expect(chart.scales.y.ticks.map(tick => +tick.value.toFixed(4))).toEqual([1.6284, 1.6287]);
  });

  function expectFiniteIncreasing(values) {
    expect(values.length).toBeGreaterThan(1);
    expect(values.every(value => isFinite(value))).toBe(true);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  }

  [[0, Number.MAX_VALUE], [-Number.MAX_VALUE, 0]].forEach(function(data) {
    it('Should generate finite ticks for data ' + JSON.stringify(data) + ' at the end of the number range', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b'],
          datasets: [{data}]
        }
      });
      var scale = chart.scales.y;
      var values = scale.ticks.map(tick => tick.value);

      expectFiniteIncreasing(values);
      expect(values[0]).toBe(data[0]);
      expect(values[values.length - 1]).toBe(data[1]);
      expect(scale.min).toBe(data[0]);
      expect(scale.max).toBe(data[1]);
    });
  });

  const MAX = Number.MAX_VALUE;
  [
    // the range is wider than the largest number
    {data: [-MAX, MAX], y: {}, expected: [-MAX, MAX]},
    {data: [1, 2], y: {min: -1e308, max: 1e308, ticks: {count: 5}}, expected: [-1e308, 1e308]},
    // the range between the nice bounds is wider than the largest number
    {data: [-1, MAX], y: {}, expected: [-2e307, MAX]},
    {data: [-MAX, 1], y: {}, expected: [-MAX, 2e307]},
    {data: [-1, MAX], y: {ticks: {stepSize: 0.5}}, expected: [-2.4999999999999997e305, MAX]},
    // (with count the spacing is not finite; precision 0 leaves no other guard)
    {data: [-1, MAX], y: {ticks: {count: 5, precision: 0}}, expected: [-2e307, MAX]},
    // the range is subnormal, so the spacing is 0
    {data: [0, 5e-324], y: {min: 0}, expected: [0, 5e-324]},
    // the decimals of the spacing cannot be counted
    {data: [0, 1e-310], y: {bounds: 'ticks', min: 0}, expected: [0, 1e-310]},
    {data: [0, 1e-310], y: {bounds: 'data', min: 0}, expected: [0, 1e-310]},
    // the nice bounds times the rounding factor are beyond the largest number:
    // from precision,
    {data: [0, 1e307], y: {ticks: {precision: 2}}, expected: [0, 1e307]},
    {data: [-1e307, 0], y: {ticks: {precision: 2}}, expected: [-1e307, 0]},
    // (1.7e306 * 100 is finite, but its nice bound 1.8e306 * 100 is not)
    {data: [0, 1.7e306], y: {ticks: {precision: 2}}, expected: [0, 1.7999999999999998e306]},
    {data: [-1.7e306, 0], y: {ticks: {precision: 2}}, expected: [-1.7999999999999998e306, 0]},
    // or from the decimals of the minimum (0.001 needs a factor of 1000)
    {data: [0.001, 1e307], y: {bounds: 'data', ticks: {count: 5}}, expected: [0.001, 1e307]}
  ].forEach(function({data, y, expected}) {
    it('Should generate the two bounds as ticks for data ' + JSON.stringify(data) + ' with ' + JSON.stringify(y), function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b'],
          datasets: [{data}]
        },
        options: {
          scales: {y}
        }
      });

      expect(chart.scales.y.ticks.map(tick => tick.value)).toEqual(expected);
    });
  });

  // 4.7.0 data-bounds rule: the grid starts on a multiple of the spacing, not on a data
  // minimum whose decimals cannot be counted (1e-310) or set a factor that overflows (0.5).
  [
    {data: [1e-310, 1], ticks: {}, expected: [1e-310, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]},
    {data: [1e-310, 1], ticks: {precision: 2}, expected: [1e-310, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]},
    {data: [0.5, 1e308], ticks: {}, expected: [0.5, 1e307, 2e307, 3e307, 4e307, 5e307, 6e307, 7e307, 8e307, 9e307, 1e308]}
  ].forEach(function({data, ticks, expected}) {
    it('Should keep the grid after the data minimum of ' + JSON.stringify(data) + ' with ' + JSON.stringify(ticks) + ' when bounding to data', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b'],
          datasets: [{data}]
        },
        options: {
          scales: {
            y: {bounds: 'data', ticks}
          }
        }
      });

      expect(chart.scales.y.ticks.map(tick => tick.value)).toEqual(expected);
    });
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

  // https://github.com/chartjs/Chart.js/issues/9614
  // The closest two drawn labels are apart, and the room each label needs.
  function labelsOverHalfTheAxis(reverse) {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          data: [{x: 0, y: 0}, {x: 1000, y: 1}]
        }]
      },
      options: {
        plugins: {legend: false},
        scales: {
          x: {
            min: 0,
            max: 1000,
            reverse,
            ticks: {stepSize: 10, maxRotation: 0},
            afterBuildTicks: function(scale) {
              scale.ticks = scale.ticks.filter((tick) => tick.value <= 500);
            }
          },
          y: {display: false}
        }
      }
    }, {
      canvas: {width: 620, height: 100}
    });

    var scale = chart.scales.x;
    var pixels = scale.ticks.map((tick) => scale.getPixelForValue(tick.value));
    var closest = Infinity;
    for (var i = 1; i < pixels.length; i++) {
      closest = Math.min(closest, Math.abs(pixels[i] - pixels[i - 1]));
    }
    return {
      count: scale.ticks.length,
      closest,
      room: scale._getLabelSizes().widest.width + scale.options.ticks.autoSkipPadding
    };
  }

  it('should fit the labels into the part of the axis the ticks cover', function() {
    var {count, closest, room} = labelsOverHalfTheAxis(false);

    expect(count).toBeGreaterThan(1);
    expect(closest).toBeGreaterThanOrEqual(room);
  });

  // The offset is half the room of a kept tick: `configure` runs again with them.
  it('should pad an offset axis by the ticks kept over the part they cover', function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          data: [{x: 0, y: 0}, {x: 500, y: 1}]
        }]
      },
      options: {
        plugins: {legend: false},
        scales: {
          x: {
            min: 0,
            max: 1000,
            offset: true,
            ticks: {stepSize: 10, maxRotation: 0},
            afterBuildTicks: function(scale) {
              scale.ticks = scale.ticks.filter((tick) => tick.value <= 500);
            }
          },
          y: {display: false}
        }
      }
    }, {
      canvas: {width: 620, height: 100}
    });

    var scale = chart.scales.x;
    expect(scale.ticks.map((tick) => tick.value)).toEqual([0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480]);
    // Half of 1000 / 12 at each end.
    expect(scale._valueRange).toBeCloseTo(1000 + 1000 / 12, 6);
  });

  it('should fit the labels into the part of a reversed axis the ticks cover', function() {
    var {count, closest, room} = labelsOverHalfTheAxis(true);

    expect(count).toBe(labelsOverHalfTheAxis(false).count);
    expect(closest).toBeGreaterThanOrEqual(room);
  });
});
