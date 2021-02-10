const {color, getHoverColor} = Chart.helpers;

describe('Color helper', function() {
  function isColorInstance(obj) {
    return typeof obj === 'object' && obj.valid;
  }

  it('should return a color when called with a color', function() {
    expect(isColorInstance(color('rgb(1, 2, 3)'))).toBe(true);
  });
});

describe('Background hover color helper', function() {
  it('should return a modified version of color when called with a color', function() {
    var originalColorRGB = 'rgb(70, 191, 189)';

    expect(getHoverColor('#46BFBD')).not.toEqual(originalColorRGB);
  });
});

describe('color and getHoverColor helpers', function() {
  it('should return a CanvasPattern when called with a CanvasPattern', function(done) {
    var dots = new Image();
    dots.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAAD1BMVEUAAAD///////////////+PQt5oAAAABXRSTlMAHlFhZsfk/BEAAAAqSURBVHgBY2BgZGJmYmSAAUYWEIDzmcBcJhiXGcxlRpPFrhdmMiqgvX0AcGIBEUAo6UAAAAAASUVORK5CYII=';
    dots.onload = function() {
      var chartContext = document.createElement('canvas').getContext('2d');
      var patternCanvas = document.createElement('canvas');
      var patternContext = patternCanvas.getContext('2d');
      var pattern = patternContext.createPattern(dots, 'repeat');
      patternContext.fillStyle = pattern;
      var chartPattern = chartContext.createPattern(patternCanvas, 'repeat');

      expect(color(chartPattern) instanceof CanvasPattern).toBe(true);
      expect(getHoverColor(chartPattern) instanceof CanvasPattern).toBe(true);

      done();
    };
  });

  it('should return a CanvasGradient when called with a CanvasGradient', function() {
    var context = document.createElement('canvas').getContext('2d');
    var gradient = context.createLinearGradient(0, 1, 2, 3);

    expect(color(gradient) instanceof CanvasGradient).toBe(true);
    expect(getHoverColor(gradient) instanceof CanvasGradient).toBe(true);
  });
});
