describe('Chart.controllers.line', function() {
  describe('auto', jasmine.fixture.specs('controller.line'));

  it('should be registered as dataset controller', function() {
    expect(typeof Chart.controllers.line).toBe('function');
  });

  it('should be constructed', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: []
        }],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.type).toBe('line');
    expect(meta.controller).not.toBe(undefined);
    expect(meta.controller.index).toBe(0);
    expect(meta.data).toEqual([]);

    meta.controller.updateIndex(1);
    expect(meta.controller.index).toBe(1);
  });

  it('Should use the first scale IDs if the dataset does not specify them', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: []
        }],
        labels: []
      },
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.xAxisID).toBe('x');
    expect(meta.yAxisID).toBe('y');
  });

  it('Should not throw with empty dataset when tension is non-zero', function() {
    // https://github.com/chartjs/Chart.js/issues/8676
    function createChart() {
      return window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: [],
            tension: 0.5
          }],
          labels: []
        },
      });
    }
    expect(createChart).not.toThrow();
  });

  it('should find min and max for stacked chart', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, 11, 12, 13]
        }, {
          data: [1, 2, 3, 4]
        }],
        labels: ['a', 'b', 'c', 'd']
      },
      options: {
        scales: {
          y: {
            stacked: true
          }
        }
      }
    });
    expect(chart.getDatasetMeta(0).controller.getMinMax(chart.scales.y, true)).toEqual({min: 10, max: 13});
    expect(chart.getDatasetMeta(1).controller.getMinMax(chart.scales.y, true)).toEqual({min: 11, max: 17});
    chart.hide(0);
    expect(chart.getDatasetMeta(0).controller.getMinMax(chart.scales.y, true)).toEqual({min: 10, max: 13});
    expect(chart.getDatasetMeta(1).controller.getMinMax(chart.scales.y, true)).toEqual({min: 1, max: 4});
  });

  it('Should create line elements and point elements for each data item during initialization', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, 15, 0, -4],
          label: 'dataset1'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.data.length).toBe(4); // 4 points created
    expect(meta.data[0] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[2] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[3] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.dataset instanceof Chart.elements.LineElement).toBe(true); // 1 line element
  });

  it('should draw all elements', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, 15, 0, -4],
          label: 'dataset1'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        showLine: true
      }
    });

    var meta = chart.getDatasetMeta(0);
    spyOn(meta.dataset, 'updateControlPoints');
    spyOn(meta.dataset, 'draw');
    spyOn(meta.data[0], 'draw');
    spyOn(meta.data[1], 'draw');
    spyOn(meta.data[2], 'draw');
    spyOn(meta.data[3], 'draw');

    chart.update();

    expect(meta.dataset.updateControlPoints.calls.count()).toBeGreaterThanOrEqual(1);
    expect(meta.dataset.draw.calls.count()).toBe(1);
    expect(meta.data[0].draw.calls.count()).toBe(1);
    expect(meta.data[1].draw.calls.count()).toBe(1);
    expect(meta.data[2].draw.calls.count()).toBe(1);
    expect(meta.data[3].draw.calls.count()).toBe(1);
  });

  it('should update elements when modifying data', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, 15, 0, -4],
          label: 'dataset',
          xAxisID: 'x',
          yAxisID: 'y'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        showLine: true,
        plugins: {
          legend: false,
          title: false
        },
        elements: {
          point: {
            backgroundColor: 'red',
            borderColor: 'blue',
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        }
      },
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.data.length).toBe(4);

    chart.data.datasets[0].data = [1, 2]; // remove 2 items
    chart.data.datasets[0].borderWidth = 1;
    chart.update();

    expect(meta.data.length).toBe(2);
    expect(meta._parsed.length).toBe(2);

    [
      {x: 5, y: 507},
      {x: 171, y: 5}
    ].forEach(function(expected, i) {
      expect(meta.data[i].x).toBeCloseToPixel(expected.x);
      expect(meta.data[i].y).toBeCloseToPixel(expected.y);
      expect(meta.data[i].options).toEqual(jasmine.objectContaining({
        backgroundColor: 'red',
        borderColor: 'blue',
      }));
    });

    chart.data.datasets[0].data = [1, 2, 3]; // add 1 items
    chart.update();

    expect(meta.data.length).toBe(3); // should add a new meta data item
  });

  it('should correctly calculate x scale for label and point', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: ['One'],
        datasets: [{
          data: [1],
        }]
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            beginAtZero: true
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(0);
    // 1 point
    var point = meta.data[0];
    expect(point.x).toBeCloseToPixel(5);

    // 2 points
    chart.data.labels = ['One', 'Two'];
    chart.data.datasets[0].data = [1, 2];
    chart.update();

    var points = meta.data;

    expect(points[0].x).toBeCloseToPixel(5);
    expect(points[1].x).toBeCloseToPixel(507);

    // 3 points
    chart.data.labels = ['One', 'Two', 'Three'];
    chart.data.datasets[0].data = [1, 2, 3];
    chart.update();

    points = meta.data;

    expect(points[0].x).toBeCloseToPixel(5);
    expect(points[1].x).toBeCloseToPixel(256);
    expect(points[2].x).toBeCloseToPixel(507);

    // 4 points
    chart.data.labels = ['One', 'Two', 'Three', 'Four'];
    chart.data.datasets[0].data = [1, 2, 3, 4];
    chart.update();

    points = meta.data;

    expect(points[0].x).toBeCloseToPixel(5);
    expect(points[1].x).toBeCloseToPixel(171);
    expect(points[2].x).toBeCloseToPixel(340);
    expect(points[3].x).toBeCloseToPixel(507);
  });

  it('should update elements when the y scale is stacked', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, -10, 10, -10],
          label: 'dataset1'
        }, {
          data: [10, 15, 0, -4],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            stacked: true
          }
        }
      }
    });

    var meta0 = chart.getDatasetMeta(0);

    [
      {x: 5, y: 148},
      {x: 171, y: 435},
      {x: 341, y: 148},
      {x: 507, y: 435}
    ].forEach(function(values, i) {
      expect(meta0.data[i].x).toBeCloseToPixel(values.x);
      expect(meta0.data[i].y).toBeCloseToPixel(values.y);
    });

    var meta1 = chart.getDatasetMeta(1);

    [
      {x: 5, y: 5},
      {x: 171, y: 76},
      {x: 341, y: 148},
      {x: 507, y: 492}
    ].forEach(function(values, i) {
      expect(meta1.data[i].x).toBeCloseToPixel(values.x);
      expect(meta1.data[i].y).toBeCloseToPixel(values.y);
    });

  });

  it('should update elements when the y scale is stacked with multiple axes', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, -10, 10, -10],
          label: 'dataset1'
        }, {
          data: [10, 15, 0, -4],
          label: 'dataset2'
        }, {
          data: [10, 10, -10, -10],
          label: 'dataset3',
          yAxisID: 'y2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false,
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            stacked: true
          },
          y2: {
            type: 'linear',
            position: 'right',
            display: false
          }
        }
      }
    });

    var meta0 = chart.getDatasetMeta(0);

    [
      {x: 5, y: 148},
      {x: 171, y: 435},
      {x: 341, y: 148},
      {x: 507, y: 435}
    ].forEach(function(values, i) {
      expect(meta0.data[i].x).toBeCloseToPixel(values.x);
      expect(meta0.data[i].y).toBeCloseToPixel(values.y);
    });

    var meta1 = chart.getDatasetMeta(1);

    [
      {x: 5, y: 5},
      {x: 171, y: 76},
      {x: 341, y: 148},
      {x: 507, y: 492}
    ].forEach(function(values, i) {
      expect(meta1.data[i].x).toBeCloseToPixel(values.x);
      expect(meta1.data[i].y).toBeCloseToPixel(values.y);
    });

  });

  it('should update elements when the y scale is stacked and datasets is scatter data', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [{
            x: 0,
            y: 10
          }, {
            x: 1,
            y: -10
          }, {
            x: 2,
            y: 10
          }, {
            x: 3,
            y: -10
          }],
          label: 'dataset1'
        }, {
          data: [{
            x: 0,
            y: 10
          }, {
            x: 1,
            y: 15
          }, {
            x: 2,
            y: 0
          }, {
            x: 3,
            y: -4
          }],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            stacked: true
          }
        }
      }
    });

    var meta0 = chart.getDatasetMeta(0);

    [
      {x: 5, y: 148},
      {x: 171, y: 435},
      {x: 341, y: 148},
      {x: 507, y: 435}
    ].forEach(function(values, i) {
      expect(meta0.data[i].x).toBeCloseToPixel(values.x);
      expect(meta0.data[i].y).toBeCloseToPixel(values.y);
    });

    var meta1 = chart.getDatasetMeta(1);

    [
      {x: 5, y: 5},
      {x: 171, y: 76},
      {x: 341, y: 148},
      {x: 507, y: 492}
    ].forEach(function(values, i) {
      expect(meta1.data[i].x).toBeCloseToPixel(values.x);
      expect(meta1.data[i].y).toBeCloseToPixel(values.y);
    });

  });

  it('should update elements when the y scale is stacked and data is strings', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: ['10', '-10', '10', '-10'],
          label: 'dataset1'
        }, {
          data: ['10', '15', '0', '-4'],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            stacked: true
          }
        }
      }
    });

    var meta0 = chart.getDatasetMeta(0);

    [
      {x: 5, y: 148},
      {x: 171, y: 435},
      {x: 341, y: 148},
      {x: 507, y: 435}
    ].forEach(function(values, i) {
      expect(meta0.data[i].x).toBeCloseToPixel(values.x);
      expect(meta0.data[i].y).toBeCloseToPixel(values.y);
    });

    var meta1 = chart.getDatasetMeta(1);

    [
      {x: 5, y: 5},
      {x: 171, y: 76},
      {x: 341, y: 148},
      {x: 507, y: 492}
    ].forEach(function(values, i) {
      expect(meta1.data[i].x).toBeCloseToPixel(values.x);
      expect(meta1.data[i].y).toBeCloseToPixel(values.y);
    });

  });

  it('should fall back to the line styles for points', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [0, 0],
          label: 'dataset1',

          // line styles
          backgroundColor: 'rgb(98, 98, 98)',
          borderColor: 'rgb(8, 8, 8)',
          borderWidth: 0.55,
        }],
        labels: ['label1', 'label2']
      }
    });

    var meta = chart.getDatasetMeta(0);

    expect(meta.dataset.options.backgroundColor).toBe('rgb(98, 98, 98)');
    expect(meta.dataset.options.borderColor).toBe('rgb(8, 8, 8)');
    expect(meta.dataset.options.borderWidth).toBe(0.55);
  });

  describe('dataset global defaults', function() {
    beforeEach(function() {
      this._defaults = Chart.helpers.clone(Chart.defaults.datasets.line);
    });

    afterEach(function() {
      Chart.defaults.datasets.line = this._defaults;
      delete this._defaults;
    });

    it('should utilize the dataset global default options', function() {
      Chart.helpers.merge(Chart.defaults.datasets.line, {
        spanGaps: true,
        tension: 0.231,
        backgroundColor: '#add',
        borderWidth: '#daa',
        borderColor: '#dad',
        borderCapStyle: 'round',
        borderDash: [0],
        borderDashOffset: 0.871,
        borderJoinStyle: 'miter',
        fill: 'start',
        cubicInterpolationMode: 'monotone'
      });

      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: [0, 0],
            label: 'dataset1'
          }],
          labels: ['label1', 'label2']
        }
      });

      var options = chart.getDatasetMeta(0).dataset.options;

      expect(options.spanGaps).toBe(true);
      expect(options.tension).toBe(0.231);
      expect(options.backgroundColor).toBe('#add');
      expect(options.borderWidth).toBe('#daa');
      expect(options.borderColor).toBe('#dad');
      expect(options.borderCapStyle).toBe('round');
      expect(options.borderDash).toEqual([0]);
      expect(options.borderDashOffset).toBe(0.871);
      expect(options.borderJoinStyle).toBe('miter');
      expect(options.fill).toBe('start');
      expect(options.cubicInterpolationMode).toBe('monotone');
    });

    it('should be overridden by user-supplied values', function() {
      Chart.helpers.merge(Chart.defaults.datasets.line, {
        spanGaps: true,
        tension: 0.231
      });

      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: [0, 0],
            label: 'dataset1',
            spanGaps: true,
            backgroundColor: '#dad'
          }],
          labels: ['label1', 'label2']
        },
        options: {
          datasets: {
            line: {
              tension: 0.345,
              backgroundColor: '#add'
            }
          }
        }
      });

      var options = chart.getDatasetMeta(0).dataset.options;

      // dataset-level option overrides global default
      expect(options.spanGaps).toBe(true);
      // chart-level default overrides global default
      expect(options.tension).toBe(0.345);
      // dataset-level option overrides chart-level default
      expect(options.backgroundColor).toBe('#dad');
    });
  });

  it('should obey the chart-level dataset options', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [0, 0],
          label: 'dataset1'
        }],
        labels: ['label1', 'label2']
      },
      options: {
        datasets: {
          line: {
            spanGaps: true,
            tension: 0.231,
            backgroundColor: '#add',
            borderWidth: '#daa',
            borderColor: '#dad',
            borderCapStyle: 'round',
            borderDash: [0],
            borderDashOffset: 0.871,
            borderJoinStyle: 'miter',
            fill: 'start',
            cubicInterpolationMode: 'monotone'
          }
        }
      }
    });

    var options = chart.getDatasetMeta(0).dataset.options;

    expect(options.spanGaps).toBe(true);
    expect(options.tension).toBe(0.231);
    expect(options.backgroundColor).toBe('#add');
    expect(options.borderWidth).toBe('#daa');
    expect(options.borderColor).toBe('#dad');
    expect(options.borderCapStyle).toBe('round');
    expect(options.borderDash).toEqual([0]);
    expect(options.borderDashOffset).toBe(0.871);
    expect(options.borderJoinStyle).toBe('miter');
    expect(options.fill).toBe('start');
    expect(options.cubicInterpolationMode).toBe('monotone');
  });

  it('should obey the dataset options', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [0, 0],
          label: 'dataset1',
          spanGaps: true,
          tension: 0.231,
          backgroundColor: '#add',
          borderWidth: '#daa',
          borderColor: '#dad',
          borderCapStyle: 'round',
          borderDash: [0],
          borderDashOffset: 0.871,
          borderJoinStyle: 'miter',
          fill: 'start',
          cubicInterpolationMode: 'monotone'
        }],
        labels: ['label1', 'label2']
      }
    });

    var options = chart.getDatasetMeta(0).dataset.options;

    expect(options.spanGaps).toBe(true);
    expect(options.tension).toBe(0.231);
    expect(options.backgroundColor).toBe('#add');
    expect(options.borderWidth).toBe('#daa');
    expect(options.borderColor).toBe('#dad');
    expect(options.borderCapStyle).toBe('round');
    expect(options.borderDash).toEqual([0]);
    expect(options.borderDashOffset).toBe(0.871);
    expect(options.borderJoinStyle).toBe('miter');
    expect(options.fill).toBe('start');
    expect(options.cubicInterpolationMode).toBe('monotone');
  });

  it('should handle number of data point changes in update', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, 15, 0, -4],
          label: 'dataset1',
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);

    chart.data.datasets[0].data = [1, 2]; // remove 2 items
    chart.update();
    expect(meta.data.length).toBe(2);
    expect(meta.data[0] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.PointElement).toBe(true);

    chart.data.datasets[0].data = [1, 2, 3, 4, 5]; // add 3 items
    chart.update();
    expect(meta.data.length).toBe(5);
    expect(meta.data[0] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[2] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[3] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[4] instanceof Chart.elements.PointElement).toBe(true);
  });

  describe('Interactions', function() {
    beforeEach(function() {
      this.chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['label1', 'label2', 'label3', 'label4'],
          datasets: [{
            data: [10, 15, 0, -4]
          }]
        },
        options: {
          scales: {
            x: {
              offset: true
            }
          },
          elements: {
            point: {
              backgroundColor: 'rgb(100, 150, 200)',
              borderColor: 'rgb(50, 100, 150)',
              borderWidth: 2,
              radius: 3
            }
          }
        }
      });
    });

    it ('should handle default hover styles', async function() {
      var chart = this.chart;
      var point = chart.getDatasetMeta(0).data[0];

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);
      expect(point.options.backgroundColor).toBe('#3187DD');
      expect(point.options.borderColor).toBe('#175A9D');
      expect(point.options.borderWidth).toBe(1);
      expect(point.options.radius).toBe(4);

      await jasmine.triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(3);
    });

    it ('should handle hover styles defined via dataset properties', async function() {
      var chart = this.chart;
      var point = chart.getDatasetMeta(0).data[0];

      Chart.helpers.merge(chart.data.datasets[0], {
        hoverBackgroundColor: 'rgb(200, 100, 150)',
        hoverBorderColor: 'rgb(150, 50, 100)',
        hoverBorderWidth: 8.4,
        hoverRadius: 4.2
      });

      chart.update();

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);
      expect(point.options.backgroundColor).toBe('rgb(200, 100, 150)');
      expect(point.options.borderColor).toBe('rgb(150, 50, 100)');
      expect(point.options.borderWidth).toBe(8.4);
      expect(point.options.radius).toBe(4.2);

      await jasmine.triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(3);
    });

    it('should handle hover styles defined via element options', async function() {
      var chart = this.chart;
      var point = chart.getDatasetMeta(0).data[0];

      Chart.helpers.merge(chart.options.elements.point, {
        hoverBackgroundColor: 'rgb(200, 100, 150)',
        hoverBorderColor: 'rgb(150, 50, 100)',
        hoverBorderWidth: 8.4,
        hoverRadius: 4.2
      });

      chart.update();

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);
      expect(point.options.backgroundColor).toBe('rgb(200, 100, 150)');
      expect(point.options.borderColor).toBe('rgb(150, 50, 100)');
      expect(point.options.borderWidth).toBe(8.4);
      expect(point.options.radius).toBe(4.2);

      await jasmine.triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(3);
    });

    it('should handle dataset hover styles defined via dataset properties', async function() {
      var chart = this.chart;
      var point = chart.getDatasetMeta(0).data[0];
      var dataset = chart.getDatasetMeta(0).dataset;

      Chart.helpers.merge(chart.data.datasets[0], {
        backgroundColor: '#AAA',
        borderColor: '#BBB',
        borderWidth: 6,
        hoverBackgroundColor: '#000',
        hoverBorderColor: '#111',
        hoverBorderWidth: 12
      });

      chart.options.hover = {mode: 'dataset'};
      chart.update();

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);
      expect(dataset.options.backgroundColor).toBe('#000');
      expect(dataset.options.borderColor).toBe('#111');
      expect(dataset.options.borderWidth).toBe(12);

      await jasmine.triggerMouseEvent(chart, 'mouseout', point);
      expect(dataset.options.backgroundColor).toBe('#AAA');
      expect(dataset.options.borderColor).toBe('#BBB');
      expect(dataset.options.borderWidth).toBe(6);
    });
  });

  it('should allow 0 as a point border width', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, 15, 0, -4],
          label: 'dataset1',
          pointBorderWidth: 0
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);
    var point = meta.data[0];

    expect(point.options.borderWidth).toBe(0);
  });

  it('should allow an array as the point border width setting', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, 15, 0, -4],
          label: 'dataset1',
          pointBorderWidth: [1, 2, 3, 4]
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.data[0].options.borderWidth).toBe(1);
    expect(meta.data[1].options.borderWidth).toBe(2);
    expect(meta.data[2].options.borderWidth).toBe(3);
    expect(meta.data[3].options.borderWidth).toBe(4);
  });

  it('should render a million points', function() {
    var data = [];
    for (let x = 0; x < 1e6; x++) {
      data.push({x, y: Math.sin(x / 10000)});
    }
    function createChart() {
      window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data,
            borderWidth: 1,
            radius: 0
          }],
        },
        options: {
          scales: {
            x: {type: 'linear'},
            y: {type: 'linear'}
          }
        }
      });
    }
    expect(createChart).not.toThrow();
  });

  it('should set skipped points to the reset state', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [10, null, 0, -4],
          label: 'dataset1',
          pointBorderWidth: [1, 2, 3, 4]
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);
    var point = meta.data[1];
    var {x, y} = point.getProps(['x', 'y'], true);
    expect(point.skip).toBe(true);
    expect(isNaN(x)).toBe(false);
    expect(isNaN(y)).toBe(false);
  });
});
