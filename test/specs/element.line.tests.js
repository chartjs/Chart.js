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

describe('stepped line interpolation path agreement', function() {
  ['before', 'after', 'middle', true].forEach(function(stepped) {
    [false, true].forEach(function(reverse) {
      it('matches the drawn horizontal step for ' + stepped + ' reverse=' + reverse, function() {
        const points = reverse ? [{x: 100, y: 20}, {x: 0, y: 80}] : [{x: 0, y: 20}, {x: 100, y: 80}];
        const line = new Chart.elements.LineElement({points, options: {stepped, tension: 0}});
        [0, 0.25, 0.75, 1].forEach(function(t) {
          const x = points[0].x + t * (points[1].x - points[0].x);
          const expected = t === 0 ? 20 : t === 1 ? 80 : stepped === 'middle' ? (t < 0.5 ? 20 : 80) : stepped === 'after' ? 80 : 20;
          const path = new Path2D();
          line.pathSegment(path, line.segments[0]);
          const ctx = document.createElement('canvas').getContext('2d');
          ctx.lineWidth = 2;
          expect(ctx.isPointInStroke(path, x, expected)).toBeTrue();
          const sampled = line.interpolate({x}, 'x');
          expect(ctx.isPointInStroke(path, sampled.x, sampled.y)).toBeTrue();
          expect(sampled.y).toBe(expected);
        });
      });
    });
  });
});
