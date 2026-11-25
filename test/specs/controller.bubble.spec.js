describe('Chart.controllers.bubble', function() {
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

    vi.spyOn(meta.data[0], 'draw').mockImplementation(() => {});
    vi.spyOn(meta.data[1], 'draw').mockImplementation(() => {});
    vi.spyOn(meta.data[2], 'draw').mockImplementation(() => {});
    vi.spyOn(meta.data[3], 'draw').mockImplementation(() => {});

    chart.update();

    expect(meta.data[0].draw.mock.calls.length).toBe(1);
    expect(meta.data[1].draw.mock.calls.length).toBe(1);
    expect(meta.data[2].draw.mock.calls.length).toBe(1);
    expect(meta.data[3].draw.mock.calls.length).toBe(1);
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
      expect(meta.data[i].options).toEqual(expect.objectContaining({
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
      expect(meta.data[i].options).toEqual(expect.objectContaining({
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
    let chart;

    beforeEach(function() {
      chart = window.acquireChart({
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
      var point = chart.getDatasetMeta(0).data[0];

      await triggerMouseEvent(chart, 'mousemove', point);
      expect(point.options.backgroundColor).toBe('#3187DD');
      expect(point.options.borderColor).toBe('#175A9D');
      expect(point.options.borderWidth).toBe(1);
      expect(point.options.radius).toBe(20 + 4);

      await triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(20);
    });

    it ('should handle hover styles defined via dataset properties', async function() {
      var point = chart.getDatasetMeta(0).data[0];

      Chart.helpers.merge(chart.data.datasets[0], {
        hoverBackgroundColor: 'rgb(200, 100, 150)',
        hoverBorderColor: 'rgb(150, 50, 100)',
        hoverBorderWidth: 8.4,
        hoverRadius: 4.2
      });

      chart.update();

      await triggerMouseEvent(chart, 'mousemove', point);
      expect(point.options.backgroundColor).toBe('rgb(200, 100, 150)');
      expect(point.options.borderColor).toBe('rgb(150, 50, 100)');
      expect(point.options.borderWidth).toBe(8.4);
      expect(point.options.radius).toBe(20 + 4.2);

      await triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(20);
    });

    it ('should handle hover styles defined via element options', async function() {
      var point = chart.getDatasetMeta(0).data[0];

      Chart.helpers.merge(chart.options.elements.point, {
        hoverBackgroundColor: 'rgb(200, 100, 150)',
        hoverBorderColor: 'rgb(150, 50, 100)',
        hoverBorderWidth: 8.4,
        hoverRadius: 4.2
      });

      chart.update();

      await triggerMouseEvent(chart, 'mousemove', point);
      expect(point.options.backgroundColor).toBe('rgb(200, 100, 150)');
      expect(point.options.borderColor).toBe('rgb(150, 50, 100)');
      expect(point.options.borderWidth).toBe(8.4);
      expect(point.options.radius).toBe(20 + 4.2);

      await triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(20);
    });
  });

  it('should not override tooltip title and label callbacks', async() => {
    const chart = window.acquireChart({
      type: 'bubble',
      data: {
        labels: ['Label 1', 'Label 2'],
        datasets: [{
          data: [{
            x: 10,
            y: 15,
            r: 15
          },
          {
            x: 12,
            y: 10,
            r: 10
          }],
          label: 'Dataset 1'
        }, {
          data: [{
            x: 20,
            y: 10,
            r: 5
          },
          {
            x: 4,
            y: 8,
            r: 30
          }],
          label: 'Dataset 2'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
      }
    });
    const {tooltip} = chart;
    const point = chart.getDatasetMeta(0).data[0];

    await triggerMouseEvent(chart, 'mousemove', point);

    expect(tooltip.title).toEqual(['Label 1']);
    expect(tooltip.body).toEqual([{
      before: [],
      lines: ['Dataset 1: (10, 15, 15)'],
      after: []
    }]);

    chart.options.plugins.tooltip = {mode: 'dataset'};
    chart.update();
    await triggerMouseEvent(chart, 'mousemove', point);

    expect(tooltip.title).toEqual(['Dataset 1']);
    expect(tooltip.body).toEqual([{
      before: [],
      lines: ['Label 1: (10, 15, 15)'],
      after: []
    }, {
      before: [],
      lines: ['Label 2: (12, 10, 10)'],
      after: []
    }]);
  });

  describe('tooltip label', function() {
    function labelOf(index, data, scales) {
      const chart = window.acquireChart({
        type: 'bubble',
        data,
        options: {scales}
      });
      return chart.getDatasetMeta(0).controller.getLabelAndValue(index).label;
    }

    it('should come from a category x axis whose labels come from the data', function() {
      const data = {datasets: [{data: [{x: 'a', y: 1, r: 5}, {x: 'b', y: 2, r: 5}]}]};
      expect(labelOf(1, data, {x: {type: 'category'}})).toBe('b');
    });

    it('should come from a category y axis when the x axis is linear', function() {
      const data = {datasets: [{data: [{x: 1, y: 'a', r: 5}, {x: 2, y: 'b', r: 5}]}]};
      expect(labelOf(1, data, {x: {type: 'linear'}, y: {type: 'category'}})).toBe('b');
    });

    it('should come from the x axis when both axes are category axes', function() {
      const data = {datasets: [{data: [{x: 'a', y: 'c', r: 5}, {x: 'b', y: 'd', r: 5}]}]};
      const scales = {x: {type: 'category', labels: ['a', 'b']}, y: {type: 'category', labels: ['c', 'd']}};
      expect(labelOf(1, data, scales)).toBe('b');
    });

    it('should name the category of the point, not the label at its index', function() {
      const data = {datasets: [{data: [{x: 'a', y: 1, r: 5}, {x: 'b', y: 2, r: 5}, {x: 'a', y: 3, r: 5}]}]};
      expect(labelOf(2, data, {x: {type: 'category'}})).toBe('a');
    });

    it('should be the entry of data.labels at the index when there is one', function() {
      const data = {
        labels: ['first', 'second'],
        datasets: [{data: [{x: 'a', y: 1, r: 5}, {x: 'b', y: 2, r: 5}]}]
      };
      expect(labelOf(1, data, {x: {type: 'category', labels: ['a', 'b']}})).toBe('second');
    });

    it('should be empty without data.labels or a category axis', function() {
      const data = {datasets: [{data: [{x: 1, y: 1, r: 5}, {x: 2, y: 2, r: 5}]}]};
      expect(labelOf(1, data, {})).toBe('');
    });

    it('should be empty for a point without a category', function() {
      const data = {datasets: [{data: [{x: 'a', y: 1, r: 5}, {x: null, y: 2, r: 5}]}]};
      expect(labelOf(1, data, {x: {type: 'category'}})).toBe('');
    });
  });
});
