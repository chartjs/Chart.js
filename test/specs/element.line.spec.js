// Tests for the line element
describe('Chart.elements.LineElement', function() {
  it('should be constructed', function() {
    var line = new Chart.elements.LineElement({
      points: [1, 2, 3, 4]
    });

    expect(line).not.toBe(undefined);
    expect(line.points).toEqual([1, 2, 3, 4]);
  });

  it('should not cache path when animations are enabled', async function() {
    var done;
    var complete = new Promise((resolve) => {
      done = resolve;
    });
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
    await complete;
  });

  describe('path without tension, stepping or dashes', function() {
    function createLine() {
      // The first three points share the truncated x-coordinate 0
      return new Chart.elements.LineElement({
        points: [{x: 0, y: 10}, {x: 0.25, y: 30}, {x: 0.5, y: 20}, {x: 5, y: 5}, {x: 10, y: 15}],
        options: {borderDash: [], cubicInterpolationMode: 'default', spanGaps: false, stepped: false, tension: 0}
      });
    }

    function recordPath(draw) {
      const calls = [];
      draw({
        moveTo: (x, y) => calls.push(['moveTo', x, y]),
        lineTo: (x, y) => calls.push(['lineTo', x, y])
      });
      return calls;
    }

    it('should draw the extent of points that share an x-coordinate', function() {
      const line = createLine();

      expect(recordPath((ctx) => line.path(ctx))).toEqual([
        ['moveTo', 0, 10],
        ['lineTo', 0, 10],
        ['lineTo', 0.375, 30],
        ['lineTo', 0.375, 10],
        ['lineTo', 0.375, 20],
        ['lineTo', 5, 5],
        ['lineTo', 10, 15]
      ]);
    });

    it('should draw a segment in reverse', function() {
      const line = createLine();
      const segment = line.segments[0];

      expect(recordPath((ctx) => line.pathSegment(ctx, segment, {reverse: true}))).toEqual([
        ['moveTo', 10, 15],
        ['lineTo', 10, 15],
        ['lineTo', 5, 5],
        ['lineTo', 0.5, 20],
        ['lineTo', 0.125, 30],
        ['lineTo', 0.125, 10],
        ['lineTo', 0.125, 10]
      ]);
      expect(recordPath((ctx) => line.pathSegment(ctx, segment, {reverse: true, move: false}))[0]).toEqual(['lineTo', 10, 15]);
    });
  });
});
