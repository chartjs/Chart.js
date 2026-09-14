// https://github.com/chartjs/Chart.js/issues/12251
// An auto-height container with maintainAspectRatio could only ever shrink.
describe('Issue #12251 - chart follows an auto-height container in both directions', function() {
  let originalDescriptor;

  beforeEach(function() {
    originalDescriptor = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
  });

  afterEach(function() {
    if (originalDescriptor) {
      Object.defineProperty(window, 'devicePixelRatio', originalDescriptor);
    } else {
      delete window.devicePixelRatio;
    }
  });

  function acquire(onResize) {
    return acquireChart({
      type: 'line',
      data: {labels: ['a', 'b', 'c'], datasets: [{data: [1, 2, 3]}]},
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: false,
        onResize
      }
    }, {
      canvas: {style: ''},
      // No explicit height: the container is as tall as the canvas, as on chartjs.org.
      wrapper: {style: 'width: 300px; position: relative'}
    });
  }

  [1, 1.35].forEach(function(dpr) {
    it('follows the container both when it grows and when it shrinks at DPR ' + dpr, function(done) {
      Object.defineProperty(window, 'devicePixelRatio', {configurable: true, get: () => dpr});
      const resizes = [];
      const chart = acquire((c, size) => resizes.push({...size, cw: c.canvas.width, ch: c.canvas.height}));
      const wrapper = chart.canvas.parentNode;
      const tracked = [];

      // Widths chosen so width * DPR is not an integer, which is where rounding bites.
      const widths = [333.3, 401.7, 250.1, 377.9];
      let step = 0;

      function next() {
        if (step === widths.length) {
          // The bug: growth was refused while shrink was honoured, so the chart
          // could only ever get smaller. Every change must be followed, both ways.
          tracked.forEach(({target, got}) => {
            expect(Math.abs(got - target)).toBeLessThan(1, `chart.width ${got} should follow container ${target}`);
          });
          done();
          return;
        }
        wrapper.style.width = widths[step++] + 'px';
        // Give the observer several frames to settle so any ping-pong is counted.
        setTimeout(() => {
          const target = parseFloat(wrapper.style.width);
          tracked.push({target, got: chart.width});
          next();
        }, 250);
      }
      next();
    });
  });

  it('does not lose size across repeated identical resizes', function(done) {
    Object.defineProperty(window, 'devicePixelRatio', {configurable: true, get: () => 1.35});
    const chart = acquire();
    const wrapper = chart.canvas.parentNode;
    let i = 0;
    const seen = [];

    function bounce() {
      if (i === 12) {
        const distinct = new Set(seen);
        expect(distinct.size).toBe(1, 'same container width must always yield the same canvas size, got: ' + [...distinct].join(','));
        done();
        return;
      }
      // Alternate between two widths; every return to 333.3 must give the same result.
      wrapper.style.width = (i % 2 === 0 ? 333.3 : 400) + 'px';
      setTimeout(() => {
        if (i % 2 === 0) {
          seen.push(chart.canvas.width);
        }
        i++;
        bounce();
      }, 150);
    }
    bounce();
  });

  it('stays stable while a looping animation keeps the animator running', function(done) {
    // A looping animation keeps the animator running, so every resize is deferred.
    Object.defineProperty(window, 'devicePixelRatio', {configurable: true, get: () => 1.35});
    const chart = acquireChart({
      type: 'line',
      data: {labels: ['a', 'b', 'c'], datasets: [{data: [1, 2, 3]}]},
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animations: {tension: {duration: 200, easing: 'linear', from: 1, to: 0, loop: true}}
      }
    }, {
      canvas: {style: ''},
      wrapper: {style: 'width: 300px; position: relative'}
    });
    const wrapper = chart.canvas.parentNode;
    const widths = [];

    // Hold the container still and watch: a stable chart keeps one width.
    setTimeout(() => {
      wrapper.style.width = '380px';
      const sample = setInterval(() => widths.push(chart.width), 100);
      setTimeout(() => {
        clearInterval(sample);
        const settled = widths.slice(-5);
        expect(new Set(settled).size).toBe(1, 'chart must settle to one width, got: ' + settled.join(','));
        expect(Math.abs(settled[0] - 380)).toBeLessThan(1, 'chart must follow the container to 380px');
        chart.destroy();
        done();
      }, 1500);
    }, 400);
  });

  // With the animator running, resizes are deferred and applied with a stale height,
  // which used to be mistaken for a fixed container and clamped to.
  it('grows back after shrinking, instead of clamping to its own previous height', function(done) {
    const chart = acquireChart({
      type: 'line',
      data: {labels: ['a', 'b', 'c'], datasets: [{data: [1, 2, 3]}]},
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animations: {tension: {duration: 200, easing: 'linear', from: 1, to: 0, loop: true}}
      }
    }, {canvas: {style: ''}, wrapper: {style: 'width: 552.6px; position: relative'}});
    const wrapper = chart.canvas.parentNode;
    const trace = [];

    function drag(path, then) {
      let i = 0;
      (function frame() {
        if (i < path.length) {
          wrapper.style.width = path[i++] + 'px';
          requestAnimationFrame(frame);
        } else {
          setTimeout(then, 400);
        }
      }());
    }
    const steps = (from, to, by) => {
      const out = [];
      for (let w = from; by > 0 ? w <= to : w >= to; w += by) {
        out.push(+w.toFixed(1));
      }
      return out;
    };

    setTimeout(() => {
      drag(steps(552.6, 360.6, -6), () => {
        trace.push(`after shrink: container ${wrapper.getBoundingClientRect().width.toFixed(1)} chart ${chart.width}`);
        drag(steps(360.6, 614, 6), () => {
          const cw = wrapper.getBoundingClientRect().width;
          trace.push(`after grow:   container ${cw.toFixed(1)} chart ${chart.width}`);
          expect(Math.abs(chart.width - cw)).toBeLessThan(1, `chart ${chart.width} must follow the container back up to ${cw.toFixed(1)}`);
          chart.destroy();
          done();
        });
      });
    }, 300);
  });
});
