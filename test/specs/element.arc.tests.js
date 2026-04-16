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

  it('should use angular spacing mode independently from proportional mode', function() {
    function createArc(spacingMode) {
      return new Chart.elements.ArcElement({
        startAngle: 0,
        endAngle: Math.PI / 2,
        x: 0,
        y: 0,
        innerRadius: 0,
        outerRadius: 100,
        options: {
          circular: true,
          spacingMode: spacingMode,
          spacing: 20,
          offset: 0,
          borderWidth: 0,
          borderRadius: 0,
          backgroundColor: 'red',
          borderColor: 'black'
        }
      });
    }

    function firstOuterArcStartAngle(arc) {
      var ctx = window.createMockContext();
      arc.draw(ctx);

      var arcCall = ctx.getCalls().filter(function(x) {
        return x.name === 'arc';
      })[0];
      if (arcCall) {
        return arcCall.args[3];
      }

      var lineToCall = ctx.getCalls().filter(function(x) {
        return x.name === 'lineTo';
      })[0];
      var dx = lineToCall.args[0] - arc.x;
      var dy = lineToCall.args[1] - arc.y;
      return Math.atan2(dy, dx);
    }

    var proportionalStart = firstOuterArcStartAngle(createArc('proportional'));
    var angularStart = firstOuterArcStartAngle(createArc('angular'));
    var alpha = Math.PI / 2;
    var spacing = 10; // draw() passes spacing / 2 to pathArc
    var avgNoSpacingRadius = 50;
    var adjustedAngle = (alpha * avgNoSpacingRadius) / (avgNoSpacingRadius + spacing);
    var proportionalSpacingOffset = (alpha - adjustedAngle) / 2;
    var angularSpacingOffset = Math.asin(Math.min(1, spacing / avgNoSpacingRadius));

    expect(angularStart - proportionalStart).toBeCloseTo(angularSpacingOffset - proportionalSpacingOffset, 6);
  });

  it('should keep valid arc direction with large parallel spacing', function() {
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 2,
      x: 0,
      y: 0,
      innerRadius: 40,
      outerRadius: 100,
      options: {
        circular: true,
        spacingMode: 'parallel',
        spacing: 40,
        offset: 0,
        borderWidth: 0,
        borderRadius: 0,
        backgroundColor: 'red',
        borderColor: 'black'
      }
    });

    var ctx = window.createMockContext();
    arc.draw(ctx);

    var arcCalls = ctx.getCalls().filter(function(x) {
      return x.name === 'arc';
    });

    // First two calls are the split outer arc segments; ensure they keep forward direction.
    expect(arcCalls[0].args[3]).toBeLessThan(arcCalls[0].args[4]);
    expect(arcCalls[1].args[3]).toBeLessThan(arcCalls[1].args[4]);
  });

  it('should not reverse end separator angle in parallel mode with large spacing', function() {
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 3,
      x: 0,
      y: 0,
      innerRadius: 40,
      outerRadius: 100,
      options: {
        circular: true,
        spacingMode: 'parallel',
        spacing: 20,
        offset: 0,
        borderWidth: 0,
        borderRadius: 0,
        backgroundColor: 'red',
        borderColor: 'black'
      }
    });

    var ctx = window.createMockContext();
    arc.draw(ctx);

    var arcCalls = ctx.getCalls().filter(function(x) {
      return x.name === 'arc';
    });
    var lineToCalls = ctx.getCalls().filter(function(x) {
      return x.name === 'lineTo';
    });

    var outerEndAngle = arcCalls[1].args[4];
    var innerEndAngle = Math.atan2(lineToCalls[0].args[1] - arc.y, lineToCalls[0].args[0] - arc.x);

    expect(innerEndAngle).toBeLessThan(outerEndAngle);
  });

  it('should create a non-zero root for parallel spacing when innerRadius is zero', function() {
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI / 3,
      x: 0,
      y: 0,
      innerRadius: 0,
      outerRadius: 100,
      options: {
        circular: true,
        spacingMode: 'parallel',
        spacing: 20,
        offset: 0,
        borderWidth: 0,
        borderRadius: 0,
        backgroundColor: 'red',
        borderColor: 'black'
      }
    });

    var ctx = window.createMockContext();
    arc.draw(ctx);

    var lineToCalls = ctx.getCalls().filter(function(x) {
      return x.name === 'lineTo';
    });
    var rootDistance = Math.hypot(lineToCalls[0].args[0] - arc.x, lineToCalls[0].args[1] - arc.y);

    expect(rootDistance).toBeGreaterThan(0);
  });

  it('should render full-circle geometry for selfJoin with borderRadius', function() {
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI * 2,
      x: 0,
      y: 0,
      innerRadius: 50,
      outerRadius: 100,
      options: {
        circular: true,
        selfJoin: true,
        spacing: 0,
        offset: 0,
        borderWidth: 6,
        borderRadius: 12,
        backgroundColor: 'red',
        borderColor: 'black'
      }
    });

    var ctx = window.createMockContext();
    arc.draw(ctx);

    var arcCalls = ctx.getCalls().filter(function(x) {
      return x.name === 'arc';
    });
    var radii = Array.from(new Set(arcCalls.map(function(x) {
      return x.args[2].toFixed(3);
    })));

    expect(radii.length).toBe(2);
    expect(Math.abs(arcCalls[0].args[4] - arcCalls[0].args[3])).toBeCloseTo(Math.PI * 2, 3);
  });

  it('should apply spacing to a full circle when selfJoin is false', function() {
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI * 2,
      x: 0,
      y: 0,
      innerRadius: 40,
      outerRadius: 100,
      options: {
        circular: true,
        selfJoin: false,
        spacingMode: 'angular',
        spacing: 20,
        offset: 0,
        borderWidth: 0,
        borderRadius: 0,
        backgroundColor: 'red',
        borderColor: 'black'
      }
    });

    var ctx = window.createMockContext();
    arc.draw(ctx);

    var firstOuterArc = ctx.getCalls().filter(function(x) {
      return x.name === 'arc';
    })[0];

    expect(firstOuterArc.args[4] - firstOuterArc.args[3]).toBeLessThan(Math.PI * 2);
  });

  it('should not clip full-circle selfJoin borders with evenodd clipping', function() {
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI * 2,
      x: 0,
      y: 0,
      innerRadius: 40,
      outerRadius: 100,
      options: {
        circular: true,
        selfJoin: true,
        spacing: 20,
        offset: 0,
        borderWidth: 2,
        borderRadius: 0,
        borderJoinStyle: 'round',
        backgroundColor: 'red',
        borderColor: 'black'
      }
    });

    var ctx = window.createMockContext();
    arc.draw(ctx);

    var evenOddClipCall = ctx.getCalls().find(function(x) {
      return x.name === 'clip' && x.args[0] === 'evenodd';
    });

    expect(evenOddClipCall).toBeUndefined();
  });

  it('should not draw a radial seam for full-circle selfJoin pie', function() {
    var arc = new Chart.elements.ArcElement({
      startAngle: 0,
      endAngle: Math.PI * 2,
      x: 10,
      y: 20,
      innerRadius: 0,
      outerRadius: 100,
      options: {
        circular: true,
        selfJoin: true,
        spacing: 0,
        offset: 0,
        borderWidth: 10,
        borderRadius: 1,
        borderJoinStyle: 'round',
        backgroundColor: 'red',
        borderColor: 'black'
      }
    });

    var ctx = window.createMockContext();
    arc.draw(ctx);

    var radialLineToCenter = ctx.getCalls().find(function(x) {
      return x.name === 'lineTo' && x.args[0] === arc.x && x.args[1] === arc.y;
    });

    expect(radialLineToCenter).toBeUndefined();
  });
});
