const {overrideTextDirection, restoreTextDirection} = Chart.helpers;

describe('helpers.rtl', function() {
  it('restores the original canvas direction after an RTL override', function() {
    const canvas = document.createElement('canvas');
    const ctx = {canvas};
    canvas.style.setProperty('direction', 'ltr', 'important');

    overrideTextDirection(ctx, 'rtl');
    expect(canvas.style.getPropertyValue('direction')).toBe('rtl');

    restoreTextDirection(ctx, 'rtl');

    expect(canvas.style.getPropertyValue('direction')).toBe('ltr');
    expect(canvas.style.getPropertyPriority('direction')).toBe('important');
    expect(ctx.prevTextDirection).toBeUndefined();
  });
});
