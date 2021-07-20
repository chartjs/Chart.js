const DomPlatform = Chart.platforms.DomPlatform;

describe('Platform.dom', function() {

  describe('context acquisition', function() {
    var canvasId = 'chartjs-canvas';

    beforeEach(function() {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('id', canvasId);
      window.document.body.appendChild(canvas);
    });

    afterEach(function() {
      document.getElementById(canvasId).remove();
    });

    it('should use the DomPlatform by default', function() {
      var chart = acquireChart({type: 'line'});

      expect(chart.platform).toBeInstanceOf(Chart.platforms.DomPlatform);

      chart.destroy();
    });

    // see https://github.com/chartjs/Chart.js/issues/2807
    it('should gracefully handle invalid item', function() {
      var chart = new Chart('foobar');

      expect(chart).not.toBeValidChart();

      chart.destroy();
    });

    it('should accept a DOM element id', function() {
      var canvas = document.getElementById(canvasId);
      var chart = new Chart(canvasId);

      expect(chart).toBeValidChart();
      expect(chart.canvas).toBe(canvas);
      expect(chart.ctx).toBe(canvas.getContext('2d'));

      chart.destroy();
    });

    it('should accept a canvas element', function() {
      var canvas = document.getElementById(canvasId);
      var chart = new Chart(canvas);

      expect(chart).toBeValidChart();
      expect(chart.canvas).toBe(canvas);
      expect(chart.ctx).toBe(canvas.getContext('2d'));

      chart.destroy();
    });

    it('should accept a canvas context2D', function() {
      var canvas = document.getElementById(canvasId);
      var context = canvas.getContext('2d');
      var chart = new Chart(context);

      expect(chart).toBeValidChart();
      expect(chart.canvas).toBe(canvas);
      expect(chart.ctx).toBe(context);

      chart.destroy();
    });

    it('should accept an array containing canvas', function() {
      var canvas = document.getElementById(canvasId);
      var chart = new Chart([canvas]);

      expect(chart).toBeValidChart();
      expect(chart.canvas).toBe(canvas);
      expect(chart.ctx).toBe(canvas.getContext('2d'));

      chart.destroy();
    });

    it('should accept a canvas from an iframe', function(done) {
      var iframe = document.createElement('iframe');
      iframe.onload = function() {
        var doc = iframe.contentDocument;
        doc.body.innerHTML += '<canvas id="chart"></canvas>';
        var canvas = doc.getElementById('chart');
        var chart = new Chart(canvas);

        expect(chart).toBeValidChart();
        expect(chart.canvas).toBe(canvas);
        expect(chart.ctx).toBe(canvas.getContext('2d'));

        chart.destroy();
        canvas.remove();
        iframe.remove();

        done();
      };

      document.body.appendChild(iframe);
    });
  });

  describe('config.options.aspectRatio', function() {
    it('should use default "global" aspect ratio for render and display sizes', function() {
      var chart = acquireChart({
        options: {
          responsive: false
        }
      }, {
        canvas: {
          style: 'width: 620px'
        }
      });

      expect(chart).toBeChartOfSize({
        dw: 620, dh: 310,
        rw: 620, rh: 310,
      });
    });

    it('should use default "chart" aspect ratio for render and display sizes', function() {
      var ratio = Chart.overrides.doughnut.aspectRatio;
      Chart.overrides.doughnut.aspectRatio = 1;

      var chart = acquireChart({
        type: 'doughnut',
        options: {
          responsive: false
        }
      }, {
        canvas: {
          style: 'width: 425px'
        }
      });

      Chart.overrides.doughnut.aspectRatio = ratio;

      expect(chart).toBeChartOfSize({
        dw: 425, dh: 425,
        rw: 425, rh: 425,
      });
    });

    it('should use "user" aspect ratio for render and display sizes', function() {
      var chart = acquireChart({
        options: {
          responsive: false,
          aspectRatio: 3
        }
      }, {
        canvas: {
          style: 'width: 405px'
        }
      });

      expect(chart).toBeChartOfSize({
        dw: 405, dh: 135,
        rw: 405, rh: 135,
      });
    });

    it('should not apply aspect ratio when height specified', function() {
      var chart = acquireChart({
        options: {
          responsive: false,
          aspectRatio: 3
        }
      }, {
        canvas: {
          style: 'width: 400px; height: 410px'
        }
      });

      expect(chart).toBeChartOfSize({
        dw: 400, dh: 410,
        rw: 400, rh: 410,
      });
    });
  });

  describe('config.options.responsive: false', function() {
    it('should use default canvas size for render and display sizes', function() {
      var chart = acquireChart({
        options: {
          responsive: false
        }
      }, {
        canvas: {
          style: ''
        }
      });

      expect(chart).toBeChartOfSize({
        dw: 300, dh: 150,
        rw: 300, rh: 150,
      });
    });

    it('should use canvas attributes for render and display sizes', function() {
      var chart = acquireChart({
        options: {
          responsive: false
        }
      }, {
        canvas: {
          style: '',
          width: 305,
          height: 245,
        }
      });

      expect(chart).toBeChartOfSize({
        dw: 305, dh: 245,
        rw: 305, rh: 245,
      });
    });

    it('should use canvas style for render and display sizes (if no attributes)', function() {
      var chart = acquireChart({
        options: {
          responsive: false
        }
      }, {
        canvas: {
          style: 'width: 345px; height: 125px'
        }
      });

      expect(chart).toBeChartOfSize({
        dw: 345, dh: 125,
        rw: 345, rh: 125,
      });
    });

    it('should use attributes for the render size and style for the display size', function() {
      var chart = acquireChart({
        options: {
          responsive: false
        }
      }, {
        canvas: {
          style: 'width: 345px; height: 125px;',
          width: 165,
          height: 85,
        }
      });

      expect(chart).toBeChartOfSize({
        dw: 345, dh: 125,
        rw: 165, rh: 85,
      });
    });

    // https://github.com/chartjs/Chart.js/issues/3860
    it('should support decimal display width and/or height', function() {
      var chart = acquireChart({
        options: {
          responsive: false
        }
      }, {
        canvas: {
          style: 'width: 345.42px; height: 125.42px;'
        }
      });

      expect(chart).toBeChartOfSize({
        dw: 345, dh: 125,
        rw: 345, rh: 125,
      });
    });
  });

  describe('config.options.responsive: true (maintainAspectRatio: true)', function() {
    it('should fill parent width and use aspect ratio to calculate height', function() {
      var chart = acquireChart({
        options: {
          responsive: true,
          maintainAspectRatio: true
        }
      }, {
        canvas: {
          style: 'width: 150px; height: 245px'
        },
        wrapper: {
          style: 'width: 300px; height: 350px'
        }
      });

      expect(chart).toBeChartOfSize({
        dw: 300, dh: 490,
        rw: 300, rh: 490,
      });
    });
  });

  describe('controller.destroy', function() {
    it('should reset context to default values', function() {
      var wrapper = document.createElement('div');
      var canvas = document.createElement('canvas');
      wrapper.appendChild(canvas);
      window.document.body.appendChild(wrapper);
      var chart = new Chart(canvas, {});
      var context = chart.ctx;

      chart.destroy();

      // https://www.w3.org/TR/2dcontext/#conformance-requirements
      Chart.helpers.each({
        fillStyle: '#000000',
        font: '10px sans-serif',
        lineJoin: 'miter',
        lineCap: 'butt',
        lineWidth: 1,
        miterLimit: 10,
        shadowBlur: 0,
        shadowColor: 'rgba(0, 0, 0, 0)',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        strokeStyle: '#000000',
        textAlign: 'start',
        textBaseline: 'alphabetic'
      }, function(value, key) {
        expect(context[key]).toBe(value);
      });

      wrapper.parentNode.removeChild(wrapper);
    });

    it('should restore canvas initial values', function(done) {
      var wrapper = document.createElement('div');
      var canvas = document.createElement('canvas');

      canvas.setAttribute('width', 180);
      canvas.setAttribute('style', 'width: 512px; height: 480px');
      wrapper.setAttribute('style', 'width: 450px; height: 450px; position: relative');

      wrapper.appendChild(canvas);
      window.document.body.appendChild(wrapper);

      var chart = new Chart(canvas.getContext('2d'), {
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      waitForResize(chart, function() {
        expect(chart).toBeChartOfSize({
          dw: 475, dh: 450,
          rw: 475, rh: 450,
        });

        chart.destroy();

        expect(canvas.getAttribute('width')).toBe('180');
        expect(canvas.getAttribute('height')).toBe(null);
        expect(canvas.style.width).toBe('512px');
        expect(canvas.style.height).toBe('480px');
        expect(canvas.style.display).toBe('');

        wrapper.parentNode.removeChild(wrapper);
        done();
      });
      wrapper.style.width = '475px';
    });
  });

  describe('event handling', function() {
    it('should notify plugins about events', async function() {
      var notifiedEvent;
      var plugin = {
        afterEvent: function(chart, args) {
          notifiedEvent = args.event;
        }
      };
      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }]
        },
        options: {
          responsive: true
        },
        plugins: [plugin]
      });

      await jasmine.triggerMouseEvent(chart, 'click', {
        x: chart.width / 2,
        y: chart.height / 2
      });
      // Check that notifiedEvent is correct
      expect(notifiedEvent).not.toBe(undefined);

      // Is type correctly translated
      expect(notifiedEvent.type).toBe('click');

      // Relative Position
      expect(notifiedEvent.x).toBeCloseToPixel(chart.width / 2);
      expect(notifiedEvent.y).toBeCloseToPixel(chart.height / 2);
    });
  });

  describe('isAttached', function() {
    it('should detect detached when canvas is attached to DOM', function() {
      var platform = new DomPlatform();
      var canvas = document.createElement('canvas');
      var div = document.createElement('div');
      var anotherDiv = document.createElement('div');

      expect(platform.isAttached(canvas)).toEqual(false);
      div.appendChild(canvas);
      expect(platform.isAttached(canvas)).toEqual(false);
      anotherDiv.appendChild(div);
      expect(platform.isAttached(canvas)).toEqual(false);
      document.body.appendChild(anotherDiv);

      expect(platform.isAttached(canvas)).toEqual(true);

      anotherDiv.removeChild(div);
      expect(platform.isAttached(canvas)).toEqual(false);
      div.removeChild(canvas);
      expect(platform.isAttached(canvas)).toEqual(false);
      document.body.removeChild(anotherDiv);
      expect(platform.isAttached(canvas)).toEqual(false);
    });
  });
});
