describe('Chart.controllers.scatter', function() {
  describe('auto', jasmine.fixture.specs('controller.scatter'));

  it('should be registered as dataset controller', function() {
    expect(typeof Chart.controllers.scatter).toBe('function');
  });

  it('should test default tooltip callbacks', function(done) {
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

    afterEvent(chart, 'mousemove', function() {
      // Title should be empty
      expect(chart.tooltip.title.length).toBe(0);
      expect(chart.tooltip.body[0].lines).toEqual(['(10, 15)']);

      done();
    });

    jasmine.triggerMouseEvent(chart, 'mousemove', point);
  });

  it('should only show a single point in the tooltip on multiple datasets', function(done) {
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

    afterEvent(chart, 'mousemove', function() {
      expect(chart.tooltip.body.length).toEqual(1);

      done();
    });

    jasmine.triggerMouseEvent(chart, 'mousemove', point);
  });
});
