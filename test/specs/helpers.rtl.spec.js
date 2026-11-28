const {overrideTextDirection, restoreTextDirection} = Chart.helpers;

describe('helpers.rtl', function() {
  it('sets the context direction and restores it', function() {
    const ctx = document.createElement('canvas').getContext('2d');

    overrideTextDirection(ctx, 'rtl');
    expect(ctx.direction).toBe('rtl');

    restoreTextDirection(ctx);
    expect(ctx.direction).toBe('inherit');
    expect(ctx.canvas.style.direction).toBe('');
  });

  it('works on an OffscreenCanvas', function() {
    const ctx = new OffscreenCanvas(10, 10).getContext('2d');

    overrideTextDirection(ctx, 'rtl');
    expect(ctx.direction).toBe('rtl');

    restoreTextDirection(ctx);
    expect(ctx.direction).toBe('inherit');
  });
});
