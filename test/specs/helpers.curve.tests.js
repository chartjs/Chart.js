describe('Curve helper tests', function() {
  let helpers;

  beforeAll(function() {
    helpers = window.Chart.helpers;
  });

  it('should spline curves', function() {
    expect(helpers.splineCurve({
      x: 0,
      y: 0
    }, {
      x: 1,
      y: 1
    }, {
      x: 2,
      y: 0
    }, 0)).toEqual({
      previous: {
        x: 1,
        y: 1,
      },
      next: {
        x: 1,
        y: 1,
      }
    });

    expect(helpers.splineCurve({
      x: 0,
      y: 0
    }, {
      x: 1,
      y: 1
    }, {
      x: 2,
      y: 0
    }, 1)).toEqual({
      previous: {
        x: 0,
        y: 1,
      },
      next: {
        x: 2,
        y: 1,
      }
    });
  });

  it('should spline curves with monotone cubic interpolation', function() {
    var dataPoints = [
      {x: 0, y: 0, skip: false},
      {x: 3, y: 6, skip: false},
      {x: 9, y: 6, skip: false},
      {x: 12, y: 60, skip: false},
      {x: 15, y: 60, skip: false},
      {x: 18, y: 120, skip: false},
      {x: null, y: null, skip: true},
      {x: 21, y: 180, skip: false},
      {x: 24, y: 120, skip: false},
      {x: 27, y: 125, skip: false},
      {x: 30, y: 105, skip: false},
      {x: 33, y: 110, skip: false},
      {x: 33, y: 110, skip: false},
      {x: 36, y: 170, skip: false}
    ];
    helpers.splineCurveMonotone(dataPoints);
    expect(dataPoints).toEqual([{
      x: 0,
      y: 0,
      skip: false,
      cp2x: 1,
      cp2y: 2
    },
    {
      x: 3,
      y: 6,
      skip: false,
      cp1x: 2,
      cp1y: 6,
      cp2x: 5,
      cp2y: 6
    },
    {
      x: 9,
      y: 6,
      skip: false,
      cp1x: 7,
      cp1y: 6,
      cp2x: 10,
      cp2y: 6
    },
    {
      x: 12,
      y: 60,
      skip: false,
      cp1x: 11,
      cp1y: 60,
      cp2x: 13,
      cp2y: 60
    },
    {
      x: 15,
      y: 60,
      skip: false,
      cp1x: 14,
      cp1y: 60,
      cp2x: 16,
      cp2y: 60
    },
    {
      x: 18,
      y: 120,
      skip: false,
      cp1x: 17,
      cp1y: 100
    },
    {
      x: null,
      y: null,
      skip: true
    },
    {
      x: 21,
      y: 180,
      skip: false,
      cp2x: 22,
      cp2y: 160
    },
    {
      x: 24,
      y: 120,
      skip: false,
      cp1x: 23,
      cp1y: 120,
      cp2x: 25,
      cp2y: 120
    },
    {
      x: 27,
      y: 125,
      skip: false,
      cp1x: 26,
      cp1y: 125,
      cp2x: 28,
      cp2y: 125
    },
    {
      x: 30,
      y: 105,
      skip: false,
      cp1x: 29,
      cp1y: 105,
      cp2x: 31,
      cp2y: 105
    },
    {
      x: 33,
      y: 110,
      skip: false,
      cp1x: 32,
      cp1y: 110,
      cp2x: 33,
      cp2y: 110
    },
    {
      x: 33,
      y: 110,
      skip: false,
      cp1x: 33,
      cp1y: 110,
      cp2x: 34,
      cp2y: 110
    },
    {
      x: 36,
      y: 170,
      skip: false,
      cp1x: 35,
      cp1y: 150
    }]);
  });
});
