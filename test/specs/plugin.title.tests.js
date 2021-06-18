// Test the rectangle element

var Title = Chart.registry.getPlugin('title')._element;

describe('Plugin.title', function() {
  describe('auto', jasmine.fixture.specs('plugin.title'));

  it('Should have the correct default config', function() {
    expect(Chart.defaults.plugins.title).toEqual({
      align: 'center',
      color: Chart.defaults.color,
      display: false,
      position: 'top',
      fullSize: true,
      weight: 2000,
      font: {
        weight: 'bold'
      },
      padding: 10,
      text: ''
    });
  });

  it('should update correctly', function() {
    var chart = {
      options: Chart.helpers.clone(Chart.defaults)
    };

    var options = Chart.helpers.clone(Chart.defaults.plugins.title);
    options.text = 'My title';

    var title = new Title({
      chart: chart,
      options: options
    });

    title.update(400, 200);

    expect(title.width).toEqual(0);
    expect(title.height).toEqual(0);

    // Now we have a height since we display
    title.options.display = true;

    title.update(400, 200);

    expect(title.width).toEqual(400);
    expect(title.height).toEqual(34.4);
  });

  it('should update correctly when vertical', function() {
    var chart = {
      options: Chart.helpers.clone(Chart.defaults)
    };

    var options = Chart.helpers.clone(Chart.defaults.plugins.title);
    options.text = 'My title';
    options.position = 'left';

    var title = new Title({
      chart: chart,
      options: options
    });

    title.update(200, 400);

    expect(title.width).toEqual(0);
    expect(title.height).toEqual(0);

    // Now we have a height since we display
    title.options.display = true;

    title.update(200, 400);

    expect(title.width).toEqual(34.4);
    expect(title.height).toEqual(400);
  });

  it('should have the correct size when there are multiple lines of text', function() {
    var chart = {
      options: Chart.helpers.clone(Chart.defaults)
    };

    var options = Chart.helpers.clone(Chart.defaults.plugins.title);
    options.text = ['line1', 'line2'];
    options.position = 'left';
    options.display = true;
    options.font.lineHeight = 1.5;

    var title = new Title({
      chart: chart,
      options: options
    });

    title.update(200, 400);

    expect(title.width).toEqual(56);
    expect(title.height).toEqual(400);
  });

  it('should draw correctly horizontally', function() {
    var chart = {
      options: Chart.helpers.clone(Chart.defaults)
    };
    var context = window.createMockContext();

    var options = Chart.helpers.clone(Chart.defaults.plugins.title);
    options.text = 'My title';

    var title = new Title({
      chart: chart,
      options: options,
      ctx: context
    });

    title.update(400, 200);
    title.draw();

    expect(context.getCalls()).toEqual([]);

    // Now we have a height since we display
    title.options.display = true;

    title.update(400, 200);
    title.top = 50;
    title.left = 100;
    title.bottom = title.top + title.height;
    title.right = title.left + title.width;
    title.draw();

    expect(context.getCalls()).toEqual([{
      name: 'save',
      args: []
    }, {
      name: 'setFont',
      args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"],
    }, {
      name: 'translate',
      args: [300, 67.2]
    }, {
      name: 'rotate',
      args: [0]
    }, {
      name: 'setFillStyle',
      args: ['#666']
    }, {
      name: 'setTextAlign',
      args: ['center'],
    }, {
      name: 'setTextBaseline',
      args: ['middle'],
    }, {
      name: 'fillText',
      args: ['My title', 0, 0, 400]
    }, {
      name: 'restore',
      args: []
    }]);
  });

  it ('should draw correctly vertically', function() {
    var chart = {
      options: Chart.helpers.clone(Chart.defaults)
    };
    var context = window.createMockContext();

    var options = Chart.helpers.clone(Chart.defaults.plugins.title);
    options.text = 'My title';
    options.position = 'left';

    var title = new Title({
      chart: chart,
      options: options,
      ctx: context
    });

    title.update(200, 400);
    title.draw();

    expect(context.getCalls()).toEqual([]);

    // Now we have a height since we display
    title.options.display = true;

    title.update(200, 400);
    title.top = 50;
    title.left = 100;
    title.bottom = title.top + title.height;
    title.right = title.left + title.width;
    title.draw();

    expect(context.getCalls()).toEqual([{
      name: 'save',
      args: []
    }, {
      name: 'setFont',
      args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"],
    }, {
      name: 'translate',
      args: [117.2, 250]
    }, {
      name: 'rotate',
      args: [-0.5 * Math.PI]
    }, {
      name: 'setFillStyle',
      args: ['#666']
    }, {
      name: 'setTextAlign',
      args: ['center'],
    }, {
      name: 'setTextBaseline',
      args: ['middle'],
    }, {
      name: 'fillText',
      args: ['My title', 0, 0, 400]
    }, {
      name: 'restore',
      args: []
    }]);

    // Rotation is other way on right side
    title.options.position = 'right';

    // Reset call tracker
    context.resetCalls();

    title.update(200, 400);
    title.top = 50;
    title.left = 100;
    title.bottom = title.top + title.height;
    title.right = title.left + title.width;
    title.draw();

    expect(context.getCalls()).toEqual([{
      name: 'save',
      args: []
    }, {
      name: 'setFont',
      args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"],
    }, {
      name: 'translate',
      args: [117.2, 250]
    }, {
      name: 'rotate',
      args: [0.5 * Math.PI]
    }, {
      name: 'setFillStyle',
      args: ['#666']
    }, {
      name: 'setTextAlign',
      args: ['center'],
    }, {
      name: 'setTextBaseline',
      args: ['middle'],
    }, {
      name: 'fillText',
      args: ['My title', 0, 0, 400]
    }, {
      name: 'restore',
      args: []
    }]);
  });

  describe('config update', function() {
    it ('should update the options', function() {
      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }]
        },
        options: {
          plugins: {
            title: {
              display: true
            }
          }
        }
      });
      expect(chart.titleBlock.options.display).toBe(true);

      chart.options.plugins.title.display = false;
      chart.update();
      expect(chart.titleBlock.options.display).toBe(false);
    });

    it ('should update the associated layout item', function() {
      var chart = acquireChart({
        type: 'line',
        data: {},
        options: {
          plugins: {
            title: {
              fullSize: true,
              position: 'top',
              weight: 150
            }
          }
        }
      });

      expect(chart.titleBlock.fullSize).toBe(true);
      expect(chart.titleBlock.position).toBe('top');
      expect(chart.titleBlock.weight).toBe(150);

      chart.options.plugins.title.fullSize = false;
      chart.options.plugins.title.position = 'left';
      chart.options.plugins.title.weight = 42;
      chart.update();

      expect(chart.titleBlock.fullSize).toBe(false);
      expect(chart.titleBlock.position).toBe('left');
      expect(chart.titleBlock.weight).toBe(42);
    });

    it ('should remove the title if the new options are false', function() {
      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }]
        }
      });
      expect(chart.titleBlock).not.toBe(undefined);

      chart.options.plugins.title = false;
      chart.update();
      expect(chart.titleBlock).toBe(undefined);
    });

    it ('should create the title if the title options are changed to exist', function() {
      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }]
        },
        options: {
          plugins: {
            title: false
          }
        }
      });
      expect(chart.titleBlock).toBe(undefined);

      chart.options.plugins.title = {};
      chart.update();
      expect(chart.titleBlock).not.toBe(undefined);
      expect(chart.titleBlock.options).toEqualOptions(Chart.defaults.plugins.title);
    });
  });
});
