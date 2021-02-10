describe('Chart.elements.PointElement', function() {
  describe('auto', jasmine.fixture.specs('element.point'));

  it ('Should correctly identify as in range', function() {
    // Mock out the point as if we were made by the controller
    var point = new Chart.elements.PointElement({
      options: {
        radius: 2,
        hitRadius: 3,
      },
      x: 10,
      y: 15
    });

    expect(point.inRange(10, 15)).toBe(true);
    expect(point.inRange(10, 10)).toBe(false);
    expect(point.inRange(10, 5)).toBe(false);
    expect(point.inRange(5, 5)).toBe(false);
  });

  it ('should get the correct tooltip position', function() {
    // Mock out the point as if we were made by the controller
    var point = new Chart.elements.PointElement({
      options: {
        radius: 2,
        borderWidth: 6,
      },
      x: 10,
      y: 15
    });

    expect(point.tooltipPosition()).toEqual({
      x: 10,
      y: 15
    });
  });

  it('should get the correct center point', function() {
    // Mock out the point as if we were made by the controller
    var point = new Chart.elements.PointElement({
      options: {
        radius: 2,
      },
      x: 10,
      y: 10
    });

    expect(point.getCenterPoint()).toEqual({x: 10, y: 10});
  });

  it ('should not draw if skipped', function() {
    var mockContext = window.createMockContext();

    // Mock out the point as if we were made by the controller
    var point = new Chart.elements.PointElement({
      options: {
        radius: 2,
        hitRadius: 3,
      },
      x: 10,
      y: 15,
      skip: true
    });

    point.draw(mockContext);

    expect(mockContext.getCalls()).toEqual([]);
  });
});
