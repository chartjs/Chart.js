describe('Chart.controllers.scatter', function() {
  describe('auto', jasmine.fixture.specs('controller.scatter'));

  it('should be registered as dataset controller', function() {
    expect(typeof Chart.controllers.scatter).toBe('function');
  });

  it('should only show a single point in the tooltip on multiple datasets', async function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          data: [{
            x: 10,
            y: 15
          },
          {
            x: 12,
            y: 10
          }],
          label: 'dataset1'
        },
        {
          data: [{
            x: 20,
            y: 10
          },
          {
            x: 4,
            y: 8
          }],
          label: 'dataset2'
        }]
      },
      options: {}
    });
    var point = chart.getDatasetMeta(0).data[1];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);
    expect(chart.tooltip.body.length).toEqual(1);
  });

  it('should not create line element by default', function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          data: [{
            x: 10,
            y: 15
          },
          {
            x: 12,
            y: 10
          }],
          label: 'dataset1'
        },
        {
          data: [{
            x: 20,
            y: 10
          },
          {
            x: 4,
            y: 8
          }],
          label: 'dataset2'
        }]
      },
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.dataset instanceof Chart.elements.LineElement).toBe(false);
  });

  it('should create line element if showline is true at datasets options', function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          showLine: true,
          data: [{
            x: 10,
            y: 15
          },
          {
            x: 12,
            y: 10
          }],
          label: 'dataset1'
        },
        {
          data: [{
            x: 20,
            y: 10
          },
          {
            x: 4,
            y: 8
          }],
          label: 'dataset2'
        }]
      },
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.dataset instanceof Chart.elements.LineElement).toBe(true);
  });

  it('should create line element if showline is true at root options', function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          data: [{
            x: 10,
            y: 15
          },
          {
            x: 12,
            y: 10
          }],
          label: 'dataset1'
        },
        {
          data: [{
            x: 20,
            y: 10
          },
          {
            x: 4,
            y: 8
          }],
          label: 'dataset2'
        }]
      },
      options: {
        showLine: true
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.dataset instanceof Chart.elements.LineElement).toBe(true);
  });

  it('should not override tooltip title and label callbacks', async() => {
    const chart = window.acquireChart({
      type: 'scatter',
      data: {
        labels: ['Label 1', 'Label 2'],
        datasets: [{
          data: [{
            x: 10,
            y: 15
          },
          {
            x: 12,
            y: 10
          }],
          label: 'Dataset 1'
        }, {
          data: [{
            x: 20,
            y: 10
          },
          {
            x: 4,
            y: 8
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

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);

    expect(tooltip.title).toEqual(['Label 1']);
    expect(tooltip.body).toEqual([{
      before: [],
      lines: ['Dataset 1: (10, 15)'],
      after: []
    }]);

    chart.options.plugins.tooltip = {mode: 'dataset'};
    chart.update();
    await jasmine.triggerMouseEvent(chart, 'mousemove', point);

    expect(tooltip.title).toEqual(['Dataset 1']);
    expect(tooltip.body).toEqual([{
      before: [],
      lines: ['Label 1: (10, 15)'],
      after: []
    }, {
      before: [],
      lines: ['Label 2: (12, 10)'],
      after: []
    }]);
  });

  it('should not trim points beyond scale limits when clip is false', function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          data: [{x: 0, y: 1}, {x: 10, y: 2}, {x: 20, y: 3}, {x: 30, y: 1}, {x: 40, y: 2}, {x: 50, y: 3}]
        }]
      },
      options: {
        scales: {
          x: {
            min: 11,
            max: 40
          }
        }
      }
    });

    var controller = chart.getDatasetMeta(0).controller;
    expect(controller._drawStart).toBe(1);
    expect(controller._drawCount).toBe(4);

    chart.data.datasets[0].clip = false;
    chart.update();

    expect(controller._drawStart).toBe(0);
    expect(controller._drawCount).toBe(6);
  });
});
