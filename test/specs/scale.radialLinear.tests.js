function getLabels(scale) {
  return scale.ticks.map(t => t.label);
}

// Tests for the radial linear scale used by the polar area and radar charts
describe('Test the radial linear scale', function() {
  describe('auto', jasmine.fixture.specs('scale.radialLinear'));

  it('Should register the constructor with the registry', function() {
    var Constructor = Chart.registry.getScale('radialLinear');
    expect(Constructor).not.toBe(undefined);
    expect(typeof Constructor).toBe('function');
  });

  it('Should have the correct default config', function() {
    var defaultConfig = Chart.defaults.scales.radialLinear;
    expect(defaultConfig).toEqual({
      display: true,
      animate: true,
      position: 'chartArea',

      angleLines: {
        display: true,
        color: 'rgba(0,0,0,0.1)',
        lineWidth: 1,
        borderDash: [],
        borderDashOffset: 0.0
      },

      grid: {
        circular: false
      },

      startAngle: 0,

      ticks: {
        color: Chart.defaults.color,
        showLabelBackdrop: true,
        callback: defaultConfig.ticks.callback
      },

      pointLabels: {
        backdropColor: undefined,
        backdropPadding: 2,
        color: Chart.defaults.color,
        display: true,
        font: {
          size: 10
        },
        callback: defaultConfig.pointLabels.callback,
        padding: 5,
        centerPointLabels: false
      }
    });

    // Is this actually a function
    expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
    expect(defaultConfig.pointLabels.callback).toEqual(jasmine.any(Function));
  });

  it('Should correctly determine the max & min data values', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, -5, 78, -100]
        }, {
          data: [150]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6']
      },
      options: {
        scales: {}
      }
    });

    expect(chart.scales.r.min).toBe(-100);
    expect(chart.scales.r.max).toBe(150);
  });

  it('Should correctly determine the max & min of string data values', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: ['10', '5', '0', '-5', '78', '-100']
        }, {
          data: ['150']
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6']
      },
      options: {
        scales: {}
      }
    });

    expect(chart.scales.r.min).toBe(-100);
    expect(chart.scales.r.max).toBe(150);
  });

  it('Should correctly determine the max & min data values when there are hidden datasets', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: ['10', '5', '0', '-5', '78', '-100']
        }, {
          data: ['150']
        }, {
          data: [1000],
          hidden: true
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6']
      },
      options: {
        scales: {}
      }
    });

    expect(chart.scales.r.min).toBe(-100);
    expect(chart.scales.r.max).toBe(150);
  });

  it('Should correctly determine the max & min data values when there is NaN data', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [50, 60, NaN, 70, null, undefined, Infinity, -Infinity]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6', 'label7', 'label8']
      },
      options: {
        scales: {}
      }
    });

    expect(chart.scales.r.min).toBe(50);
    expect(chart.scales.r.max).toBe(70);
  });

  it('Should ensure that the scale has a max and min that are not equal', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [],
        labels: []
      },
      options: {
        scales: {
          rScale: {}
        }
      }
    });

    var scale = chart.scales.rScale;

    expect(scale.min).toBe(-1);
    expect(scale.max).toBe(1);
  });

  it('Should use the suggestedMin and suggestedMax options', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [1, 1, 1, 2, 1, 0]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6']
      },
      options: {
        scales: {
          r: {
            suggestedMin: -10,
            suggestedMax: 10
          }
        }
      }
    });

    expect(chart.scales.r.min).toBe(-10);
    expect(chart.scales.r.max).toBe(10);
  });

  it('Should use the min and max options', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [1, 1, 1, 2, 1, 0]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6']
      },
      options: {
        scales: {
          r: {
            min: -1010,
            max: 1010
          }
        }
      }
    });

    expect(chart.scales.r.min).toBe(-1010);
    expect(chart.scales.r.max).toBe(1010);
    expect(getLabels(chart.scales.r)).toEqual(['-1,010', '-500', '0', '500', '1,010']);
  });

  it('should forcibly include 0 in the range if the beginAtZero option is used', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [20, 30, 40, 50]
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        scales: {
          r: {
            beginAtZero: false
          }
        }
      }
    });

    expect(getLabels(chart.scales.r)).toEqual(['20', '25', '30', '35', '40', '45', '50']);

    chart.scales.r.options.beginAtZero = true;
    chart.update();

    expect(getLabels(chart.scales.r)).toEqual(['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50']);

    chart.data.datasets[0].data = [-20, -30, -40, -50];
    chart.update();

    expect(getLabels(chart.scales.r)).toEqual(['-50', '-45', '-40', '-35', '-30', '-25', '-20', '-15', '-10', '-5', '0']);

    chart.scales.r.options.beginAtZero = false;
    chart.update();

    expect(getLabels(chart.scales.r)).toEqual(['-50', '-45', '-40', '-35', '-30', '-25', '-20']);
  });

  it('Should generate tick marks in the correct order in reversed mode', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5']
      },
      options: {
        scales: {
          r: {
            reverse: true
          }
        }
      }
    });

    expect(getLabels(chart.scales.r)).toEqual(['80', '70', '60', '50', '40', '30', '20', '10', '0']);
    expect(chart.scales.r.start).toBe(80);
    expect(chart.scales.r.end).toBe(0);
  });

  it('Should correctly limit the maximum number of ticks', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        labels: ['label1', 'label2', 'label3'],
        datasets: [{
          data: [0.5, 1.5, 2.5]
        }]
      },
      options: {
        scales: {
          r: {
            pointLabels: {
              display: false
            }
          }
        }
      }
    });

    expect(getLabels(chart.scales.r)).toEqual(['0.5', '1.0', '1.5', '2.0', '2.5']);

    chart.options.scales.r.ticks.maxTicksLimit = 11;
    chart.update();

    expect(getLabels(chart.scales.r)).toEqual(['0.5', '1.0', '1.5', '2.0', '2.5']);

    chart.options.scales.r.ticks.stepSize = 0.01;
    chart.update();

    expect(getLabels(chart.scales.r)).toEqual(['0.5', '1.0', '1.5', '2.0', '2.5']);

    chart.options.scales.r.min = 0.3;
    chart.options.scales.r.max = 2.8;
    chart.update();

    expect(getLabels(chart.scales.r)).toEqual(['0.3', '0.8', '1.3', '1.8', '2.3', '2.8']);
  });

  it('Should build labels using the user supplied callback', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5']
      },
      options: {
        scales: {
          r: {
            ticks: {
              callback: function(value, index) {
                return index.toString();
              }
            }
          }
        }
      }
    });

    expect(getLabels(chart.scales.r)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
    expect(chart.scales.r._pointLabels).toEqual(['label1', 'label2', 'label3', 'label4', 'label5']);
  });

  it('Should build point labels using the user supplied callback', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5']
      },
      options: {
        scales: {
          r: {
            pointLabels: {
              callback: function(value, index) {
                return index.toString();
              }
            }
          }
        }
      }
    });

    expect(chart.scales.r._pointLabels).toEqual(['0', '1', '2', '3', '4']);
  });

  it('Should build point labels from falsy values', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78, 20]
        }],
        labels: [0, '', undefined, null, NaN, false]
      }
    });

    expect(chart.scales.r._pointLabels).toEqual([0, '', '', '', '', '']);
  });

  it('Should build point labels considering hidden data', function() {
    const chart = window.acquireChart({
      type: 'polarArea',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78, 20]
        }],
        labels: ['a', 'b', 'c', 'd', 'e', 'f']
      }
    });
    chart.toggleDataVisibility(3);
    chart.update();

    expect(chart.scales.r._pointLabels).toEqual(['a', 'b', 'c', 'e', 'f']);
  });

  it('should correctly set the center point', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5']
      },
      options: {
        scales: {
          r: {
            pointLabels: {
              callback: function(value, index) {
                return index.toString();
              }
            }
          }
        }
      }
    });

    expect(chart.scales.r.drawingArea).toBe(215);
    expect(chart.scales.r.xCenter).toBe(256);
    expect(chart.scales.r.yCenter).toBe(280);
  });

  it('should correctly get the label for a given data index', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5']
      },
      options: {
        scales: {
          r: {
            pointLabels: {
              callback: function(value, index) {
                return index.toString();
              }
            }
          }
        }
      }
    });
    expect(chart.scales.r.getLabelForValue(5)).toBe('5');
  });

  it('should get the correct distance from the center point', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5']
      },
      options: {
        scales: {
          r: {
            pointLabels: {
              callback: function(value, index) {
                return index.toString();
              }
            }
          }
        }
      }
    });

    expect(chart.scales.r.getDistanceFromCenterForValue(chart.scales.r.min)).toBe(0);
    expect(chart.scales.r.getDistanceFromCenterForValue(chart.scales.r.max)).toBe(215);

    var position = chart.scales.r.getPointPositionForValue(1, 5);
    expect(position.x).toBeCloseToPixel(269);
    expect(position.y).toBeCloseToPixel(276);

    chart.scales.r.options.reverse = true;
    chart.update();

    expect(chart.scales.r.getDistanceFromCenterForValue(chart.scales.r.min)).toBe(215);
    expect(chart.scales.r.getDistanceFromCenterForValue(chart.scales.r.max)).toBe(0);
  });

  it('should get the correct value for a distance from the center point', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5']
      },
      options: {
        scales: {
          r: {
            pointLabels: {
              callback: function(value, index) {
                return index.toString();
              }
            }
          }
        }
      }
    });

    expect(chart.scales.r.getValueForDistanceFromCenter(0)).toBe(chart.scales.r.min);
    expect(chart.scales.r.getValueForDistanceFromCenter(215)).toBe(chart.scales.r.max);

    var dist = chart.scales.r.getDistanceFromCenterForValue(5);
    expect(chart.scales.r.getValueForDistanceFromCenter(dist)).toBe(5);

    chart.scales.r.options.reverse = true;
    chart.update();

    expect(chart.scales.r.getValueForDistanceFromCenter(0)).toBe(chart.scales.r.max);
    expect(chart.scales.r.getValueForDistanceFromCenter(215)).toBe(chart.scales.r.min);
  });

  it('should correctly get angles for all points', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5']
      },
      options: {
        scales: {
          r: {
            startAngle: 15,
            pointLabels: {
              callback: function(value, index) {
                return index.toString();
              }
            }
          }
        },
      }
    });

    var radToNearestDegree = function(rad) {
      return Math.round((360 * rad) / (2 * Math.PI));
    };

    var slice = 72; // (360 / 5)

    for (var i = 0; i < 5; i++) {
      expect(radToNearestDegree(chart.scales.r.getIndexAngle(i))).toBe(15 + (slice * i));
    }

    chart.scales.r.options.startAngle = 0;
    chart.update();

    for (var x = 0; x < 5; x++) {
      expect(radToNearestDegree(chart.scales.r.getIndexAngle(x))).toBe((slice * x));
    }
  });

  it('should correctly get the correct label alignment for all points', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5']
      },
      options: {
        scales: {
          r: {
            pointLabels: {
              callback: function(value, index) {
                return index.toString();
              }
            },
            ticks: {
              display: false
            }
          }
        }
      }
    });

    var scale = chart.scales.r;

    [{
      startAngle: 30,
      textAlign: ['right', 'right', 'left', 'left', 'left'],
    }, {
      startAngle: -30,
      textAlign: ['right', 'right', 'left', 'left', 'right'],
    }, {
      startAngle: 750,
      textAlign: ['right', 'right', 'left', 'left', 'left'],
    }].forEach(function(expected) {
      scale.options.startAngle = expected.startAngle;
      chart.update();

      scale.ctx = window.createMockContext();
      chart.draw();

      scale.ctx.getCalls().filter(function(x) {
        return x.name === 'setTextAlign';
      }).forEach(function(x, i) {
        expect(x.args[0]).withContext('startAngle: ' + expected.startAngle + ', tick: ' + i).toBe(expected.textAlign[i]);
      });
    });
  });

  it('should correctly get the point positions in center', function() {
    var chart = window.acquireChart({
      type: 'polarArea',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['label1', 'label2', 'label3', 'label4', 'label5']
      },
      options: {
        scales: {
          r: {
            pointLabels: {
              display: true,
              padding: 5,
              centerPointLabels: true
            },
            ticks: {
              display: false
            }
          }
        }
      }
    });

    const PI = Math.PI;
    const lavelNum = 5;
    const padding = 5;
    const pointLabelItems = chart.scales.r._pointLabelItems;
    const additionalAngle = PI / lavelNum;
    const opts = chart.scales.r.options;
    const outerDistance = chart.scales.r.getDistanceFromCenterForValue(opts.ticks.reverse ? chart.scales.r.min : chart.scales.r.max);
    const tickBackdropHeight = 0;
    const yForAngle = function(y, h, angle) {
      if (angle === 90 || angle === 270) {
        y -= (h / 2);
      } else if (angle > 270 || angle < 90) {
        y -= h;
      }
      return y;
    };
    const toDegrees = function(radians) {
      return radians * (180 / PI);
    };

    for (var i = 0; i < 5; i++) {
      const extra = (i === 0 ? tickBackdropHeight / 2 : 0);
      const pointLabelItem = pointLabelItems[i];
      const pointPosition = chart.scales.r.getPointPosition(i, outerDistance + extra + padding, additionalAngle);
      expect(pointLabelItem.x).toBe(pointPosition.x);
      expect(pointLabelItem.y).toBe(yForAngle(pointPosition.y, 12, toDegrees(pointPosition.angle + PI / 2)));
    }

  });
});
