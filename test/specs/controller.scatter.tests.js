describe('Chart.controllers.scatter', function() {
  describe('auto', jasmine.fixture.specs('controller.scatter'));

  it('should be registered as dataset controller', function() {
    expect(typeof Chart.controllers.scatter).toBe('function');
  });

  it('should test default tooltip callbacks', async function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          data: [{
            x: 10,
            y: 15
          }],
          label: 'dataset1'
        }],
      },
      options: {}
    });
    var point = chart.getDatasetMeta(0).data[0];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);
    // Title should be empty
    expect(chart.tooltip.title.length).toBe(0);
    expect(chart.tooltip.body[0].lines).toEqual(['(10, 15)']);
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
});
