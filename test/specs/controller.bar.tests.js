describe('Chart.controllers.bar', function() {
  describe('auto', jasmine.fixture.specs('controller.bar'));

  it('should be registered as dataset controller', function() {
    expect(typeof Chart.controllers.bar).toBe('function');
  });

  it('should be constructed', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: []},
          {data: []}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.type).toEqual('bar');
    expect(meta.data).toEqual([]);
    expect(meta.hidden).toBe(null);
    expect(meta.controller).not.toBe(undefined);
    expect(meta.controller.index).toBe(1);
    expect(meta.xAxisID).not.toBe(null);
    expect(meta.yAxisID).not.toBe(null);

    meta.controller.updateIndex(0);
    expect(meta.controller.index).toBe(0);
  });

  it('should set null bars to the reset state', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [10, null, 0, -4],
          label: 'dataset1',
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(0);
    var bar = meta.data[1];
    var {x, y, base} = bar.getProps(['x', 'y', 'base'], true);
    expect(isNaN(x)).toBe(false);
    expect(isNaN(y)).toBe(false);
    expect(isNaN(base)).toBe(false);
  });

  it('should use the first scale IDs if the dataset does not specify them', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: []},
          {data: []}
        ],
        labels: []
      },
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.xAxisID).toBe('x');
    expect(meta.yAxisID).toBe('y');
  });

  it('should correctly count the number of stacks ignoring datasets of other types and hidden datasets', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], type: 'line'},
          {data: [], hidden: true},
          {data: []},
          {data: []}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackCount()).toBe(2);
  });

  it('should correctly count the number of stacks when a group is not specified', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: []},
          {data: []},
          {data: []},
          {data: []}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackCount()).toBe(4);
  });

  it('should correctly count the number of stacks when a group is not specified and the scale is stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: []},
          {data: []},
          {data: []},
          {data: []}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackCount()).toBe(1);
  });

  it('should correctly count the number of stacks when a group is not specified and the scale is not stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: []},
          {data: []},
          {data: []},
          {data: []}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: false
          },
          y: {
            stacked: false
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackCount()).toBe(4);
  });

  it('should correctly count the number of stacks when a group is specified for some', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: []},
          {data: []}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(3);
    expect(meta.controller._getStackCount()).toBe(3);
  });

  it('should correctly count the number of stacks when a group is specified for some and the scale is stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: []},
          {data: []}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(3);
    expect(meta.controller._getStackCount()).toBe(2);
  });

  it('should correctly count the number of stacks when a group is specified for some and the scale is not stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: []},
          {data: []}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: false
          },
          y: {
            stacked: false
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(3);
    expect(meta.controller._getStackCount()).toBe(4);
  });

  it('should correctly count the number of stacks when a group is specified for all', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack2'},
          {data: [], stack: 'stack2'}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(3);
    expect(meta.controller._getStackCount()).toBe(2);
  });

  it('should correctly count the number of stacks when a group is specified for all and the scale is stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack2'},
          {data: [], stack: 'stack2'}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(3);
    expect(meta.controller._getStackCount()).toBe(2);
  });

  it('should correctly count the number of stacks when a group is specified for all and the scale is not stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack2'},
          {data: [], stack: 'stack2'}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: false
          },
          y: {
            stacked: false
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(3);
    expect(meta.controller._getStackCount()).toBe(4);
  });

  it('should correctly get the stack index accounting for datasets of other types and hidden datasets', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: []},
          {data: [], hidden: true},
          {data: [], type: 'line'},
          {data: []}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackIndex(0)).toBe(0);
    expect(meta.controller._getStackIndex(3)).toBe(1);
  });

  it('should correctly get the stack index when a group is not specified', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: []},
          {data: []},
          {data: []},
          {data: []}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackIndex(0)).toBe(0);
    expect(meta.controller._getStackIndex(1)).toBe(1);
    expect(meta.controller._getStackIndex(2)).toBe(2);
    expect(meta.controller._getStackIndex(3)).toBe(3);
  });

  it('should correctly get the stack index when a group is not specified and the scale is stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: []},
          {data: []},
          {data: []},
          {data: []}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackIndex(0)).toBe(0);
    expect(meta.controller._getStackIndex(1)).toBe(0);
    expect(meta.controller._getStackIndex(2)).toBe(0);
    expect(meta.controller._getStackIndex(3)).toBe(0);
  });

  it('should correctly get the stack index when a group is not specified and the scale is not stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: []},
          {data: []},
          {data: []},
          {data: []}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: false
          },
          y: {
            stacked: false
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackIndex(0)).toBe(0);
    expect(meta.controller._getStackIndex(1)).toBe(1);
    expect(meta.controller._getStackIndex(2)).toBe(2);
    expect(meta.controller._getStackIndex(3)).toBe(3);
  });

  it('should correctly get the stack index when a group is specified for some', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: []},
          {data: []}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackIndex(0)).toBe(0);
    expect(meta.controller._getStackIndex(1)).toBe(0);
    expect(meta.controller._getStackIndex(2)).toBe(1);
    expect(meta.controller._getStackIndex(3)).toBe(2);
  });

  it('should correctly get the stack index when a group is specified for some and the scale is stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: []},
          {data: []}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackIndex(0)).toBe(0);
    expect(meta.controller._getStackIndex(1)).toBe(0);
    expect(meta.controller._getStackIndex(2)).toBe(1);
    expect(meta.controller._getStackIndex(3)).toBe(1);
  });

  it('should correctly get the stack index when a group is specified for some and the scale is not stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: []},
          {data: []}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: false
          },
          y: {
            stacked: false
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackIndex(0)).toBe(0);
    expect(meta.controller._getStackIndex(1)).toBe(1);
    expect(meta.controller._getStackIndex(2)).toBe(2);
    expect(meta.controller._getStackIndex(3)).toBe(3);
  });

  it('should correctly get the stack index when a group is specified for all', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack2'},
          {data: [], stack: 'stack2'}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackIndex(0)).toBe(0);
    expect(meta.controller._getStackIndex(1)).toBe(0);
    expect(meta.controller._getStackIndex(2)).toBe(1);
    expect(meta.controller._getStackIndex(3)).toBe(1);
  });

  it('should correctly get the stack index when a group is specified for all and the scale is stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack2'},
          {data: [], stack: 'stack2'}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackIndex(0)).toBe(0);
    expect(meta.controller._getStackIndex(1)).toBe(0);
    expect(meta.controller._getStackIndex(2)).toBe(1);
    expect(meta.controller._getStackIndex(3)).toBe(1);
  });

  it('should correctly get the stack index when a group is specified for all and the scale is not stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack1'},
          {data: [], stack: 'stack2'},
          {data: [], stack: 'stack2'}
        ],
        labels: []
      },
      options: {
        scales: {
          x: {
            stacked: false
          },
          y: {
            stacked: false
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.controller._getStackIndex(0)).toBe(0);
    expect(meta.controller._getStackIndex(1)).toBe(1);
    expect(meta.controller._getStackIndex(2)).toBe(2);
    expect(meta.controller._getStackIndex(3)).toBe(3);
  });

  it('should create bar elements for each data item during initialization', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: []},
          {data: [10, 15, 0, -4]}
        ],
        labels: []
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.data.length).toBe(4); // 4 bars created
    expect(meta.data[0] instanceof Chart.elements.BarElement).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.BarElement).toBe(true);
    expect(meta.data[2] instanceof Chart.elements.BarElement).toBe(true);
    expect(meta.data[3] instanceof Chart.elements.BarElement).toBe(true);
  });

  it('should update elements when modifying data', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [1, 2],
          label: 'dataset1'
        }, {
          data: [10, 15, 0, -4],
          label: 'dataset2',
          borderColor: 'blue'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        elements: {
          bar: {
            backgroundColor: 'red',
            borderSkipped: 'top',
            borderColor: 'green',
            borderWidth: 2,
          }
        },
        scales: {
          x: {
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            display: false,
            beginAtZero: false
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    expect(meta.data.length).toBe(4);

    chart.data.datasets[1].data = [1, 2]; // remove 2 items
    chart.data.datasets[1].borderWidth = 1;
    chart.update();

    expect(meta.data.length).toBe(2);
    expect(meta._parsed.length).toBe(2);

    [
      {x: 89, y: 512},
      {x: 217, y: 0}
    ].forEach(function(expected, i) {
      expect(meta.data[i].x).toBeCloseToPixel(expected.x);
      expect(meta.data[i].y).toBeCloseToPixel(expected.y);
      expect(meta.data[i].base).toBeCloseToPixel(1024);
      expect(meta.data[i].width).toBeCloseToPixel(46);
      expect(meta.data[i].options).toEqual(jasmine.objectContaining({
        backgroundColor: 'red',
        borderSkipped: 'top',
        borderColor: 'blue',
        borderWidth: 1
      }));
    });

    chart.data.datasets[1].data = [1, 2, 3]; // add 1 items
    chart.update();

    expect(meta.data.length).toBe(3); // should add a new meta data item
  });

  it('should get the correct bar points when datasets of different types exist', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [1, 2],
          label: 'dataset1'
        }, {
          type: 'line',
          data: [4, 6],
          label: 'dataset2'
        }, {
          data: [8, 10],
          label: 'dataset3'
        }],
        labels: ['label1', 'label2']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            display: false,
            beginAtZero: false
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(2);
    expect(meta.data.length).toBe(2);

    var bar1 = meta.data[0];
    var bar2 = meta.data[1];

    expect(bar1.x).toBeCloseToPixel(179);
    expect(bar1.y).toBeCloseToPixel(117);
    expect(bar2.x).toBeCloseToPixel(431);
    expect(bar2.y).toBeCloseToPixel(4);
  });

  it('should get the bar points for hidden dataset', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [1, 2],
          label: 'dataset1',
          hidden: true
        }],
        labels: ['label1', 'label2']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            min: 0,
            max: 2,
            display: false
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.data.length).toBe(2);

    var bar1 = meta.data[0];
    var bar2 = meta.data[1];

    expect(bar1.x).toBeCloseToPixel(128);
    expect(bar1.y).toBeCloseToPixel(256);
    expect(bar2.x).toBeCloseToPixel(384);
    expect(bar2.y).toBeCloseToPixel(0);
  });


  it('should update elements when the scales are stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [10, -10, 10, -10],
          label: 'dataset1'
        }, {
          data: [10, 15, 0, -4],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            display: false,
            stacked: true
          }
        }
      }
    });

    var meta0 = chart.getDatasetMeta(0);

    [
      {b: 293, w: 92 / 2, x: 38, y: 146},
      {b: 293, w: 92 / 2, x: 166, y: 439},
      {b: 293, w: 92 / 2, x: 295, y: 146},
      {b: 293, w: 92 / 2, x: 422, y: 439}
    ].forEach(function(values, i) {
      expect(meta0.data[i].base).toBeCloseToPixel(values.b);
      expect(meta0.data[i].width).toBeCloseToPixel(values.w);
      expect(meta0.data[i].x).toBeCloseToPixel(values.x);
      expect(meta0.data[i].y).toBeCloseToPixel(values.y);
    });

    var meta1 = chart.getDatasetMeta(1);

    [
      {b: 146, w: 92 / 2, x: 89, y: 0},
      {b: 293, w: 92 / 2, x: 217, y: 73},
      {b: 146, w: 92 / 2, x: 345, y: 146},
      {b: 439, w: 92 / 2, x: 473, y: 497}
    ].forEach(function(values, i) {
      expect(meta1.data[i].base).toBeCloseToPixel(values.b);
      expect(meta1.data[i].width).toBeCloseToPixel(values.w);
      expect(meta1.data[i].x).toBeCloseToPixel(values.x);
      expect(meta1.data[i].y).toBeCloseToPixel(values.y);
    });
  });

  it('should update elements when the scales are stacked and the y axis has a user defined minimum', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [50, 20, 10, 100],
          label: 'dataset1'
        }, {
          data: [50, 80, 90, 0],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            display: false,
            stacked: true,
            min: 50,
            max: 100
          }
        }
      }
    });

    var meta0 = chart.getDatasetMeta(0);

    [
      {b: 1024, w: 92 / 2, x: 38, y: 512},
      {b: 1024, w: 92 / 2, x: 166, y: 819},
      {b: 1024, w: 92 / 2, x: 294, y: 922},
      {b: 1024, w: 92 / 2, x: 422.5, y: 0}
    ].forEach(function(values, i) {
      expect(meta0.data[i].base).toBeCloseToPixel(values.b);
      expect(meta0.data[i].width).toBeCloseToPixel(values.w);
      expect(meta0.data[i].x).toBeCloseToPixel(values.x);
      expect(meta0.data[i].y).toBeCloseToPixel(values.y);
    });

    var meta1 = chart.getDatasetMeta(1);

    [
      {b: 512, w: 92 / 2, x: 89, y: 0},
      {b: 819.2, w: 92 / 2, x: 217, y: 0},
      {b: 921.6, w: 92 / 2, x: 345, y: 0},
      {b: 0, w: 92 / 2, x: 473.5, y: 0}
    ].forEach(function(values, i) {
      expect(meta1.data[i].base).toBeCloseToPixel(values.b);
      expect(meta1.data[i].width).toBeCloseToPixel(values.w);
      expect(meta1.data[i].x).toBeCloseToPixel(values.x);
      expect(meta1.data[i].y).toBeCloseToPixel(values.y);
    });
  });

  it('should update elements when only the category scale is stacked', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [20, -10, 10, -10],
          label: 'dataset1'
        }, {
          data: [10, 15, 0, -14],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false,
            stacked: true
          },
          y: {
            type: 'linear',
            display: false
          }
        }
      }
    });

    var meta0 = chart.getDatasetMeta(0);

    [
      {b: 293, w: 92, x: 64, y: 0},
      {b: 293, w: 92, x: 192, y: 439},
      {b: 293, w: 92, x: 320, y: 146},
      {b: 293, w: 92, x: 448, y: 439}
    ].forEach(function(values, i) {
      expect(meta0.data[i].base).toBeCloseToPixel(values.b);
      expect(meta0.data[i].width).toBeCloseToPixel(values.w);
      expect(meta0.data[i].x).toBeCloseToPixel(values.x);
      expect(meta0.data[i].y).toBeCloseToPixel(values.y);
    });

    var meta1 = chart.getDatasetMeta(1);

    [
      {b: 293, w: 92, x: 64, y: 146},
      {b: 293, w: 92, x: 192, y: 73},
      {b: 293, w: 92, x: 320, y: 293},
      {b: 293, w: 92, x: 448, y: 497}
    ].forEach(function(values, i) {
      expect(meta1.data[i].base).toBeCloseToPixel(values.b);
      expect(meta1.data[i].width).toBeCloseToPixel(values.w);
      expect(meta1.data[i].x).toBeCloseToPixel(values.x);
      expect(meta1.data[i].y).toBeCloseToPixel(values.y);
    });
  });

  it('should update elements when the scales are stacked and data is strings', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: ['10', '-10', '10', '-10'],
          label: 'dataset1'
        }, {
          data: ['10', '15', '0', '-4'],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            display: false,
            stacked: true
          }
        }
      }
    });

    var meta0 = chart.getDatasetMeta(0);

    [
      {b: 293, w: 92 / 2, x: 38, y: 146},
      {b: 293, w: 92 / 2, x: 166, y: 439},
      {b: 293, w: 92 / 2, x: 295, y: 146},
      {b: 293, w: 92 / 2, x: 422, y: 439}
    ].forEach(function(values, i) {
      expect(meta0.data[i].base).toBeCloseToPixel(values.b);
      expect(meta0.data[i].width).toBeCloseToPixel(values.w);
      expect(meta0.data[i].x).toBeCloseToPixel(values.x);
      expect(meta0.data[i].y).toBeCloseToPixel(values.y);
    });

    var meta1 = chart.getDatasetMeta(1);

    [
      {b: 146, w: 92 / 2, x: 89, y: 0},
      {b: 293, w: 92 / 2, x: 217, y: 73},
      {b: 146, w: 92 / 2, x: 345, y: 146},
      {b: 439, w: 92 / 2, x: 473, y: 497}
    ].forEach(function(values, i) {
      expect(meta1.data[i].base).toBeCloseToPixel(values.b);
      expect(meta1.data[i].width).toBeCloseToPixel(values.w);
      expect(meta1.data[i].x).toBeCloseToPixel(values.x);
      expect(meta1.data[i].y).toBeCloseToPixel(values.y);
    });
  });

  it('should get the correct bar points for grouped stacked chart if the group name is same', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [10, -10, 10, -10],
          label: 'dataset1',
          stack: 'stack1'
        }, {
          data: [10, 15, 0, -4],
          label: 'dataset2',
          stack: 'stack1'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            display: false,
            stacked: true
          }
        }
      }
    });

    var meta0 = chart.getDatasetMeta(0);

    [
      {b: 293, w: 92, x: 64, y: 146},
      {b: 293, w: 92, x: 192, y: 439},
      {b: 293, w: 92, x: 320, y: 146},
      {b: 293, w: 92, x: 448, y: 439}
    ].forEach(function(values, i) {
      expect(meta0.data[i].base).toBeCloseToPixel(values.b);
      expect(meta0.data[i].width).toBeCloseToPixel(values.w);
      expect(meta0.data[i].x).toBeCloseToPixel(values.x);
      expect(meta0.data[i].y).toBeCloseToPixel(values.y);
    });

    var meta = chart.getDatasetMeta(1);

    [
      {b: 146, w: 92, x: 64, y: 0},
      {b: 293, w: 92, x: 192, y: 73},
      {b: 146, w: 92, x: 320, y: 146},
      {b: 439, w: 92, x: 448, y: 497}
    ].forEach(function(values, i) {
      expect(meta.data[i].base).toBeCloseToPixel(values.b);
      expect(meta.data[i].width).toBeCloseToPixel(values.w);
      expect(meta.data[i].x).toBeCloseToPixel(values.x);
      expect(meta.data[i].y).toBeCloseToPixel(values.y);
    });
  });

  it('should get the correct bar points for grouped stacked chart if the group name is different', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [1, 2],
          stack: 'stack1'
        }, {
          data: [1, 2],
          stack: 'stack2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            display: false,
            stacked: true,
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);

    [
      {x: 89, y: 256},
      {x: 217, y: 0}
    ].forEach(function(values, i) {
      expect(meta.data[i].base).toBeCloseToPixel(512);
      expect(meta.data[i].width).toBeCloseToPixel(46);
      expect(meta.data[i].x).toBeCloseToPixel(values.x);
      expect(meta.data[i].y).toBeCloseToPixel(values.y);
    });
  });

  it('should get the correct bar points for grouped stacked chart', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [1, 2],
          stack: 'stack1'
        }, {
          data: [0.5, 1],
          stack: 'stack2'
        }, {
          data: [0.5, 1],
          stack: 'stack2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            display: false,
            stacked: true
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(2);

    [
      {b: 384, x: 89, y: 256},
      {b: 256, x: 217, y: 0}
    ].forEach(function(values, i) {
      expect(meta.data[i].base).toBeCloseToPixel(values.b);
      expect(meta.data[i].width).toBeCloseToPixel(46);
      expect(meta.data[i].x).toBeCloseToPixel(values.x);
      expect(meta.data[i].y).toBeCloseToPixel(values.y);
    });
  });

  it('should draw all bars', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [],
        }, {
          data: [10, 15, 0, -4],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      }
    });

    var meta = chart.getDatasetMeta(1);

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

  it('should set hover styles on bars', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [],
        }, {
          data: [10, 15, 0, -4],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        elements: {
          bar: {
            backgroundColor: 'rgb(255, 0, 0)',
            borderColor: 'rgb(0, 0, 255)',
            borderWidth: 2,
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    var bar = meta.data[0];

    meta.controller.setHoverStyle(bar, 1, 0);
    expect(bar.options.backgroundColor).toBe('#E60000');
    expect(bar.options.borderColor).toBe('#0000E6');
    expect(bar.options.borderWidth).toBe(2);

    // Set a dataset style
    chart.data.datasets[1].hoverBackgroundColor = 'rgb(128, 128, 128)';
    chart.data.datasets[1].hoverBorderColor = 'rgb(0, 0, 0)';
    chart.data.datasets[1].hoverBorderWidth = 5;
    chart.update();

    meta.controller.setHoverStyle(bar, 1, 0);
    expect(bar.options.backgroundColor).toBe('rgb(128, 128, 128)');
    expect(bar.options.borderColor).toBe('rgb(0, 0, 0)');
    expect(bar.options.borderWidth).toBe(5);

    // Should work with array styles so that we can set per bar
    chart.data.datasets[1].hoverBackgroundColor = ['rgb(255, 255, 255)', 'rgb(128, 128, 128)'];
    chart.data.datasets[1].hoverBorderColor = ['rgb(9, 9, 9)', 'rgb(0, 0, 0)'];
    chart.data.datasets[1].hoverBorderWidth = [2.5, 5];
    chart.update();

    meta.controller.setHoverStyle(bar, 1, 0);
    expect(bar.options.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(bar.options.borderColor).toBe('rgb(9, 9, 9)');
    expect(bar.options.borderWidth).toBe(2.5);
  });

  it('should remove a hover style from a bar', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [],
        }, {
          data: [10, 15, 0, -4],
          label: 'dataset2'
        }],
        labels: ['label1', 'label2', 'label3', 'label4']
      },
      options: {
        elements: {
          bar: {
            backgroundColor: 'rgb(255, 0, 0)',
            borderColor: 'rgb(0, 0, 255)',
            borderWidth: 2,
          }
        }
      }
    });

    var meta = chart.getDatasetMeta(1);
    var bar = meta.data[0];
    var helpers = window.Chart.helpers;

    // Change default
    chart.options.elements.bar.backgroundColor = 'rgb(128, 128, 128)';
    chart.options.elements.bar.borderColor = 'rgb(15, 15, 15)';
    chart.options.elements.bar.borderWidth = 3.14;

    chart.update();
    expect(bar.options.backgroundColor).toBe('rgb(128, 128, 128)');
    expect(bar.options.borderColor).toBe('rgb(15, 15, 15)');
    expect(bar.options.borderWidth).toBe(3.14);
    meta.controller.setHoverStyle(bar, 1, 0);
    expect(bar.options.backgroundColor).toBe(helpers.getHoverColor('rgb(128, 128, 128)'));
    expect(bar.options.borderColor).toBe(helpers.getHoverColor('rgb(15, 15, 15)'));
    expect(bar.options.borderWidth).toBe(3.14);
    meta.controller.removeHoverStyle(bar);
    expect(bar.options.backgroundColor).toBe('rgb(128, 128, 128)');
    expect(bar.options.borderColor).toBe('rgb(15, 15, 15)');
    expect(bar.options.borderWidth).toBe(3.14);

    // Should work with array styles so that we can set per bar
    chart.data.datasets[1].backgroundColor = ['rgb(255, 255, 255)', 'rgb(128, 128, 128)'];
    chart.data.datasets[1].borderColor = ['rgb(9, 9, 9)', 'rgb(0, 0, 0)'];
    chart.data.datasets[1].borderWidth = [2.5, 5];

    chart.update();
    expect(bar.options.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(bar.options.borderColor).toBe('rgb(9, 9, 9)');
    expect(bar.options.borderWidth).toBe(2.5);
    meta.controller.setHoverStyle(bar, 1, 0);
    expect(bar.options.backgroundColor).toBe(helpers.getHoverColor('rgb(255, 255, 255)'));
    expect(bar.options.borderColor).toBe(helpers.getHoverColor('rgb(9, 9, 9)'));
    expect(bar.options.borderWidth).toBe(2.5);
    meta.controller.removeHoverStyle(bar);
    expect(bar.options.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(bar.options.borderColor).toBe('rgb(9, 9, 9)');
    expect(bar.options.borderWidth).toBe(2.5);
  });

  describe('Bar width', function() {
    beforeEach(function() {
      // 2 datasets
      this.data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
          data: [10, 20, 30, 40, 50, 60, 70],
        }, {
          data: [10, 20, 30, 40, 50, 60, 70],
        }]
      };
    });

    afterEach(function() {
      var chart = window.acquireChart(this.config);
      var meta = chart.getDatasetMeta(0);
      var xScale = chart.scales[meta.xAxisID];
      var options = Chart.defaults.datasets.bar;

      var categoryPercentage = options.categoryPercentage;
      var barPercentage = options.barPercentage;
      var stacked = xScale.options.stacked;

      var totalBarWidth = 0;
      for (var i = 0; i < chart.data.datasets.length; i++) {
        var bars = chart.getDatasetMeta(i).data;
        for (var j = xScale.min; j <= xScale.max; j++) {
          totalBarWidth += bars[j].width;
        }
        if (stacked) {
          break;
        }
      }

      var actualValue = totalBarWidth;
      var expectedValue = xScale.width * categoryPercentage * barPercentage;
      expect(actualValue).toBeCloseToPixel(expectedValue);

    });

    it('should correctly set bar width when min and max option is set.', function() {
      this.config = {
        type: 'bar',
        data: this.data,
        options: {
          scales: {
            x: {
              min: 'March',
              max: 'May',
            }
          }
        }
      };
    });

    it('should correctly set bar width when scale are stacked with min and max options.', function() {
      this.config = {
        type: 'bar',
        data: this.data,
        options: {
          scales: {
            x: {
              min: 'March',
              max: 'May',
            },
            y: {
              stacked: true
            }
          }
        }
      };
    });
  });

  describe('Bar height (horizontal type)', function() {
    beforeEach(function() {
      // 2 datasets
      this.data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
          data: [10, 20, 30, 40, 50, 60, 70],
        }, {
          data: [10, 20, 30, 40, 50, 60, 70],
        }]
      };
    });

    afterEach(function() {
      var chart = window.acquireChart(this.config);
      var meta = chart.getDatasetMeta(0);
      var yScale = chart.scales[meta.yAxisID];

      var config = meta.controller.options;
      var categoryPercentage = config.categoryPercentage;
      var barPercentage = config.barPercentage;
      var stacked = yScale.options.stacked;

      var totalBarHeight = 0;
      for (var i = 0; i < chart.data.datasets.length; i++) {
        var bars = chart.getDatasetMeta(i).data;
        for (var j = yScale.min; j <= yScale.max; j++) {
          totalBarHeight += bars[j].height;
        }
        if (stacked) {
          break;
        }
      }

      var actualValue = totalBarHeight;
      var expectedValue = yScale.height * categoryPercentage * barPercentage;
      expect(actualValue).toBeCloseToPixel(expectedValue);

    });

    it('should correctly set bar height when min and max option is set.', function() {
      this.config = {
        type: 'bar',
        data: this.data,
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              min: 'March',
              max: 'May',
            }
          }
        }
      };
    });

    it('should correctly set bar height when scale are stacked with min and max options.', function() {
      this.config = {
        type: 'bar',
        data: this.data,
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              stacked: true
            },
            y: {
              min: 'March',
              max: 'May',
            }
          }
        }
      };
    });
  });

  describe('Bar thickness with a category scale', function() {
    [undefined, 20].forEach(function(barThickness) {
      describe('When barThickness is ' + barThickness, function() {
        beforeEach(function() {
          this.chart = window.acquireChart({
            type: 'bar',
            data: {
              datasets: [{
                data: [1, 2]
              }, {
                data: [1, 2]
              }],
              labels: ['label1', 'label2', 'label3']
            },
            options: {
              legend: false,
              title: false,
              datasets: {
                bar: {
                  barThickness: barThickness
                }
              },
              scales: {
                x: {
                  id: 'x',
                  type: 'category',
                },
                y: {
                  type: 'linear',
                }
              }
            }
          });
        });

        it('should correctly set bar width', function() {
          var chart = this.chart;
          var expected, i, ilen, meta;

          if (barThickness) {
            expected = barThickness;
          } else {
            var scale = chart.scales.x;
            var options = Chart.defaults.datasets.bar;
            var categoryPercentage = options.categoryPercentage;
            var barPercentage = options.barPercentage;
            var tickInterval = scale.getPixelForTick(1) - scale.getPixelForTick(0);

            expected = tickInterval * categoryPercentage / 2 * barPercentage;
          }

          for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
            meta = chart.getDatasetMeta(i);
            expect(meta.data[0].width).toBeCloseToPixel(expected);
            expect(meta.data[1].width).toBeCloseToPixel(expected);
          }
        });

        it('should correctly set bar width if maxBarThickness is specified', function() {
          var chart = this.chart;
          var i, ilen, meta;

          chart.data.datasets[0].maxBarThickness = 10;
          chart.data.datasets[1].maxBarThickness = 10;
          chart.update();

          for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
            meta = chart.getDatasetMeta(i);
            expect(meta.data[0].width).toBeCloseToPixel(10);
            expect(meta.data[1].width).toBeCloseToPixel(10);
          }
        });
      });
    });
  });

  it('minBarLength settings should be used on Y axis on bar chart', function() {
    var minBarLength = 4;
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          minBarLength: minBarLength,
          data: [0.05, -0.05, 10, 15, 20, 25, 30, 35]
        }]
      }
    });

    var data = chart.getDatasetMeta(0).data;
    var halfBaseLine = chart.scales.y.getLineWidthForValue(0) / 2;

    expect(data[0].base - minBarLength + halfBaseLine).toEqual(data[0].y);
    expect(data[1].base + minBarLength - halfBaseLine).toEqual(data[1].y);
  });

  it('minBarLength settings should be used on X axis on horizontal bar chart', function() {
    var minBarLength = 4;
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          indexAxis: 'y',
          minBarLength: minBarLength,
          data: [0.05, -0.05, 10, 15, 20, 25, 30, 35]
        }]
      }
    });

    var data = chart.getDatasetMeta(0).data;
    var halfBaseLine = chart.scales.x.getLineWidthForValue(0) / 2;

    expect(data[0].base + minBarLength - halfBaseLine).toEqual(data[0].x);
    expect(data[1].base - minBarLength + halfBaseLine).toEqual(data[1].x);
  });

  it('should respect the data visibility settings', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [1, 2, 3, 4]
        }],
        labels: ['A', 'B', 'C', 'D']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false
          },
          y: {
            type: 'linear',
            display: false,
          }
        }
      }
    });

    var data = chart.getDatasetMeta(0).data;
    expect(data[0].base).toBeCloseToPixel(512);
    expect(data[0].y).toBeCloseToPixel(384);

    chart.toggleDataVisibility(0);
    chart.update();

    data = chart.getDatasetMeta(0).data;
    expect(data[0].base).toBeCloseToPixel(512);
    expect(data[0].y).toBeCloseToPixel(512);
  });

  it('should hide bar dataset beneath the chart for correct animations', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          data: [1, 2, 3, 4]
        }, {
          data: [1, 2, 3, 4]
        }],
        labels: ['A', 'B', 'C', 'D']
      },
      options: {
        plugins: {
          legend: false,
          title: false
        },
        scales: {
          x: {
            type: 'category',
            display: false,
            stacked: true,
          },
          y: {
            type: 'linear',
            display: false,
            stacked: true,
          }
        }
      }
    });

    var data = chart.getDatasetMeta(0).data;
    expect(data[0].base).toBeCloseToPixel(512);
    expect(data[0].y).toBeCloseToPixel(448);

    chart.setDatasetVisibility(0, false);
    chart.update();

    data = chart.getDatasetMeta(0).data;
    expect(data[0].base).toBeCloseToPixel(640);
    expect(data[0].y).toBeCloseToPixel(512);
  });

  describe('Float bar', function() {
    it('Should return correct values from getMinMax', function() {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          labels: ['a'],
          datasets: [{
            data: [[10, -10]]
          }]
        }
      });

      expect(chart.scales.y.getMinMax()).toEqual({min: -10, max: 10});
    });
  });

  describe('clip', function() {
    it('Should not use ctx.clip when clip=false', function() {
      var ctx = window.createMockContext();
      ctx.resetTransform = function() {};

      var chart = window.acquireChart({
        type: 'bar',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{
            data: [1, 2, 3],
            clip: false
          }]
        }
      });
      var orig = chart.ctx;

      // Draw on mock context
      chart.ctx = ctx;
      chart.draw();

      chart.ctx = orig;

      expect(ctx.getCalls().filter(x => x.name === 'clip').length).toEqual(0);
    });
  });

  it('should not crash with skipNull and uneven datasets', function() {
    function unevenChart() {
      window.acquireChart({
        type: 'bar',
        data: {
          labels: [1, 2],
          datasets: [
            {data: [1, 2]},
            {data: [1, 2, 3]},
          ]
        },
        options: {
          skipNull: true,
        }
      });
    }

    expect(unevenChart).not.toThrow();
  });

  it('should correctly count the number of stacks when skipNull and different order datasets', function() {

    const chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {
            id: '1',
            label: 'USA',
            data: [
              {
                xScale: 'First',
                Country: 'USA',
                yScale: 524
              },
              {
                xScale: 'Second',
                Country: 'USA',
                yScale: 325
              }
            ],

            yAxisID: 'yScale',
            xAxisID: 'xScale',

            parsing: {
              yAxisKey: 'yScale',
              xAxisKey: 'xScale'
            }
          },
          {
            id: '2',
            label: 'BRA',
            data: [
              {
                xScale: 'Second',
                Country: 'BRA',
                yScale: 183
              },
              {
                xScale: 'First',
                Country: 'BRA',
                yScale: 177
              }
            ],

            yAxisID: 'yScale',
            xAxisID: 'xScale',

            parsing: {
              yAxisKey: 'yScale',
              xAxisKey: 'xScale'
            }
          },
          {
            id: '3',
            label: 'DEU',
            data: [
              {
                xScale: 'First',
                Country: 'DEU',
                yScale: 162
              }
            ],

            yAxisID: 'yScale',
            xAxisID: 'xScale',

            parsing: {
              yAxisKey: 'yScale',
              xAxisKey: 'xScale'
            }
          }
        ]
      },
      options: {
        skipNull: true
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.controller._getStackCount(0)).toBe(3);
    expect(meta.controller._getStackCount(1)).toBe(2);

  });

  it('should not override tooltip title and label callbacks', async() => {
    const chart = window.acquireChart({
      type: 'bar',
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
