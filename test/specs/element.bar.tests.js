// Test the bar element

describe('Bar element tests', function() {
  it('Should correctly identify as in range', function() {
    var bar = new Chart.elements.BarElement({
      base: 0,
      width: 4,
      x: 10,
      y: 15
    });

    expect(bar.inRange(10, 15)).toBe(true);
    expect(bar.inRange(10, 10)).toBe(true);
    expect(bar.inRange(10, 16)).toBe(false);
    expect(bar.inRange(5, 5)).toBe(false);

    // Test when the y is below the base (negative bar)
    var negativeBar = new Chart.elements.BarElement({
      base: 0,
      width: 4,
      x: 10,
      y: -15
    });

    expect(negativeBar.inRange(10, -16)).toBe(false);
    expect(negativeBar.inRange(10, 1)).toBe(false);
    expect(negativeBar.inRange(10, -5)).toBe(true);
  });

  it('should get the correct tooltip position', function() {
    var bar = new Chart.elements.BarElement({
      base: 0,
      width: 4,
      x: 10,
      y: 15
    });

    expect(bar.tooltipPosition()).toEqual({
      x: 10,
      y: 15,
    });

    // Test when the y is below the base (negative bar)
    var negativeBar = new Chart.elements.BarElement({
      base: -10,
      width: 4,
      x: 10,
      y: -15
    });

    expect(negativeBar.tooltipPosition()).toEqual({
      x: 10,
      y: -15,
    });
  });

  it('should get the center', function() {
    var bar = new Chart.elements.BarElement({
      base: 0,
      width: 4,
      x: 10,
      y: 15
    });

    expect(bar.getCenterPoint()).toEqual({x: 10, y: 7.5});
  });
});
