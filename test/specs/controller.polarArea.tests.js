describe('Chart.controllers.polarArea', function() {
  describe('auto', jasmine.fixture.specs('controller.polarArea'));

  it('should update the scale correctly when data visibility is changed', function() {
    var expectedScaleMax = 1;
    var chart = window.acquireChart({
      type: 'polarArea',
      data: {
        datasets: [
          {data: [100]}
        ],
        labels: ['x']
      }
    });

    chart.toggleDataVisibility(0);
    chart.update();

    expect(chart.scales.r.max).toBe(expectedScaleMax);
  });

  it('should be registered as dataset controller', function() {
    expect(typeof Chart.controllers.polarArea).toBe('function');
  });

  it('should be constructed', function() {
    var chart = window.acquireChart({
      type: 'polarArea',
      data: {
        datasets: [
          {data: []},
          {data: []}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.type).toEqual('polarArea');
    expect(meta.data).toEqual([]);
    expect(meta.hidden).toBe(null);
    expect(meta.controller).not.toBe(undefined);
    expect(meta.controller.index).toBe(1);

    meta.controller.updateIndex(0);
    expect(meta.controller.index).toBe(0);
  });

  it('should create arc elements for each data item during initialization', function() {
    var chart = window.acquireChart({
      type: 'polarArea',
      data: {
        datasets: [
          {data: []},
          {data: [10, 15, 0, -4]}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.data.length).toBe(4); // 4 arcs created
    expect(meta.data[0] instanceof Chart.elements.ArcElement).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.ArcElement).toBe(true);
    expect(meta.data[2] instanceof Chart.elements.ArcElement).toBe(true);
    expect(meta.data[3] instanceof Chart.elements.ArcElement).toBe(true);
  });

  it('should draw all elements', function() {
    var chart = window.acquireChart({
      type: 'polarArea',
      data: {
        datasets: [{
          data: [10, 15, 0, -4],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);

    spyOn(meta.data[0], 'draw');
    spyOn(meta.data[1], 'draw');
    spyOn(meta.data[2], 'draw');
    spyOn(meta.data[3], 'draw');

    chart.update();

    expect(meta.data[0].draw.calls.count()).toBe(1);
    expect(meta.data[1].draw.calls.count()).toBe(1);
    expect(meta.data[2].draw.calls.count()).toBe(1);
    expect(meta.data[3].draw.calls.count()).toBe(1);
  });

  it('should update elements when modifying data', function() {
    var chart = window.acquireChart({
      type: 'polarArea',
      data: {
        datasets: [{
          data: [10, 15, 0, -4],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        showLine: true,
        plugins: {
          legend: false,
          title: false
        },
        elements: {
          arc: {
            backgroundColor: 'rgb(255, 0, 0)',
            borderColor: 'rgb(0, 255, 0)',
            borderWidth: 1.2
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.data.length).toBe(4);

    [
      {o: 174, s: -0.5 * Math.PI, e: 0},
      {o: 236, s: 0, e: 0.5 * Math.PI},
      {o: 51, s: 0.5 * Math.PI, e: Math.PI},
      {o: 0, s: Math.PI, e: 1.5 * Math.PI}
    ].forEach(function(expected, i) {
      expect(meta.data[i].x).withContext(i).toBeCloseToPixel(256);
      expect(meta.data[i].y).withContext(i).toBeCloseToPixel(256);
      expect(meta.data[i].innerRadius).withContext(i).toBeCloseToPixel(0);
      expect(meta.data[i].outerRadius).withContext(i).toBeCloseToPixel(expected.o);
      expect(meta.data[i].startAngle).withContext(i).toBe(expected.s);
      expect(meta.data[i].endAngle).withContext(i).toBe(expected.e);
      expect(meta.data[i].options).withContext(i).toEqual(jasmine.objectContaining({
        backgroundColor: 'rgb(255, 0, 0)',
        borderColor: 'rgb(0, 255, 0)',
        borderWidth: 1.2
      }));
    });

    // arc styles
    chart.data.datasets[0].backgroundColor = 'rgb(128, 129, 130)';
    chart.data.datasets[0].borderColor = 'rgb(56, 57, 58)';
    chart.data.datasets[0].borderWidth = 1.123;

    chart.update();

    for (var i = 0; i < 4; ++i) {
      expect(meta.data[i].options.backgroundColor).toBe('rgb(128, 129, 130)');
      expect(meta.data[i].options.borderColor).toBe('rgb(56, 57, 58)');
      expect(meta.data[i].options.borderWidth).toBe(1.123);
    }

    chart.update();

    expect(meta.data[0].x).toBeCloseToPixel(256);
    expect(meta.data[0].y).toBeCloseToPixel(256);
    expect(meta.data[0].innerRadius).toBeCloseToPixel(0);
    expect(meta.data[0].outerRadius).toBeCloseToPixel(174);
  });

  it('should update elements with start angle from options', function() {
    var chart = window.acquireChart({
      type: 'polarArea',
      data: {
        datasets: [{
          data: [10, 15, 0, -4],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        showLine: true,
        plugins: {
          legend: false,
          title: false,
        },
        scales: {
          r: {
            startAngle: 90, // default is 0
          }
        },
        elements: {
          arc: {
            backgroundColor: 'rgb(255, 0, 0)',
            borderColor: 'rgb(0, 255, 0)',
            borderWidth: 1.2
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.data.length).toBe(4);

    [
      {o: 174, s: 0, e: 0.5 * Math.PI},
      {o: 236, s: 0.5 * Math.PI, e: Math.PI},
      {o: 51, s: Math.PI, e: 1.5 * Math.PI},
      {o: 0, s: 1.5 * Math.PI, e: 2.0 * Math.PI}
    ].forEach(function(expected, i) {
      expect(meta.data[i].x).withContext(i).toBeCloseToPixel(256);
      expect(meta.data[i].y).withContext(i).toBeCloseToPixel(256);
      expect(meta.data[i].innerRadius).withContext(i).toBeCloseToPixel(0);
      expect(meta.data[i].outerRadius).withContext(i).toBeCloseToPixel(expected.o);
      expect(meta.data[i].startAngle).withContext(i).toBe(expected.s);
      expect(meta.data[i].endAngle).withContext(i).toBe(expected.e);
      expect(meta.data[i].options).withContext(i).toEqual(jasmine.objectContaining({
        backgroundColor: 'rgb(255, 0, 0)',
        borderColor: 'rgb(0, 255, 0)',
        borderWidth: 1.2
      }));
    });
  });

  it('should handle number of data point changes in update', function() {
    var chart = window.acquireChart({
      type: 'polarArea',
      data: {
        datasets: [{
          data: [10, 15, 0, -4],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        showLine: true,
        elements: {
          arc: {
            backgroundColor: 'rgb(255, 0, 0)',
            borderColor: 'rgb(0, 255, 0)',
            borderWidth: 1.2
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.data.length).toBe(4);

    // remove 2 items
    chart.data.labels = ['label1', 'label2'];
    chart.data.datasets[0].data = [1, 2];
    chart.update();

    expect(meta.data.length).toBe(2);
    expect(meta.data[0] instanceof Chart.elements.ArcElement).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.ArcElement).toBe(true);

    // add 3 items
    chart.data.labels = ['label1', 'label2', 'label3', 'label4', 'label5'];
    chart.data.datasets[0].data = [1, 2, 3, 4, 5];
    chart.update();

    expect(meta.data.length).toBe(5);
    expect(meta.data[0] instanceof Chart.elements.ArcElement).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.ArcElement).toBe(true);
    expect(meta.data[2] instanceof Chart.elements.ArcElement).toBe(true);
    expect(meta.data[3] instanceof Chart.elements.ArcElement).toBe(true);
    expect(meta.data[4] instanceof Chart.elements.ArcElement).toBe(true);
  });

  describe('Interactions', function() {
    beforeEach(function() {
      this.chart = window.acquireChart({
        type: 'polarArea',
        data: {
          labels: ['label1', 'label2', 'label3', 'label4'],
          datasets: [{
            data: [10, 15, 0, 4]
          }]
        },
        options: {
          cutoutPercentage: 0,
          elements: {
            arc: {
              backgroundColor: 'rgb(100, 150, 200)',
              borderColor: 'rgb(50, 100, 150)',
              borderWidth: 2,
            }
          }
        }
      });
    });

    it('should handle default hover styles', async function() {
      var chart = this.chart;
      var arc = chart.getDatasetMeta(0).data[0];

      await jasmine.triggerMouseEvent(chart, 'mousemove', arc);
      expect(arc.options.backgroundColor).toBe('#3187DD');
      expect(arc.options.borderColor).toBe('#175A9D');
      expect(arc.options.borderWidth).toBe(2);

      await jasmine.triggerMouseEvent(chart, 'mouseout', arc);
      expect(arc.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(arc.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(arc.options.borderWidth).toBe(2);
    });

    it('should handle hover styles defined via dataset properties', async function() {
      var chart = this.chart;
      var arc = chart.getDatasetMeta(0).data[0];

      Chart.helpers.merge(chart.data.datasets[0], {
        hoverBackgroundColor: 'rgb(200, 100, 150)',
        hoverBorderColor: 'rgb(150, 50, 100)',
        hoverBorderWidth: 8.4,
      });

      chart.update();

      await jasmine.triggerMouseEvent(chart, 'mousemove', arc);
      expect(arc.options.backgroundColor).toBe('rgb(200, 100, 150)');
      expect(arc.options.borderColor).toBe('rgb(150, 50, 100)');
      expect(arc.options.borderWidth).toBe(8.4);

      await jasmine.triggerMouseEvent(chart, 'mouseout', arc);
      expect(arc.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(arc.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(arc.options.borderWidth).toBe(2);
    });

    it('should handle hover styles defined via element options', async function() {
      var chart = this.chart;
      var arc = chart.getDatasetMeta(0).data[0];

      Chart.helpers.merge(chart.options.elements.arc, {
        hoverBackgroundColor: 'rgb(200, 100, 150)',
        hoverBorderColor: 'rgb(150, 50, 100)',
        hoverBorderWidth: 8.4,
      });

      chart.update();

      await jasmine.triggerMouseEvent(chart, 'mousemove', arc);
      expect(arc.options.backgroundColor).toBe('rgb(200, 100, 150)');
      expect(arc.options.borderColor).toBe('rgb(150, 50, 100)');
      expect(arc.options.borderWidth).toBe(8.4);

      await jasmine.triggerMouseEvent(chart, 'mouseout', arc);
      expect(arc.options.backgroundColor).toBe('rgb(100, 150, 200)');
      expect(arc.options.borderColor).toBe('rgb(50, 100, 150)');
      expect(arc.options.borderWidth).toBe(2);
    });
  });

  it('should not override tooltip title and label callbacks', async() => {
    const chart = window.acquireChart({
      type: 'polarArea',
      data: {
        labels: ['Label 1', 'Label 2'],
        datasets: [{
          data: [21, 79],
          label: 'Dataset 1'
        }, {
          data: [33, 67],
          label: 'Dataset 2'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
      }
    });
    const {tooltip} = chart;
    const point = chart.getDatasetMeta(0).data[0];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);

    expect(tooltip.title).toEqual(['Label 1']);
    expect(tooltip.body).toEqual([{
      before: [],
      lines: ['Dataset 1: 21'],
      after: []
    }]);

    chart.options.plugins.tooltip = {mode: 'dataset'};
    chart.update();
    await jasmine.triggerMouseEvent(chart, 'mousemove', point);

    expect(tooltip.title).toEqual(['Dataset 1']);
    expect(tooltip.body).toEqual([{
      before: [],
      lines: ['Label 1: 21'],
      after: []
    }, {
      before: [],
      lines: ['Label 2: 79'],
      after: []
    }]);
  });
});
