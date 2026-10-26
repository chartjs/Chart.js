describe('RTL direction restoration', function() {
  ['ltr', 'rtl'].forEach(function(direction) {
    ['', 'ltr', 'rtl'].forEach(function(original) {
      ['', 'important'].forEach(function(priority) {
        it('restores canvas style after legend direction ' + direction + '/' + original + '/' + priority, function() {
          const chart = window.acquireChart({type: 'line', data: {labels: ['A'], datasets: [{label: 'Hello, World!', data: [1]}]}, options: {animation: false, responsive: false, plugins: {legend: {textDirection: direction}}}});
          const style = chart.canvas.style;
          style.setProperty('direction', original, priority);
          const expected = [style.getPropertyValue('direction'), style.getPropertyPriority('direction')];
          chart.draw();
          expect([style.getPropertyValue('direction'), style.getPropertyPriority('direction')]).toEqual(expected);
          expect(chart.ctx.prevTextDirection).toBeUndefined();
        });
      });
    });
  });
});

describe('Tooltip direction restoration', function() {
  ['ltr', 'rtl'].forEach(function(direction) {
    ['', 'ltr', 'rtl'].forEach(function(original) {
      ['', 'important'].forEach(function(priority) {
        it('restores canvas after tooltip direction ' + direction + '/' + original + '/' + priority, function() {
          const chart = window.acquireChart({type: 'line', data: {labels: ['A'], datasets: [{label: 'Hello, World!', data: [1]}]}, options: {animation: false, responsive: false, plugins: {legend: false, tooltip: {textDirection: direction}}}});
          chart.tooltip.setActiveElements([{datasetIndex: 0, index: 0}], {x: 100, y: 100});
          const style = chart.canvas.style;
          style.setProperty('direction', original, priority);
          const expected = [style.getPropertyValue('direction'), style.getPropertyPriority('direction')];
          chart.draw();
          expect([style.getPropertyValue('direction'), style.getPropertyPriority('direction')]).toEqual(expected);
          expect(chart.ctx.prevTextDirection).toBeUndefined();
        });
      });
    });
  });
});

describe('Direction helper compatibility', function() {
  it('retains an explicitly supplied restoration tuple', function() {
    const ctx = document.createElement('canvas').getContext('2d');
    Chart.helpers.overrideTextDirection(ctx, 'rtl');
    Chart.helpers.restoreTextDirection(ctx, ['ltr', 'important']);
    expect(ctx.canvas.style.getPropertyValue('direction')).toBe('ltr');
    expect(ctx.canvas.style.getPropertyPriority('direction')).toBe('important');
    expect(ctx.prevTextDirection).toBeUndefined();
  });

  it('does not change style when no override was saved', function() {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.style.setProperty('direction', 'rtl');
    Chart.helpers.restoreTextDirection(ctx);
    expect(ctx.canvas.style.getPropertyValue('direction')).toBe('rtl');
  });
});

describe('Legend and tooltip direction isolation', function() {
  it('does not leak the legend override into a tooltip using the canvas default', function() {
    const chart = window.acquireChart({type: 'line', data: {labels: ['A'], datasets: [{label: 'Hello, World!', data: [1]}]}, options: {animation: false, responsive: false, plugins: {legend: {textDirection: 'rtl'}}}});
    chart.canvas.style.setProperty('direction', 'ltr');
    chart.tooltip.setActiveElements([{datasetIndex: 0, index: 0}], {x: 100, y: 100});
    const drawBody = chart.tooltip.drawBody;
    let direction;
    chart.tooltip.drawBody = function() {
      direction = getComputedStyle(chart.canvas).direction;
      return drawBody.apply(this, arguments);
    };
    chart.draw();
    expect(direction).toBe('ltr');
  });
});
