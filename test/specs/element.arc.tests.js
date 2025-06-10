// Test the rectangle element

describe('Arc element tests', function() {
  it ('should determine if in range', function() {
    // Mock out the arc as if the controller put it there
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 2,
      x: 0,
      y: 0,
      innerRadius: 5,
      outerRadius: 10,
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 0
      }
    });

    expect(arc.inRange(2, 2)).toBe(false);
    expect(arc.inRange(7, 0)).toBe(true);
    expect(arc.inRange(0, 11)).toBe(false);
    expect(arc.inRange(Math.sqrt(32), Math.sqrt(32))).toBe(true);
    expect(arc.inRange(-1.0 * Math.sqrt(7), Math.sqrt(7))).toBe(false);
  });

  it ('should determine if in range when full circle', function() {
    // Mock out the arc as if the controller put it there
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI * 2,
      x: 0,
      y: 0,
      innerRadius: 5,
      outerRadius: 10,
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 0
      }
    });

    for (const radius of [5, 7.5, 10]) {
      for (let angle = 0; angle <= 360; angle += 22.5) {
        const rad = angle / 180 * Math.PI;
        const x = Math.sin(rad) * radius;
        const y = Math.cos(rad) * radius;
        expect(arc.inRange(x, y)).withContext(`radius: ${radius}, angle: ${angle}`).toBeTrue();
      }
    }
    for (const radius of [4, 11]) {
      for (let angle = 0; angle <= 360; angle += 22.5) {
        const rad = angle / 180 * Math.PI;
        const x = Math.sin(rad) * radius;
        const y = Math.cos(rad) * radius;
        expect(arc.inRange(x, y)).withContext(`radius: ${radius}, angle: ${angle}`).toBeFalse();
      }
    }
  });

  it ('should include spacing for in range check', function() {
    // Mock out the arc as if the controller put it there
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 2,
      x: 0,
      y: 0,
      innerRadius: 5,
      outerRadius: 10,
      options: {
        spacing: 10,
        offset: 0,
        borderWidth: 0
      }
    });

    expect(arc.inRange(7, 0)).toBe(false);
    expect(arc.inRange(15, 0)).toBe(true);
  });

  it ('should include borderWidth for in range check', function() {
    // Mock out the arc as if the controller put it there
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 2,
      x: 0,
      y: 0,
      innerRadius: 5,
      outerRadius: 10,
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 10
      }
    });

    expect(arc.inRange(7, 0)).toBe(false);
    expect(arc.inRange(15, 0)).toBe(true);
  });

  it ('should determine if in range, when full circle', function() {
    // Mock out the arc as if the controller put it there
    var arc = new Chart.elements.ArcElement({
      startAngle: -Math.PI,
      endAngle: Math.PI * 1.5,
      x: 0,
      y: 0,
      innerRadius: 0,
      outerRadius: 10,
      circumference: Math.PI * 2,
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 0
      }
    });

    expect(arc.inRange(7, 7)).toBe(true);
  });

  it ('should get the tooltip position', function() {
    // Mock out the arc as if the controller put it there
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 2,
      x: 0,
      y: 0,
      innerRadius: 0,
      outerRadius: Math.sqrt(2),
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 0
      }
    });

    var pos = arc.tooltipPosition();
    expect(pos.x).toBeCloseTo(0.5);
    expect(pos.y).toBeCloseTo(0.5);
  });

  it ('should get the center', function() {
    // Mock out the arc as if the controller put it there
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 2,
      x: 0,
      y: 0,
      innerRadius: 0,
      outerRadius: Math.sqrt(2),
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 0
      }
    });

    var center = arc.getCenterPoint();
    expect(center.x).toBeCloseTo(0.5, 6);
    expect(center.y).toBeCloseTo(0.5, 6);
  });

  it ('should get the center with offset and spacing', function() {
    // Mock out the arc as if the controller put it there
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 2,
      x: 0,
      y: 0,
      innerRadius: 0,
      outerRadius: Math.sqrt(2),
      options: {
        spacing: 10,
        offset: 10,
        borderWidth: 0
      }
    });

    var center = arc.getCenterPoint();
    expect(center.x).toBeCloseTo(7.57, 1);
    expect(center.y).toBeCloseTo(7.57, 1);
  });

  it ('should get the center of full circle before and after draw', function() {
    // Mock out the arc as if the controller put it there
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI * 2,
      x: 2,
      y: 2,
      innerRadius: 0,
      outerRadius: 2,
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 0
      }
    });

    var center = arc.getCenterPoint();
    expect(center.x).toBeCloseTo(1, 6);
    expect(center.y).toBeCloseTo(2, 6);

    var ctx = window.createMockContext();
    arc.draw(ctx);

    center = arc.getCenterPoint();
    expect(center.x).toBeCloseTo(1, 6);
    expect(center.y).toBeCloseTo(2, 6);
  });

  it('should not draw when radius < 0', function() {
    var ctx = window.createMockContext();

    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 2,
      x: 0,
      y: 0,
      innerRadius: -0.1,
      outerRadius: Math.sqrt(2),
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 0
      }
    });

    arc.draw(ctx);

    expect(ctx.getCalls().length).toBe(0);

    arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 2,
      x: 0,
      y: 0,
      innerRadius: 0,
      outerRadius: -1,
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 0
      }
    });

    arc.draw(ctx);

    expect(ctx.getCalls().length).toBe(0);
  });

  it('should draw when circular: false', function() {
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI * 2,
      x: 2,
      y: 2,
      innerRadius: 0,
      outerRadius: 2,
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 0,
        scales: {
          r: {
            grid: {
              circular: false,
            },
          },
        },
        elements: {
          arc: {
            circular: false
          },
        },
      }
    });

    var ctx = window.createMockContext();
    arc.draw(ctx);

    expect(ctx.getCalls().length).toBeGreaterThan(0);
  });

  it ('should determine not in range when angle 0', function() {
    // Mock out the arc as if the controller put it there
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: 0,
      x: 0,
      y: 0,
      innerRadius: 0,
      outerRadius: 10,
      circumference: 0,
      options: {
        spacing: 0,
        offset: 0,
        borderWidth: 0
      }
    });

    var center = arc.getCenterPoint();

    expect(arc.inRange(center.x, 1)).toBe(false);
  });
});
