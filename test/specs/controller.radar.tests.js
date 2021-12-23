describe('Chart.controllers.radar', function() {
  describe('auto', jasmine.fixture.specs('controller.radar'));

  it('should be registered as dataset controller', function() {
    expect(typeof Chart.controllers.radar).toBe('function');
  });

  it('Should be constructed', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: []
        }],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.type).toBe('radar');
    expect(meta.controller).not.toBe(undefined);
    expect(meta.controller.index).toBe(0);
    expect(meta.data).toEqual([]);

    meta.controller.updateIndex(1);
    expect(meta.controller.index).toBe(1);
  });

  it('Should create arc elements for each data item during initialization', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 15, 0, 4]
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.dataset instanceof Chart.elements.LineElement).toBe(true); // line element
    expect(meta.data.length).toBe(4); // 4 points created
    expect(meta.data[0] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[2] instanceof Chart.elements.PointElement).toBe(true);
    expect(meta.data[3] instanceof Chart.elements.PointElement).toBe(true);
  });

  it('should draw all elements', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 15, 0, 4]
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);

    spyOn(meta.dataset, 'draw');
    spyOn(meta.data[0], 'draw');
    spyOn(meta.data[1], 'draw');
    spyOn(meta.data[2], 'draw');
    spyOn(meta.data[3], 'draw');

    chart.update();

    expect(meta.dataset.draw.calls.count()).toBe(1);
    expect(meta.data[0].draw.calls.count()).toBe(1);
    expect(meta.data[1].draw.calls.count()).toBe(1);
    expect(meta.data[2].draw.calls.count()).toBe(1);
    expect(meta.data[3].draw.calls.count()).toBe(1);
  });

  it('should update elements', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 15, 0, 4]
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        showLine: true,
        plugins: {
          legend: false,
          title: false,
        },
        elements: {
          line: {
            backgroundColor: 'rgb(255, 0, 0)',
            borderCapStyle: 'round',
            borderColor: 'rgb(0, 255, 0)',
            borderDash: [],
            borderDashOffset: 0.1,
            borderJoinStyle: 'bevel',
            borderWidth: 1.2,
            fill: true,
            tension: 0.1,
          },
          point: {
            backgroundColor: Chart.defaults.backgroundColor,
            borderWidth: 1,
            borderColor: Chart.defaults.borderColor,
            hitRadius: 1,
            hoverRadius: 4,
            hoverBorderWidth: 1,
            radius: 3,
            pointStyle: 'circle'
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(0);

    chart.reset(); // reset first

    // Line element
    expect(meta.dataset.options).toEqual(jasmine.objectContaining({
      backgroundColor: 'rgb(255, 0, 0)',
      borderCapStyle: 'round',
      borderColor: 'rgb(0, 255, 0)',
      borderDash: [],
      borderDashOffset: 0.1,
      borderJoinStyle: 'bevel',
      borderWidth: 1.2,
      fill: true,
      tension: 0.1,
    }));

    [
      {x: 256, y: 256},
      {x: 256, y: 256},
      {x: 256, y: 256},
      {x: 256, y: 256},
    ].forEach(function(expected, i) {
      expect(meta.data[i].x).withContext(i).toBeCloseToPixel(expected.x);
      expect(meta.data[i].y).withContext(i).toBeCloseToPixel(expected.y);
      expect(meta.data[i].options).withContext(i).toEqual(jasmine.objectContaining({
        backgroundColor: Chart.defaults.backgroundColor,
        borderWidth: 1,
        borderColor: Chart.defaults.borderColor,
        hitRadius: 1,
        radius: 3,
        pointStyle: 'circle',
      }));
    });

    chart.update();

    [
      {x: 256, y: 122, cppx: 246, cppy: 122, cpnx: 272, cpny: 122},
      {x: 457, y: 256, cppx: 457, cppy: 249, cpnx: 457, cpny: 262},
      {x: 256, y: 256, cppx: 277, cppy: 256, cpnx: 250, cpny: 256},
      {x: 202, y: 256, cppx: 202, cppy: 260, cpnx: 202, cpny: 246},
    ].forEach(function(expected, i) {
      expect(meta.data[i].x).withContext(i).toBeCloseToPixel(expected.x);
      expect(meta.data[i].y).withContext(i).toBeCloseToPixel(expected.y);
      expect(meta.data[i].cp1x).withContext(i).toBeCloseToPixel(expected.cppx);
      expect(meta.data[i].cp1y).withContext(i).toBeCloseToPixel(expected.cppy);
      expect(meta.data[i].cp2x).withContext(i).toBeCloseToPixel(expected.cpnx);
      expect(meta.data[i].cp2y).withContext(i).toBeCloseToPixel(expected.cpny);
      expect(meta.data[i].options).withContext(i).toEqual(jasmine.objectContaining({
        backgroundColor: Chart.defaults.backgroundColor,
        borderWidth: 1,
        borderColor: Chart.defaults.borderColor,
        hitRadius: 1,
        radius: 3,
        pointStyle: 'circle',
      }));
    });

    // Use dataset level styles for lines & points
    chart.data.datasets[0].tension = 0;
    chart.data.datasets[0].backgroundColor = 'rgb(98, 98, 98)';
    chart.data.datasets[0].borderColor = 'rgb(8, 8, 8)';
    chart.data.datasets[0].borderWidth = 0.55;
    chart.data.datasets[0].borderCapStyle = 'butt';
    chart.data.datasets[0].borderDash = [2, 3];
    chart.data.datasets[0].borderDashOffset = 7;
    chart.data.datasets[0].borderJoinStyle = 'miter';
    chart.data.datasets[0].fill = false;

    // point styles
    chart.data.datasets[0].pointRadius = 22;
    chart.data.datasets[0].hitRadius = 3.3;
    chart.data.datasets[0].pointBackgroundColor = 'rgb(128, 129, 130)';
    chart.data.datasets[0].pointBorderColor = 'rgb(56, 57, 58)';
    chart.data.datasets[0].pointBorderWidth = 1.123;

    chart.update();

    expect(meta.dataset.options).toEqual(jasmine.objectContaining({
      backgroundColor: 'rgb(98, 98, 98)',
      borderCapStyle: 'butt',
      borderColor: 'rgb(8, 8, 8)',
      borderDash: [2, 3],
      borderDashOffset: 7,
      borderJoinStyle: 'miter',
      borderWidth: 0.55,
      fill: false,
      tension: 0,
    }));

    // Since tension is now 0, we don't care about the control points
    [
      {x: 256, y: 122},
      {x: 457, y: 256},
      {x: 256, y: 256},
      {x: 202, y: 256},
    ].forEach(function(expected, i) {
      expect(meta.data[i].x).withContext(i).toBeCloseToPixel(expected.x);
      expect(meta.data[i].y).withContext(i).toBeCloseToPixel(expected.y);
      expect(meta.data[i].options).withContext(i).toEqual(jasmine.objectContaining({
        backgroundColor: 'rgb(128, 129, 130)',
        borderWidth: 1.123,
        borderColor: 'rgb(56, 57, 58)',
        hitRadius: 3.3,
        radius: 22,
        pointStyle: 'circle'
      }));
    });
  });

  describe('Interactions', function() {
    beforeEach(function() {
      this.chart = window.acquireChart({
        type: 'radar',
        data: {
          labels: ['label1', 'label2', 'label3', 'label4'],
          datasets: [{
            data: [10, 15, 0, 4]
          }]
        },
        options: {
          elements: {
            point: {
              backgroundColor: 'rgb(100, 150, 200)',
              borderColor: 'rgb(50, 100, 150)',
              borderWidth: 2,
              radius: 3
            }
          }
        }
      });
    });

    it('should handle default hover styles', async function() {
      var chart = this.chart;
      var point = chart.getDatasetMeta(0).data[0];

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);
      expect(point.options.backgroundColor).toBe('#3187DD');
      expect(point.options.borderColor).toBe('#175A9D');
      expect(point.options.borderWidth).toBe(1);
      expect(point.options.radius).toBe(4);

      await jasmine.triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(3);
    });

    it('should handle hover styles defined via dataset properties', async function() {
      var chart = this.chart;
      var point = chart.getDatasetMeta(0).data[0];

      Chart.helpers.merge(chart.data.datasets[0], {
        hoverBackgroundColor: 'rgb(200, 100, 150)',
        hoverBorderColor: 'rgb(150, 50, 100)',
        hoverBorderWidth: 8.4,
        hoverRadius: 4.2
      });

      chart.update();

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);
      expect(point.options.backgroundColor).toBe('rgb(200, 100, 150)');
      expect(point.options.borderColor).toBe('rgb(150, 50, 100)');
      expect(point.options.borderWidth).toBe(8.4);
      expect(point.options.radius).toBe(4.2);

      await jasmine.triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(3);
    });

    it('should handle hover styles defined via element options', async function() {
      var chart = this.chart;
      var point = chart.getDatasetMeta(0).data[0];

      Chart.helpers.merge(chart.options.elements.point, {
        hoverBackgroundColor: 'rgb(200, 100, 150)',
        hoverBorderColor: 'rgb(150, 50, 100)',
        hoverBorderWidth: 8.4,
        hoverRadius: 4.2
      });

      chart.update();

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);
      expect(point.options.backgroundColor).toBe('rgb(200, 100, 150)');
      expect(point.options.borderColor).toBe('rgb(150, 50, 100)');
      expect(point.options.borderWidth).toBe(8.4);
      expect(point.options.radius).toBe(4.2);

      await jasmine.triggerMouseEvent(chart, 'mouseout', point);
      expect(point.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(point.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(point.options.borderWidth).toBe(2);
      expect(point.options.radius).toBe(3);
    });
  });

  it('should allow pointBorderWidth to be set to 0', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 15, 0, 4],
          pointBorderWidth: 0
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);
    var point = meta.data[0];
    expect(point.options.borderWidth).toBe(0);
  });

  it('should use the pointRadius setting over the radius setting', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 15, 0, 4],
          pointRadius: 10,
          radius: 15,
        }, {
          data: [20, 20, 20, 20],
          radius: 20
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta0 = chart.getDatasetMeta(0);
    var meta1 = chart.getDatasetMeta(1);
    expect(meta0.data[0].options.radius).toBe(10);
    expect(meta1.data[0].options.radius).toBe(20);
  });

  it('should return id for value scale', function() {
    var chart = window.acquireChart({
      type: 'radar',
      data: {
        datasets: [{
          data: [10, 15, 0, 4],
          pointBorderWidth: 0
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        scales: {
          test: {
            axis: 'r'
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.vScale.id).toBe('test');
  });
});
