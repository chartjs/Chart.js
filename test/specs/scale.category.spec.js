function getLabels(scale) {
  return scale.ticks.map(t => t.label);
}

describe('Category scale tests', function() {
  it('Should register the constructor with the registry', function() {
    var Constructor = Chart.registry.getScale('category');
    expect(Constructor).not.toBe(undefined);
    expect(typeof Constructor).toBe('function');
  });

  it('Should have the correct default config', function() {
    var defaultConfig = Chart.defaults.scales.category;
    expect(defaultConfig).toEqual({
      ticks: {
        callback: Chart.registry.getScale('category').defaults.ticks.callback
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
    expect(xScale.getValueForPixel(23)).toBeCloseTo(0);

    expect(xScale.getPixelForValue(4)).toBeCloseToPixel(487);
    expect(xScale.getValueForPixel(487)).toBe(4);

    xScale.options.offset = true;
    chart.update();

    expect(xScale.getPixelForValue(0)).toBeCloseToPixel(71 + 6); // plus lineHeight
    expect(xScale.getValueForPixel(69)).toBeCloseTo(0);

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
      expect(scale.getValueForPixel(x2)).toBeCloseTo(i);
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

  ['x', 'y'].forEach(function(indexAxis) {
    it('should apply numeric bounds to inferred labels on the ' + indexAxis + ' axis', function() {
      var valueAxis = indexAxis === 'x' ? 'y' : 'x';
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: Array.from({length: 20}, (_, i) => ({
              [indexAxis]: 'L' + i,
              [valueAxis]: i === 0 || i === 19 ? 1000 : i
            }))
          }]
        },
        options: {
          indexAxis,
          scales: {
            [indexAxis]: {type: 'category', min: 2, max: 17},
            [valueAxis]: {type: 'linear', bounds: 'data'}
          }
        }
      });

      expect(chart.scales[indexAxis].min).toBe(2);
      expect(chart.scales[indexAxis].max).toBe(17);
      expect(chart.scales[valueAxis].min).toBe(2);
      expect(chart.scales[valueAxis].max).toBe(17);

      chart.update();
      expect(chart.scales[indexAxis].min).toBe(2);
      expect(chart.scales[indexAxis].max).toBe(17);

      chart.options.scales[indexAxis].min = 4;
      chart.options.scales[indexAxis].max = 9;
      chart.update();
      expect(chart.scales[indexAxis].min).toBe(4);
      expect(chart.scales[indexAxis].max).toBe(9);
      expect(chart.scales[valueAxis].min).toBe(4);
      expect(chart.scales[valueAxis].max).toBe(9);
    });
  });

  [{min: 2}, {max: 17}].forEach(function(bounds) {
    it('should apply a single numeric bound to inferred labels: ' + JSON.stringify(bounds), function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{data: Array.from({length: 20}, (_, i) => ({x: 'L' + i, y: i}))}]
        },
        options: {
          scales: {x: bounds}
        }
      });

      expect(chart.scales.x.min).toBe(bounds.min === undefined ? 0 : bounds.min);
      expect(chart.scales.x.max).toBe(bounds.max === undefined ? 19 : bounds.max);
    });
  });

  it('should limit numeric bounds after inferred labels are added and removed', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{data: []}]
      },
      options: {
        scales: {x: {min: 2, max: 17}}
      }
    });

    chart.data.datasets[0].data = Array.from({length: 5}, (_, i) => ({x: 'L' + i, y: i}));
    chart.update();
    expect(chart.scales.x.min).toBe(2);
    expect(chart.scales.x.max).toBe(4);

    chart.data.datasets[0].data = chart.data.datasets[0].data.slice(0, 2);
    chart.update();
    expect(chart.scales.x.min).toBe(1);
    expect(chart.scales.x.max).toBe(1);
  });

  ['x', 'y'].forEach(function(indexAxis) {
    it('should apply string bounds to inferred labels without reordering them on the ' + indexAxis + ' axis', function() {
      var valueAxis = indexAxis === 'x' ? 'y' : 'x';
      var labels = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: labels.map((label, i) => ({
              [indexAxis]: label,
              [valueAxis]: i === 0 || i === 5 ? 1000 : i
            }))
          }]
        },
        options: {
          indexAxis,
          scales: {
            [indexAxis]: {type: 'category', min: 'L1', max: 'L3'},
            [valueAxis]: {type: 'linear', bounds: 'data'}
          }
        }
      });

      var scale = chart.scales[indexAxis];
      expect(scale.getLabels()).toEqual(labels);
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(3);
      expect(chart.scales[valueAxis].min).toBe(1);
      expect(chart.scales[valueAxis].max).toBe(3);

      chart.update();
      expect(scale.getLabels()).toEqual(labels);
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(3);

      chart.options.scales[indexAxis].min = 'L2';
      chart.options.scales[indexAxis].max = 'L4';
      chart.update();
      expect(scale.getLabels()).toEqual(labels);
      expect(scale.min).toBe(2);
      expect(scale.max).toBe(4);
    });
  });

  it('should not reorder inferred labels for string suggested bounds', function() {
    var labels = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{data: labels.map((label, i) => ({x: label, y: i}))}]
      },
      options: {
        scales: {x: {suggestedMin: 'L1', suggestedMax: 'L3'}}
      }
    });

    expect(chart.scales.x.getLabels()).toEqual(labels);
    expect(chart.scales.x.min).toBe(0);
    expect(chart.scales.x.max).toBe(5);
  });

  it('should apply a string suggestedMax that only a hidden dataset reaches', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [
          {data: [{x: 'L0', y: 0}, {x: 'L1', y: 1}, {x: 'L2', y: 2}]},
          {data: [{x: 'L3', y: 3}, {x: 'L4', y: 4}], hidden: true}
        ]
      },
      options: {
        scales: {x: {bounds: 'data', suggestedMax: 'L4'}}
      }
    });

    expect(chart.scales.x.getLabels()).toEqual(['L0', 'L1', 'L2', 'L3', 'L4']);
    expect(chart.scales.x.min).toBe(0);
    expect(chart.scales.x.max).toBe(4);
  });

  it('should apply a string suggestedMin that only a hidden dataset reaches', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [
          {data: [{x: 'L0', y: 0}, {x: 'L1', y: 1}], hidden: true},
          {data: [{x: 'L2', y: 2}, {x: 'L3', y: 3}, {x: 'L4', y: 4}]}
        ]
      },
      options: {
        scales: {x: {bounds: 'data', suggestedMin: 'L1'}}
      }
    });

    expect(chart.scales.x.getLabels()).toEqual(['L0', 'L1', 'L2', 'L3', 'L4']);
    expect(chart.scales.x.min).toBe(1);
    expect(chart.scales.x.max).toBe(4);
  });

  it('should add a string bound that is not in the data after the inferred labels', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{data: [{x: 'L0', y: 0}, {x: 'L1', y: 1}, {x: 'L2', y: 2}]}]
      },
      options: {
        scales: {x: {max: 'ZZ'}}
      }
    });

    expect(chart.scales.x.getLabels()).toEqual(['L0', 'L1', 'L2', 'ZZ']);
    expect(chart.scales.x.min).toBe(0);
    expect(chart.scales.x.max).toBe(3);

    chart.update();
    expect(chart.scales.x.getLabels()).toEqual(['L0', 'L1', 'L2', 'ZZ']);
  });

  describe('labels found in the data', function() {
    it('Should generate missing labels without modifying the labels array from the scale options', function() {
      var labels = ['a'];
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
              labels: labels
            }
          }
        }
      });

      expect(getLabels(chart.scales.x)).toEqual(['a', 'b', 'c', 'd']);
      expect(labels).toEqual(['a']);
    });

    it('Should generate missing labels without modifying the data labels array', function() {
      var labels = ['a'];
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: [{x: 'a', y: 1}, {x: 'b', y: 3}, {x: 'c', y: -1}, {x: 'd', y: 10}]
          }]
        }
      });

      expect(getLabels(chart.scales.x)).toEqual(['a', 'b', 'c', 'd']);
      expect(labels).toEqual(['a']);
    });

    it('should leave chart.data.labels empty when every label comes from the data', function() {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            data: {a: 1, b: 3}
          }]
        }
      });

      expect(getLabels(chart.scales.x)).toEqual(['a', 'b']);
      expect(chart.data.labels).toEqual([]);

      chart.update();
      chart.update();
      expect(getLabels(chart.scales.x)).toEqual(['a', 'b']);
      expect(chart.data.labels).toEqual([]);
    });

    it('should show labels pushed to data.labels before an update', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a'],
          datasets: [{
            data: [{x: 'a', y: 1}, {x: 'z', y: 2}]
          }]
        }
      });

      expect(getLabels(chart.scales.x)).toEqual(['a', 'z']);

      chart.data.labels.push('b');
      chart.data.datasets[0].data.push({x: 'b', y: 3});
      chart.update();

      expect(getLabels(chart.scales.x)).toEqual(['a', 'b', 'z']);
      expect(chart.data.labels).toEqual(['a', 'b']);
    });

    it('should drop the label of a removed dataset', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a'],
          datasets: [{
            data: [{x: 'a', y: 1}]
          }, {
            data: [{x: 'z', y: 2}]
          }]
        }
      });

      expect(getLabels(chart.scales.x)).toEqual(['a', 'z']);

      chart.data.datasets.pop();
      chart.update();

      expect(getLabels(chart.scales.x)).toEqual(['a']);
      expect(chart.data.labels).toEqual(['a']);
    });

    it('should not add a string bound that is not in the data to data.labels', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{data: [{x: 'L0', y: 0}, {x: 'L1', y: 1}, {x: 'L2', y: 2}]}]
        },
        options: {
          scales: {x: {max: 'ZZ'}}
        }
      });

      expect(chart.scales.x.getLabels()).toEqual(['L0', 'L1', 'L2', 'ZZ']);
      expect(chart.data.labels).toEqual([]);
    });

    it('should show a label a beforeUpdate plugin pushes to data.labels on an axis with min', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a'],
          datasets: [{
            data: [1, 2]
          }]
        },
        options: {
          scales: {x: {min: 'a'}}
        },
        plugins: [{
          id: 'late',
          beforeUpdate(c) {
            if (c.data.labels.indexOf('late') === -1) {
              c.data.labels.push('late');
            }
          }
        }]
      });

      expect(getLabels(chart.scales.x)).toEqual(['a', 'late']);
    });

    it('should infer labels only from data plotted on that category scale', function() {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            data: [{x: 'Medications', y: 1}],
            xAxisID: 'xMed'
          }, {
            data: [{x: 'Encounters', y: 2}],
            xAxisID: 'xEnc'
          }]
        },
        options: {
          scales: {
            xMed: {
              type: 'category'
            },
            xEnc: {
              type: 'category'
            },
            y: {
              type: 'linear'
            }
          }
        }
      });

      expect(getLabels(chart.scales.xMed)).toEqual(['Medications']);
      expect(getLabels(chart.scales.xEnc)).toEqual(['Encounters']);
      expect(chart.scales.xMed.getPixelForValue('Medications')).toBeCloseToPixel(chart.scales.xMed.getPixelForTick(0));
      expect(chart.scales.xEnc.getPixelForValue('Encounters')).toBeCloseToPixel(chart.scales.xEnc.getPixelForTick(0));
    });

    it('should not mix labels inferred for the x and y category scales', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: [{x: 'Jan', y: 'Low'}, {x: 'Feb', y: 'High'}]
          }]
        },
        options: {
          scales: {
            x: {
              type: 'category'
            },
            y: {
              type: 'category'
            }
          }
        }
      });

      expect(getLabels(chart.scales.x)).toEqual(['Jan', 'Feb']);
      expect(getLabels(chart.scales.y)).toEqual(['Low', 'High']);
    });

    it('should show only its own category on each of two stacked category axes', function() {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            data: [{x: 1, y: 'A'}],
            yAxisID: 'y1'
          }, {
            data: [{x: 2, y: 'B'}],
            yAxisID: 'y2'
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {type: 'linear'},
            y1: {type: 'category', stack: 'demo'},
            y2: {type: 'category', stack: 'demo'}
          }
        }
      });

      expect(getLabels(chart.scales.y1)).toEqual(['A']);
      expect(getLabels(chart.scales.y2)).toEqual(['B']);
    });

    it('should still share user provided labels across category scales', function() {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          labels: ['A', 'B'],
          datasets: [{
            data: [1, 2],
            xAxisID: 'x1'
          }, {
            data: [3, 4],
            xAxisID: 'x2'
          }]
        },
        options: {
          scales: {
            x1: {
              type: 'category'
            },
            x2: {
              type: 'category'
            }
          }
        }
      });

      expect(getLabels(chart.scales.x1)).toEqual(['A', 'B']);
      expect(getLabels(chart.scales.x2)).toEqual(['A', 'B']);
    });

    it('should start a second category axis from data.labels and add its own labels after them', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['Jan', 'Feb'],
          datasets: [{
            data: [{x: 'Jan', y: 'Low'}, {x: 'Feb', y: 'High'}]
          }]
        },
        options: {
          scales: {
            x: {type: 'category'},
            y: {type: 'category'}
          }
        }
      });

      expect(getLabels(chart.scales.x)).toEqual(['Jan', 'Feb']);
      expect(chart.scales.y.getLabels()).toEqual(['Jan', 'Feb', 'Low', 'High']);
      expect(chart.data.labels).toEqual(['Jan', 'Feb']);
    });

    it('should show only its own labels on a second category axis with a labels option', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['Jan', 'Feb'],
          datasets: [{
            data: [{x: 'Jan', y: 'Low'}, {x: 'Feb', y: 'High'}]
          }]
        },
        options: {
          scales: {
            x: {type: 'category'},
            y: {type: 'category', labels: ['Low', 'High']}
          }
        }
      });

      expect(getLabels(chart.scales.x)).toEqual(['Jan', 'Feb']);
      expect(getLabels(chart.scales.y)).toEqual(['Low', 'High']);
      expect(chart.data.labels).toEqual(['Jan', 'Feb']);
    });
  });

  describe('labels found in data changed in place', function() {
    function createChart() {
      return window.acquireChart({
        type: 'line',
        data: {
          datasets: [{data: [{x: 'a', y: 1}, {x: 'b', y: 2}]}]
        }
      });
    }

    function parsedX(chart) {
      return chart.getDatasetMeta(0)._parsed.map(p => p.x);
    }

    it('should keep the labels in data order after a push', function() {
      var chart = createChart();

      chart.data.datasets[0].data.push({x: 'n', y: 3});
      chart.update();

      expect(chart.scales.x.getLabels()).toEqual(['a', 'b', 'n']);
      expect(parsedX(chart)).toEqual([0, 1, 2]);
    });

    it('should keep the labels in data order after a splice', function() {
      var chart = createChart();

      chart.data.datasets[0].data.splice(1, 0, {x: 'n', y: 3});
      chart.update();

      expect(chart.scales.x.getLabels()).toEqual(['a', 'n', 'b']);
      expect(parsedX(chart)).toEqual([0, 1, 2]);
    });

    it('should keep the labels in data order after an unshift', function() {
      var chart = createChart();

      chart.data.datasets[0].data.unshift({x: 'n', y: 3});
      chart.update();

      expect(chart.scales.x.getLabels()).toEqual(['n', 'a', 'b']);
      expect(parsedX(chart)).toEqual([0, 1, 2]);
    });

    it('should not move a pushed duplicate label to the front', function() {
      var chart = createChart();

      chart.data.datasets[0].data.push({x: 'b', y: 3});
      chart.update();

      expect(chart.scales.x.getLabels()).toEqual(['a', 'b']);
      expect(parsedX(chart)).toEqual([0, 1, 1]);
    });

    it('should keep the labels in data order after several changes', function() {
      var chart = createChart();
      var data = chart.data.datasets[0].data;

      data.push({x: 'n', y: 3});
      data.unshift({x: 'm', y: 4});
      data.splice(2, 0, {x: 'o', y: 5});
      chart.update();

      expect(chart.scales.x.getLabels()).toEqual(['m', 'a', 'o', 'b', 'n']);
      expect(parsedX(chart)).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('multi-line labels', function() {
    function parsedX(chart) {
      return chart.getDatasetMeta(0)._parsed.map(p => p.x);
    }

    it('should infer multi-line labels from object data', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: [{x: ['Line', 'one'], y: 1}, {x: ['Line', 'two'], y: 2}]
          }]
        }
      });
      var scale = chart.scales.x;

      expect(scale.getLabels()).toEqual([['Line', 'one'], ['Line', 'two']]);
      expect(parsedX(chart)).toEqual([0, 1]);
      expect(chart.getDatasetMeta(0).data[1].x).toBeCloseToPixel(scale.getPixelForTick(1));
      expect(chart.data.labels).toEqual([]);
    });

    it('should match multi-line labels in data.labels by their lines', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: [['Line', 'one'], ['Line', 'two']],
          datasets: [{
            data: [{x: ['Line', 'one'], y: 1}, {x: ['Line', 'two'], y: 2}]
          }]
        }
      });
      var scale = chart.scales.x;

      expect(parsedX(chart)).toEqual([0, 1]);
      expect(scale.getLabels().length).toBe(2);
      expect(chart.getDatasetMeta(0).data[0].x).toBeCloseToPixel(scale.getPixelForTick(0));
      expect(chart.getDatasetMeta(0).data[1].x).toBeCloseToPixel(scale.getPixelForTick(1));
    });

    it('should draw equal multi-line labels at the same tick', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: [{x: ['Line', 'one'], y: 1}, {x: ['Line', 'one'], y: 2}]
          }]
        }
      });

      expect(chart.scales.x.getLabels()).toEqual([['Line', 'one']]);
      expect(parsedX(chart)).toEqual([0, 0]);
    });

    it('should get the pixel of a multi-line label', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: [['Line', 'one'], ['Line', 'two']],
          datasets: [{
            data: [1, 2]
          }]
        }
      });
      var scale = chart.scales.x;

      expect(scale.getPixelForValue(['Line', 'two'])).toBeCloseToPixel(scale.getPixelForTick(1));
      expect(scale.getLabels().length).toBe(2);
    });

    it('should find multi-line labels given out of data order', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: [['a'], ['b'], ['c']],
          datasets: [{
            data: [{x: ['c'], y: 1}, {x: ['a'], y: 2}]
          }]
        }
      });
      var scale = chart.scales.x;
      var pixel = scale.getPixelForValue(['b']);

      expect(parsedX(chart)).toEqual([2, 0]);
      expect(pixel).not.toBeNaN();
      expect(pixel).toBeCloseToPixel(scale.getPixelForTick(1));
    });

    it('should not match a multi-line label that has only some of the lines', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          labels: [['a']],
          datasets: [{
            data: [{x: ['a', 'b'], y: 1}]
          }]
        }
      });

      expect(chart.scales.x.getLabels()).toEqual([['a'], ['a', 'b']]);
      expect(parsedX(chart)).toEqual([1]);
    });

    it('should treat a one-item numeric array as a label, not as an index', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: [{x: 'a', y: 1}, {x: [0], y: 2}]
          }]
        }
      });

      expect(chart.scales.x.getLabels()).toEqual(['a', [0]]);
      expect(parsedX(chart)).toEqual([0, 1]);
    });
  });
});
