// Tests for the line element
describe('Chart.elements.LineElement', function() {
  describe('auto', jasmine.fixture.specs('element.line'));

  it('should be constructed', function() {
    var line = new Chart.elements.LineElement({
      points: [1, 2, 3, 4]
    });

    expect(line).not.toBe(undefined);
    expect(line.points).toEqual([1, 2, 3, 4]);
  });

  it('should not cache path when animations are enabled', function(done) {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: [0, -1, 0],
          label: 'dataset1',
        }],
        labels: ['label1', 'label2', 'label3']
      },
      options: {
        animation: {
          duration: 50,
          onComplete: () => {
            expect(chart.getDatasetMeta(0).dataset._path).toBeUndefined();
            done();
          }
        }
      }
    });
  });
});
