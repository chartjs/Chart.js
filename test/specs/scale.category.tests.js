function getLabels(scale) {
  return scale.ticks.map(t => t.label);
}

describe('Category scale tests', function() {
  describe('auto', jasmine.fixture.specs('scale.category'));

  it('Should register the constructor with the registry', function() {
    var Constructor = Chart.registry.getScale('category');
    expect(Constructor).not.toBe(undefined);
    expect(typeof Constructor).toBe('function');
  });

  it('Should have the correct default config', function() {
    var defaultConfig = Chart.defaults.scales.category;
    expect(defaultConfig).toEqual({
      ticks: {
        callback: Chart.registry.getScale('category').prototype.getLabelForValue
      }
    });
  });

  it('Should generate ticks from the data xLabels', function() {
    var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
    var chart = window.acquireChart({
      type: 'line',
      data: {
        xLabels: labels,
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }]
      },
      options: {
        scales: {
          x: {
            type: 'category',
          }
        }
      }
    });

    var scale = chart.scales.x;
    expect(getLabels(scale)).toEqual(labels);
  });

  it('Should generate ticks from the data yLabels', function() {
    var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
    var chart = window.acquireChart({
      type: 'line',
      data: {
        yLabels: labels,
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }]
      },
      options: {
        scales: {
          y: {
            type: 'category'
          }
        }
      }
    });

    var scale = chart.scales.y;
    expect(getLabels(scale)).toEqual(labels);
  });

  it('Should generate ticks from the axis labels', function() {
    var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, 5, 0, 25, 78]
        }]
      },
      options: {
        scales: {
          x: {
            type: 'category',
            labels: labels
          }
        }
      }
    });

    var scale = chart.scales.x;
    expect(getLabels(scale)).toEqual(labels);
  });

  it('Should generate missing labels', function() {
    var labels = ['a', 'b', 'c', 'd'];
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: {a: 1, b: 3, c: -1, d: 10}
        }]
      },
      options: {
        scales: {
          x: {
            type: 'category',
            labels: ['a']
          }
        }
      }
    });

    var scale = chart.scales.x;
    expect(getLabels(scale)).toEqual(labels);

  });

  it('should parse only to a valid index', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
      },
      options: {
        scales: {
          x: {
            type: 'category',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });

    var scale = chart.scales.x;

    expect(scale.parse(-10)).toEqual(0);
    expect(scale.parse(-0.1)).toEqual(0);
    expect(scale.parse(4.1)).toEqual(4);
    expect(scale.parse(5)).toEqual(4);
    expect(scale.parse(1)).toEqual(1);
    expect(scale.parse(1.4)).toEqual(1);
    expect(scale.parse(1.5)).toEqual(2);
    expect(scale.parse('tick2')).toEqual(1);
  });

  it('should get the correct label for the index', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
      },
      options: {
        scales: {
          x: {
            type: 'category',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });

    var scale = chart.scales.x;

    expect(scale.getLabelForValue(1)).toBe('tick2');
  });

  it('Should get the correct pixel for a value when horizontal', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
      },
      options: {
        scales: {
          x: {
            type: 'category',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });

    var xScale = chart.scales.x;
    expect(xScale.getPixelForValue(0)).toBeCloseToPixel(23 + 6); // plus lineHeight
    expect(xScale.getValueForPixel(23)).toBe(0);

    expect(xScale.getPixelForValue(4)).toBeCloseToPixel(487);
    expect(xScale.getValueForPixel(487)).toBe(4);

    xScale.options.offset = true;
    chart.update();

    expect(xScale.getPixelForValue(0)).toBeCloseToPixel(71 + 6); // plus lineHeight
    expect(xScale.getValueForPixel(69)).toBe(0);

    expect(xScale.getPixelForValue(4)).toBeCloseToPixel(461);
    expect(xScale.getValueForPixel(417)).toBe(4);
  });

  it('Should get the correct pixel for a value when there are repeated labels', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
      },
      options: {
        scales: {
          x: {
            type: 'category',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });

    var xScale = chart.scales.x;
    expect(xScale.getPixelForValue('tick1')).toBeCloseToPixel(23 + 6); // plus lineHeight
  });

  it('Should get the correct pixel for a value when horizontal and zoomed', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [10, 5, 0, 25, 78]
        }],
        labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
      },
      options: {
        scales: {
          x: {
            type: 'category',
            position: 'bottom',
            min: 'tick2',
            max: 'tick4'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });

    var xScale = chart.scales.x;
    expect(xScale.getPixelForValue(1)).toBeCloseToPixel(23 + 6); // plus lineHeight
    expect(xScale.getPixelForValue(3)).toBeCloseToPixel(496);

    xScale.options.offset = true;
    chart.update();

    expect(xScale.getPixelForValue(1)).toBeCloseToPixel(103 + 6); // plus lineHeight
    expect(xScale.getPixelForValue(3)).toBeCloseToPixel(429);
  });

  it('should get the correct pixel for a value when vertical', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: ['3', '5', '1', '4', '2']
        }],
        labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
        yLabels: ['1', '2', '3', '4', '5']
      },
      options: {
        scales: {
          x: {
            type: 'category',
            position: 'bottom',
          },
          y: {
            type: 'category',
            position: 'left'
          }
        }
      }
    });

    var yScale = chart.scales.y;
    expect(yScale.getPixelForValue(0)).toBeCloseToPixel(32);
    expect(yScale.getValueForPixel(257)).toBe(2);

    expect(yScale.getPixelForValue(4)).toBeCloseToPixel(484);
    expect(yScale.getValueForPixel(144)).toBe(1);

    yScale.options.offset = true;
    chart.update();

    expect(yScale.getPixelForValue(0)).toBeCloseToPixel(77);
    expect(yScale.getValueForPixel(256)).toBe(2);

    expect(yScale.getPixelForValue(4)).toBeCloseToPixel(438);
    expect(yScale.getValueForPixel(167)).toBe(1);
  });

  it('should get the correct pixel for a value when vertical and zoomed', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: ['3', '5', '1', '4', '2']
        }],
        labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
        yLabels: ['1', '2', '3', '4', '5']
      },
      options: {
        scales: {
          x: {
            type: 'category',
            position: 'bottom',
          },
          y: {
            type: 'category',
            position: 'left',
            min: '2',
            max: '4'
          }
        }
      }
    });

    var yScale = chart.scales.y;

    expect(yScale.getPixelForValue(1)).toBeCloseToPixel(32);
    expect(yScale.getPixelForValue(3)).toBeCloseToPixel(482);

    yScale.options.offset = true;
    chart.update();

    expect(yScale.getPixelForValue(1)).toBeCloseToPixel(107);
    expect(yScale.getPixelForValue(3)).toBeCloseToPixel(407);
  });

  it('Should get the correct pixel for an object value when horizontal', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [
            {x: 0, y: 10},
            {x: 1, y: 5},
            {x: 2, y: 0},
            {x: 3, y: 25},
            {x: 0, y: 78}
          ]
        }],
        labels: [0, 1, 2, 3]
      },
      options: {
        scales: {
          x: {
            type: 'category',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });

    var xScale = chart.scales.x;
    expect(xScale.getPixelForValue(0)).toBeCloseToPixel(29);
    expect(xScale.getPixelForValue(3)).toBeCloseToPixel(506);
    expect(xScale.getPixelForValue(4)).toBeCloseToPixel(664);
  });

  it('Should get the correct pixel for an object value when vertical', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [
            {x: 0, y: 2},
            {x: 1, y: 4},
            {x: 2, y: 0},
            {x: 3, y: 3},
            {x: 0, y: 1}
          ]
        }],
        labels: [0, 1, 2, 3],
        yLabels: [0, 1, 2, 3, 4]
      },
      options: {
        scales: {
          x: {
            type: 'category',
            position: 'bottom'
          },
          y: {
            type: 'category',
            position: 'left'
          }
        }
      }
    });

    var yScale = chart.scales.y;
    expect(yScale.getPixelForValue(0)).toBeCloseToPixel(32);
    expect(yScale.getPixelForValue(4)).toBeCloseToPixel(483);
  });

  it('Should get the correct pixel for an object value in a bar chart', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          xAxisID: 'x',
          yAxisID: 'y',
          data: [
            {x: 0, y: 10},
            {x: 1, y: 5},
            {x: 2, y: 0},
            {x: 3, y: 25},
            {x: 0, y: 78}
          ]
        }],
        labels: [0, 1, 2, 3]
      },
      options: {
        scales: {
          x: {
            type: 'category',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    });

    var xScale = chart.scales.x;
    expect(xScale.getPixelForValue(0)).toBeCloseToPixel(89);
    expect(xScale.getPixelForValue(3)).toBeCloseToPixel(451);
    expect(xScale.getPixelForValue(4)).toBeCloseToPixel(572);
  });

  it('Should get the correct pixel for an object value in a horizontal bar chart', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [
            {x: 10, y: 0},
            {x: 5, y: 1},
            {x: 0, y: 2},
            {x: 25, y: 3},
            {x: 78, y: 0}
          ]
        }],
        labels: [0, 1, 2, 3]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            type: 'category'
          }
        }
      }
    });

    var yScale = chart.scales.y;
    expect(yScale.getPixelForValue(0)).toBeCloseToPixel(88);
    expect(yScale.getPixelForValue(3)).toBeCloseToPixel(426);
    expect(yScale.getPixelForValue(4)).toBeCloseToPixel(538);
  });

  it('Should be consistent on pixels and values with autoSkipped ticks', function() {
    var labels = [];
    for (let i = 0; i < 50; i++) {
      labels.push('very long label ' + i);
    }
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        }]
      }
    });

    var scale = chart.scales.x;
    expect(scale.ticks.length).toBeLessThan(50);

    let x = 0;
    for (let i = 0; i < 50; i++) {
      var x2 = scale.getPixelForValue(labels[i]);
      var x3 = scale.getPixelForValue(i);
      expect(x2).toEqual(x3);
      expect(x2).toBeGreaterThan(x);
      expect(scale.getValueForPixel(x2)).toBe(i);
      x = x2;
    }
  });

  it('Should bound to ticks/data', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['a', 'b', 'c', 'd'],
        datasets: [{
          data: {b: 1, c: 99}
        }]
      },
      options: {
        scales: {
          x: {
            type: 'category',
            bounds: 'data'
          }
        }
      }
    });

    expect(chart.scales.x.min).toEqual(1);
    expect(chart.scales.x.max).toEqual(2);

    chart.options.scales.x.bounds = 'ticks';
    chart.update();

    expect(chart.scales.x.min).toEqual(0);
    expect(chart.scales.x.max).toEqual(3);
  });
});
