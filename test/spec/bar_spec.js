/* global describe, it */
(function () {
  describe('Bar Chart Function Test', function () {
    this.timeout(5000);
    beforeEach(function() {
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.id = 'canvas';
      this.canvasElement.width =  500;
      this.canvasElement.height = 500;
      document.body.appendChild(this.canvasElement);
    });

    afterEach(function() {
      document.body.removeChild(this.canvasElement);
    });

    it('test width', function(done) {
      var canvas = document.getElementById("canvas")
      expect(canvas.width).to.equal(500);
      var ctx = document.getElementById("canvas").getContext("2d");
      var moveToSpy = sinon.spy(ctx, 'moveTo');
      ctx.moveTo(10,20);
      expect(moveToSpy.calledWith(10, 20)).to.equal(true);

      done();
    });

    it('should run here few assertions', function(done) {
      var ctx = document.getElementById("canvas").getContext("2d");

      var moveToSpy = sinon.spy(ctx, 'moveTo');
      var lineToSpy = sinon.spy(ctx, 'lineTo');

      var expectedValues = [
        { base: 477, leftX: 29.5,  rightX: 134.5, top: 323, },
        { base: 477, leftX: 137.5, rightX: 242.5, top: 168, },
        { base: 477, leftX: 254.5, rightX: 359.5, top: 168, },
        { base: 477, leftX: 362.5, rightX: 467.5, top: 13, },
      ];

      /*
      // NOTE: This is the way to get the expectedValues

      var datasetsLength = myBar.datasets.length;
      for(var i = 0; i < datasetsLength; i++) {
        var bars = myBar.datasets[i].bars;

        for(var j = 0; j < bars.length; j++) {
          var width = myBar.scale.calculateBarWidth(bars.length);
          var x =     myBar.scale.calculateBarX(datasetsLength, j, i);
          var y =     myBar.scale.calculateY(bars[j].value);
          var base =  myBar.scale.endPoint;

          var halfWidth = width / 2;

          var expectation = {
            base:      base,
            leftX:     x - halfWidth,
            rightX:    x + halfWidth,
            top:       base - (base - y),
          };

          if(myBar.options.barShowStroke) {
            var halfStroke = myBar.options.barStrokeWidth / 2;
            expectation.leftX  += halfStroke;
            expectation.rightX -= halfStroke;
            expectation.top    += halfStroke;
          }

          expectedValues.push(expectation);
        }
      }
       */

      var options = {
        onAnimationComplete: function() {
          expectedValues.forEach(function(expected) {
            expect(moveToSpy.calledWith(expected.leftX,  expected.base)).to.equal(true);
            expect(lineToSpy.calledWith(expected.leftX,   expected.top)).to.equal(true);
            expect(lineToSpy.calledWith(expected.rightX,  expected.top)).to.equal(true);
            expect(lineToSpy.calledWith(expected.rightX, expected.base)).to.equal(true);
          });
          done();
        },
      };

      var barChartData = {
        labels : ["January","February"],
        datasets : [
          {
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data: [10, 20],
          },
          {
            fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "rgba(151,187,205,0.8)",
            highlightFill : "rgba(151,187,205,0.75)",
            highlightStroke : "rgba(151,187,205,1)",
            data: [20, 30],
          }
        ]
      };

      var myBar = new Chart(ctx).Bar(barChartData, options);
    });
  });
})();
