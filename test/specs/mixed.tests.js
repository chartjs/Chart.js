describe('Mixed charts', function() {
  describe('auto', jasmine.fixture.specs('mixed'));

  it('shoud be constructed with doughnuts chart', function() {
    const chart = window.acquireChart({
      data: {
        datasets: [{
          type: 'line',
          data: [10, 20, 30, 40],
        }, {
          type: 'doughnut',
          data: [10, 20, 30, 50],
        }
        ],
        labels: []
      }
    });

    const meta0 = chart.getDatasetMeta(0);
    expect(meta0.type).toEqual('line');
    const meta1 = chart.getDatasetMeta(1);
    expect(meta1.type).toEqual('doughnut');
  });

  it('shoud be constructed with pie chart', function() {
    const chart = window.acquireChart({
      data: {
        datasets: [{
          type: 'bar',
          data: [10, 20, 30, 40],
        }, {
          type: 'pie',
          data: [10, 20, 30, 50],
        }
        ],
        labels: []
      }
    });

    const meta0 = chart.getDatasetMeta(0);
    expect(meta0.type).toEqual('bar');
    const meta1 = chart.getDatasetMeta(1);
    expect(meta1.type).toEqual('pie');
  });

});
