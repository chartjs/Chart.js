describe('Chart.controllers.bubble', function() {
  describe('auto', jasmine.fixture.specs('controller.bubble'));

  it('should be registered as dataset controller', function() {
    expect(typeof Chart.controllers.bubble).toBe('function');
  });

  it('should be constructed', function() {
    var chart = window.acquireChart({
      type: 'bubble',
      data: {
        datasets: [{
          data: []
        }]
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.type).toBe('bubble');
    expect(meta.controller).not.toBe(undefined);
    expect(meta.controller.index).toBe(0);
    expect(meta.data).toEqual([]);

    meta.controller.updateIndex(1);
    expect(meta.controller.index).toBe(1);
  });

  it('should use the first scale IDs if the dataset does not specify them', function() {
    var chart = window.acquireChart({
      type: 'bubble',
      data: {
        datasets: [{
          data: []
        }]
      },
    });

    var meta = chart.getDatasetMeta(0);

    expect(meta.xAxisID).toBe('x');
    expect(meta.yAxisID).toBe('y');
  });

  it('should create point elements for each data item during initialization', function() {
    var chart = window.acquireChart({
      type: 'bubble',
      data: {
        datasets: [{
          data: [10, 15, 0, -4]
        }]
      }
    });

    var meta = chart.getDatasetMeta(0);

    expect(meta.data.length).toBe(4); // 4 points created
    expect(meta.data[0] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[2] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[3] instanceof Chart.elements.PointElement).toBe(true);
  });

  it('should draw all elements', function() {
    var chart = window.acquireChart({
      type: 'bubble',
      data: {
        datasets: [{
          data: [10, 15, 0, -4]
        }]
      },
      options: {
        animation: false,
        showLine: true
      }
    });

    var meta = chart.getDatasetMeta(0);

    spyOn(meta.data[0], 'draw');
    spyOn(meta.data[1], 'draw');
    spyOn(meta.data[2], 'draw');
    spyOn(meta.data[3], 'draw');

    chart.update();

    expect(meta.data[0].draw.calls.count()).toBe(1);
    expect(meta.data[1].draw.calls.count()).toBe(1);
    expect(meta.data[2].draw.calls.count()).toBe(1);
    expect(meta.data[3].draw.calls.count()).toBe(1);
  });

  it('should update elements when modifying style', function() {
    var chart = window.acquireChart({
      type: 'bubble',
      data: {
        datasets: [{
          data: [{
            x: 10,
            y: 10,
            r: 5
          }, {
            x: -15,
            y: -10,
            r: 1
          }, {
            x: 0,
            y: -9,
            r: 2
          }, {
            x: -4,
            y: 10,
            r: 1
          }]
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
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            display: false
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(0);

    [
      {r: 5, x: 5, y: 5},
      {r: 1, x: 171, y: 507},
      {r: 2, x: 341, y: 482},
      {r: 1, x: 507, y: 5}
    ].forEach(function(expected, i) {
      expect(meta.data[i].x).toBeCloseToPixel(expected.x);
      expect(meta.data[i].y).toBeCloseToPixel(expected.y);
      expect(meta.data[i].options).toEqual(jasmine.objectContaining({
        backgroundColor: Chart.defaults.backgroundColor,
        borderColor: Chart.defaults.borderColor,
        borderWidth: 1,
        hitRadius: 1,
        radius: expected.r
      }));
    });

    // Use dataset level styles for lines & points
    chart.data.datasets[0].backgroundColor = 'rgb(98, 98, 98)';
    chart.data.datasets[0].borderColor = 'rgb(8, 8, 8)';
    chart.data.datasets[0].borderWidth = 0.55;

    // point styles
    chart.data.datasets[0].radius = 22;
    chart.data.datasets[0].hitRadius = 3.3;

    chart.update();

    for (var i = 0; i < 4; ++i) {
      expect(meta.data[i].options).toEqual(jasmine.objectContaining({
        backgroundColor: 'rgb(98, 98, 98)',
        borderColor: 'rgb(8, 8, 8)',
        borderWidth: 0.55,
        hitRadius: 3.3
      }));
    }
  });

  it('should handle number of data point changes in update', function() {
    var chart = window.acquireChart({
      type: 'bubble',
      data: {
        datasets: [{
          data: [{
            x: 10,
            y: 10,
            r: 5
          }, {
            x: -15,
            y: -10,
            r: 1
          }, {
            x: 0,
            y: -9,
            r: 2
          }, {
            x: -4,
            y: 10,
            r: 1
          }]
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);

    expect(meta.data.length).toBe(4);

    chart.data.datasets[0].data = [{
      x: 1,
      y: 1,
      r: 10
    }, {
      x: 10,
      y: 5,
      r: 2
    }]; // remove 2 items

    chart.update();

    expect(meta.data.length).toBe(2);
    expect(meta.data[0] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.PointElement).toBe(true);

    chart.data.datasets[0].data = [{
      x: 10,
      y: 10,
      r: 5
    }, {
      x: -15,
      y: -10,
      r: 1
    }, {
      x: 0,
      y: -9,
      r: 2
    }, {
      x: -4,
      y: 10,
      r: 1
    }, {
      x: -5,
      y: 0,
      r: 3
    }]; // add 3 items

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
        type: 'bubble',
        data: {
          labels: ['label1', 'label2', 'label3', 'label4'],
          datasets: [{
            data: [{
              x: 5,
              y: 5,
              r: 20
            }, {
              x: -15,
              y: -10,
              r: 15
            }, {
              x: 15,
              y: 10,
              r: 10
            }, {
              x: -15,
              y: 10,
              r: 5
            }]
          }]
        },
        options: {
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
      expect(point.options.radius).toBe(20 + 4);

      await jasmine.triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(20);
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
      expect(point.options.radius).toBe(20 + 4.2);

      await jasmine.triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(20);
    });

    it ('should handle hover styles defined via element options', async function() {
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
      expect(point.options.radius).toBe(20 + 4.2);

      await jasmine.triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(20);
    });
  });
});
