// Test the rectangle element
describe('Legend block tests', function() {
  describe('auto', jasmine.fixture.specs('plugin.legend'));

  it('should have the correct default config', function() {
    expect(Chart.defaults.plugins.legend).toEqual({
      display: true,
      position: 'top',
      align: 'center',
      fullSize: true,
      reverse: false,
      weight: 1000,

      // a callback that will handle
      onClick: jasmine.any(Function),
      onHover: null,
      onLeave: null,

      labels: {
        color: jasmine.any(Function),
        boxWidth: 40,
        padding: 10,
        generateLabels: jasmine.any(Function)
      },

      title: {
        color: jasmine.any(Function),
        display: false,
        position: 'center',
        text: '',
      },

      navigation: {
        color: jasmine.any(Function),
        display: false,
        arrowSize: 12,
        maxCols: 1,
        maxRows: 3,
        padding: {
          x: 10,
          y: 10,
          top: 0
        },
        align: 'start',
        grid: true,
        activeColor: jasmine.any(Function),
        inactiveColor: jasmine.any(Function),
        font: {
          weight: 'bold',
          size: 14
        }
      },
    });
  });

  it('should update bar chart correctly', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'butt',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          data: []
        }, {
          label: 'dataset2',
          hidden: true,
          borderJoinStyle: 'miter',
          data: []
        }, {
          label: 'dataset3',
          borderWidth: 10,
          borderColor: 'green',
          pointStyle: 'crossRot',
          data: []
        }],
        labels: []
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 0,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: true,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 0,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 1
    }, {
      text: 'dataset3',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 10,
      strokeStyle: 'green',
      pointStyle: 'crossRot',
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 2
    }]);
  });

  it('should update line chart correctly', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'round',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          data: []
        }, {
          label: 'dataset2',
          hidden: true,
          borderJoinStyle: 'round',
          data: []
        }, {
          label: 'dataset3',
          borderWidth: 10,
          borderColor: 'green',
          pointStyle: 'crossRot',
          fill: false,
          data: []
        }],
        labels: []
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: 'round',
      lineDash: [2, 2],
      lineDashOffset: 5.5,
      lineJoin: 'miter',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: true,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'round',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 1
    }, {
      text: 'dataset3',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'miter',
      lineWidth: 10,
      strokeStyle: 'green',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 2
    }]);
  });

  it('should reverse correctly', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'round',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          data: []
        }, {
          label: 'dataset2',
          hidden: true,
          borderJoinStyle: 'round',
          data: []
        }, {
          label: 'dataset3',
          borderWidth: 10,
          borderColor: 'green',
          pointStyle: 'crossRot',
          fill: false,
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            reverse: true
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset3',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'miter',
      lineWidth: 10,
      strokeStyle: 'green',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 2
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: true,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'round',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 1
    }, {
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: 'round',
      lineDash: [2, 2],
      lineDashOffset: 5.5,
      lineJoin: 'miter',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }]);
  });

  it('should filter items', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'butt',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          data: []
        }, {
          label: 'dataset2',
          hidden: true,
          borderJoinStyle: 'miter',
          data: [],
          legendHidden: true,
        }, {
          label: 'dataset3',
          borderWidth: 10,
          borderRadius: 10,
          borderColor: 'green',
          pointStyle: 'crossRot',
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            labels: {
              filter: function(legendItem, data) {
                var dataset = data.datasets[legendItem.datasetIndex];
                return !dataset.legendHidden;
              }
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 0,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }, {
      text: 'dataset3',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 10,
      strokeStyle: 'green',
      pointStyle: 'crossRot',
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 2
    }]);
  });

  it('should sort items', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'round',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          data: []
        }, {
          label: 'dataset2',
          hidden: true,
          borderJoinStyle: 'round',
          data: []
        }, {
          label: 'dataset3',
          borderWidth: 10,
          borderColor: 'green',
          pointStyle: 'crossRot',
          fill: false,
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            labels: {
              sort: function(a, b) {
                return b.datasetIndex > a.datasetIndex ? 1 : -1;
              }
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset3',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'miter',
      lineWidth: 10,
      strokeStyle: 'green',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 2
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: true,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'round',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 1
    }, {
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: 'round',
      lineDash: [2, 2],
      lineDashOffset: 5.5,
      lineJoin: 'miter',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }]);
  });

  it('should not throw when the label options are missing', function() {
    var makeChart = function() {
      window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            label: 'dataset1',
            backgroundColor: '#f31',
            borderCapStyle: 'butt',
            borderDash: [2, 2],
            borderDashOffset: 5.5,
            data: []
          }],
          labels: []
        },
        options: {
          plugins: {
            legend: {
              labels: false,
            }
          }
        }
      });
    };
    expect(makeChart).not.toThrow();
  });

  it('should not draw legend items outside of the chart bounds', function() {
    var chart = window.acquireChart(
      {
        type: 'line',
        data: {
          datasets: [1, 2, 3].map(function(n) {
            return {
              label: 'dataset' + n,
              data: []
            };
          }),
          labels: []
        },
        options: {
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      },
      {
        canvas: {
          width: 512,
          height: 105
        }
      }
    );

    // Check some basic assertions about the test setup
    expect(chart.width).toBe(512);
    expect(chart.legend.legendHitBoxes.length).toBe(3);

    // Check whether any legend items reach outside the established bounds
    chart.legend.legendHitBoxes.forEach(function(item) {
      expect(item.left + item.width).toBeLessThanOrEqual(chart.width);
    });
  });

  it('should draw legend with multiline labels', function() {
    const chart = window.acquireChart({
      type: 'doughnut',
      data: {
        labels: [
          'ABCDE',
          [
            'ABCDE',
            'ABCDE',
          ],
          [
            'Some Text',
            'Some Text',
            'Some Text',
          ],
          'ABCDE',
        ],
        datasets: [
          {
            label: 'test',
            data: [
              73.42,
              18.13,
              7.54,
              0.9,
              0.0025,
              1.8e-5,
            ],
            backgroundColor: [
              '#0078C2',
              '#56CAF5',
              '#B1E3F9',
              '#FBBC8D',
              '#F6A3BE',
              '#4EC2C1',
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              pointStyle: 'rect',
            },
            position: 'right',
            align: 'center',
            maxWidth: 860,
          },
        },
        aspectRatio: 3,
      },
    });

    // Check some basic assertions about the test setup
    expect(chart.legend.legendHitBoxes.length).toBe(4);

    // Check whether any legend items reach outside the established bounds
    chart.legend.legendHitBoxes.forEach(function(item) {
      expect(item.left + item.width).toBeLessThanOrEqual(chart.width);
    });
  });

  it('should draw items with a custom boxHeight', function() {
    var chart = window.acquireChart(
      {
        type: 'line',
        data: {
          datasets: [{
            label: 'dataset1',
            data: []
          }],
          labels: []
        },
        options: {
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxHeight: 40
              }
            }
          }
        }
      },
      {
        canvas: {
          width: 512,
          height: 105
        }
      }
    );
    const hitBox = chart.legend.legendHitBoxes[0];
    expect(hitBox.height).toBe(40);
  });

  it('should pick up the first item when the property is an array', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: ['#f31', '#666', '#14e'],
          borderWidth: [5, 10, 15],
          borderColor: ['red', 'green', 'blue'],
          data: []
        }],
        labels: []
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 5,
      strokeStyle: 'red',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }]);
  });

  it('should use the borderRadius in the legend', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: ['#f31', '#666', '#14e'],
          borderWidth: [5, 10, 15],
          borderColor: ['red', 'green', 'blue'],
          borderRadius: 10,
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            labels: {
              useBorderRadius: true,
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: 10,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 5,
      strokeStyle: 'red',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }]);
  });

  it('should use the value for the first item when the property is a function', function() {
    var helpers = window.Chart.helpers;
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return helpers.color({r: value * 10, g: 0, b: 0}).rgbString();
          },
          borderWidth: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return value;
          },
          borderColor: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return helpers.color({r: 255 - value * 10, g: 0, b: 0}).rgbString();
          },
          data: [5, 10, 15, 20]
        }],
        labels: ['A', 'B', 'C', 'D']
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: 'rgb(50, 0, 0)',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 5,
      strokeStyle: 'rgb(205, 0, 0)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }]);
  });

  it('should draw correctly when usePointStyle is true', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'butt',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          borderWidth: 0,
          borderColor: '#f31',
          pointStyle: 'crossRot',
          pointBackgroundColor: 'rgba(0,0,0,0.1)',
          pointBorderWidth: 5,
          pointBorderColor: 'green',
          data: []
        }, {
          label: 'dataset2',
          backgroundColor: '#f31',
          borderJoinStyle: 'miter',
          borderWidth: 2,
          borderColor: '#f31',
          pointStyle: 'crossRot',
          pointRotation: 15,
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 5,
      strokeStyle: 'green',
      pointStyle: 'crossRot',
      rotation: 0,
      textAlign: undefined,
      datasetIndex: 0
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 2,
      strokeStyle: '#f31',
      pointStyle: 'crossRot',
      rotation: 15,
      textAlign: undefined,
      datasetIndex: 1
    }]);
  });

  it('should draw correctly when usePointStyle is true and pointStyle override is set', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'butt',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          borderWidth: 0,
          borderColor: '#f31',
          pointStyle: 'crossRot',
          pointBackgroundColor: 'rgba(0,0,0,0.1)',
          pointBorderWidth: 5,
          pointBorderColor: 'green',
          data: []
        }, {
          label: 'dataset2',
          backgroundColor: '#f31',
          borderJoinStyle: 'miter',
          borderWidth: 2,
          borderColor: '#f31',
          pointStyle: 'crossRot',
          pointRotation: 15,
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              pointStyle: 'star'
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 5,
      strokeStyle: 'green',
      pointStyle: 'star',
      rotation: 0,
      textAlign: undefined,
      datasetIndex: 0
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 2,
      strokeStyle: '#f31',
      pointStyle: 'star',
      rotation: 15,
      textAlign: undefined,
      datasetIndex: 1
    }]);
  });

  it('should not crash when the legend defaults are false', function() {
    const oldDefaults = Chart.defaults.plugins.legend;

    Chart.defaults.set({
      plugins: {
        legend: false,
      },
    });

    var chart = window.acquireChart({
      type: 'doughnut',
      data: {
        datasets: [{
          label: 'dataset1',
          data: [1, 2, 3, 4]
        }],
        labels: ['', '', '', '']
      },
    });
    expect(chart).toBeDefined();

    Chart.defaults.set({
      plugins: {
        legend: oldDefaults,
      },
    });
  });

  it('should not read onClick from chart options', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'dataset',
          backgroundColor: 'red',
          borderColor: 'red',
          data: [120, 23, 24, 45, 51]
        }]
      },
      options: {
        responsive: true,
        onClick() { },
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
    expect(chart.legend.options.onClick).toBe(Chart.defaults.plugins.legend.onClick);
  });

  it('should read labels.color from chart options', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'dataset',
          backgroundColor: 'red',
          borderColor: 'red',
          data: [120, 23, 24, 45, 51]
        }]
      },
      options: {
        responsive: true,
        color: 'green',
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
    expect(chart.legend.options.labels.color).toBe('green');
    expect(chart.legend.options.title.color).toBe('green');
  });


  describe('config update', function() {
    it('should update the options', function() {
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
            legend: {
              display: true
            }
          }
        }
      });
      expect(chart.legend.options.display).toBe(true);

      chart.options.plugins.legend.display = false;
      chart.update();
      expect(chart.legend.options.display).toBe(false);
    });

    it('should update the associated layout item', function() {
      var chart = acquireChart({
        type: 'line',
        data: {},
        options: {
          plugins: {
            legend: {
              fullSize: true,
              position: 'top',
              weight: 150
            }
          }
        }
      });

      expect(chart.legend.fullSize).toBe(true);
      expect(chart.legend.position).toBe('top');
      expect(chart.legend.weight).toBe(150);

      chart.options.plugins.legend.fullSize = false;
      chart.options.plugins.legend.position = 'left';
      chart.options.plugins.legend.weight = 42;
      chart.update();

      expect(chart.legend.fullSize).toBe(false);
      expect(chart.legend.position).toBe('left');
      expect(chart.legend.weight).toBe(42);
    });

    it('should remove the legend if the new options are false', function() {
      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }]
        }
      });
      expect(chart.legend).not.toBe(undefined);

      chart.options.plugins.legend = false;
      chart.update();
      expect(chart.legend).toBe(undefined);
    });

    it('should create the legend if the legend options are changed to exist', function() {
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
            legend: false
          }
        }
      });
      expect(chart.legend).toBe(undefined);

      chart.options.plugins.legend = {};
      chart.update();
      expect(chart.legend).not.toBe(undefined);
      expect(chart.legend.options).toEqualOptions(Object.assign({},
        // replace scriptable options with resolved values
        Chart.defaults.plugins.legend,
        {
          labels: {color: Chart.defaults.color},
          title: {color: Chart.defaults.color},
          navigation: {color: Chart.defaults.color}
        }
      ));
    });
  });

  describe('callbacks', function() {
    it('should call onClick, onHover and onLeave at the correct times', async function() {
      var clickItem = null;
      var hoverItem = null;
      var leaveItem = null;

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
            legend: {
              onClick: function(_, item) {
                clickItem = item;
              },
              onHover: function(_, item) {
                hoverItem = item;
              },
              onLeave: function(_, item) {
                leaveItem = item;
              }
            }
          }
        }
      });

      var hb = chart.legend.legendHitBoxes[0];
      var el = {
        x: hb.left + (hb.width / 2),
        y: hb.top + (hb.height / 2)
      };

      await jasmine.triggerMouseEvent(chart, 'click', el);
      expect(clickItem).toBe(chart.legend.legendItems[0]);

      await jasmine.triggerMouseEvent(chart, 'mousemove', el);
      expect(hoverItem).toBe(chart.legend.legendItems[0]);

      await jasmine.triggerMouseEvent(chart, 'mousemove', chart.getDatasetMeta(0).data[0]);
      expect(leaveItem).toBe(chart.legend.legendItems[0]);
    });

    it('should call onLeave when the mouse leaves the canvas', async function() {
      var hoverItem = null;
      var leaveItem = null;

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
            legend: {
              onHover: function(_, item) {
                hoverItem = item;
              },
              onLeave: function(_, item) {
                leaveItem = item;
              }
            }
          }
        }
      });

      var hb = chart.legend.legendHitBoxes[0];
      var el = {
        x: hb.left + (hb.width / 2),
        y: hb.top + (hb.height / 2)
      };

      await jasmine.triggerMouseEvent(chart, 'mousemove', el);
      expect(hoverItem).toBe(chart.legend.legendItems[0]);

      await jasmine.triggerMouseEvent(chart, 'mouseout');
      expect(leaveItem).toBe(chart.legend.legendItems[0]);
    });


    it('should call onClick for the correct item when in RTL mode', async function() {
      var clickItem = null;

      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100],
            label: 'dataset 1'
          }, {
            data: [10, 20, 30, 100],
            label: 'dataset 2'
          }]
        },
        options: {
          plugins: {
            legend: {
              onClick: function(_, item) {
                clickItem = item;
              },
            }
          }
        }
      });

      var hb = chart.legend.legendHitBoxes[0];
      var el = {
        x: hb.left + (hb.width / 2),
        y: hb.top + (hb.height / 2)
      };

      await jasmine.triggerMouseEvent(chart, 'click', el);
      expect(clickItem).toBe(chart.legend.legendItems[0]);
    });
  });

  describe('navigation', function() {
    it('should not change legendItems when navigation is active', function() {
      const chart = acquireChart({
        type: 'doughnut',
        data: {
          labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
          datasets: [{
            data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
          }]
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: 'top',
              navigation: {
                display: true,
                maxRows: 1
              }
            }
          },
        }
      });

      expect(chart.legend.navigation).toBeTruthy();
      expect(chart.legend.legendItems.length).toBe(10);
      expect(chart.legend.navigation.legendItems.length).toBe(4);
    });

    describe('horizontal', function() {
      it('should not show navigation by default', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
            datasets: [{
              data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'top',
                maxHeight: 100
              }
            }
          }
        });

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should not show navigation if display false', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
            datasets: [{
              data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'top',
                navigation: {
                  display: false
                }
              }
            }
          }
        });

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should not show navigation if options is false', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  navigation: false
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 512}
          }
        );

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should show navigation if display true', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3'],
              datasets: [{
                data: [10, 20, 30]
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  navigation: {
                    display: true,
                    maxRows: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 512}
          }
        );

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(3);
        expect(chart.legend.navigation.legendItems.length).toBe(3);
      });

      it('should not show navigation if display auto and enough space', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2'],
              datasets: [{
                data: [10, 20]
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  navigation: {
                    display: 'auto',
                    maxRows: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 512}
          }
        );

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(2);
        expect(chart.legend.legendItems.length).toBe(2);
      });

      it('should show navigation if display auto and low space', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
            datasets: [{
              data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'top',
                navigation: {
                  display: 'auto',
                  maxRows: 1
                }
              }
            },
          }
        });

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
      });

      it('should change pages when clicking on the navigation', async function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
            datasets: [{
              data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'top',
                navigation: {
                  display: true,
                  maxRows: 1
                }
              }
            },
          }
        });

        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.navigation.page).toBe(0);

        const next = {
          x: chart.legend.navigation.next.x + (chart.legend.navigation.next.width / 2),
          y: chart.legend.navigation.next.y + (chart.legend.navigation.next.height / 2)
        };

        await jasmine.triggerMouseEvent(chart, 'click', next);

        expect(chart.legend.navigation.page).toBe(1);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);

        await jasmine.triggerMouseEvent(chart, 'click', next);

        expect(chart.legend.navigation.page).toBe(2);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(2);

        await jasmine.triggerMouseEvent(chart, 'click', next);

        expect(chart.legend.navigation.page).toBe(2);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(2);

        const prev = {
          x: chart.legend.navigation.prev.x + (chart.legend.navigation.prev.width / 2),
          y: chart.legend.navigation.prev.y + (chart.legend.navigation.prev.height / 2)
        };

        await jasmine.triggerMouseEvent(chart, 'click', prev);

        expect(chart.legend.navigation.page).toBe(1);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);

        await jasmine.triggerMouseEvent(chart, 'click', prev);

        expect(chart.legend.navigation.page).toBe(0);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);

        await jasmine.triggerMouseEvent(chart, 'click', prev);

        expect(chart.legend.navigation.page).toBe(0);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);
      });

      it('should show navigation after changing the options', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  navigation: {
                    display: false,
                    maxRows: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 512}
          }
        );

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);

        chart.options.plugins.legend.navigation.display = true;
        chart.update();

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
      });

      it('should hide navigation after changing the options', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  navigation: {
                    display: true,
                    maxRows: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 512}
          }
        );

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);

        chart.options.plugins.legend.navigation.display = false;
        chart.update();

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should show navigation after adding labels when display auto', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4'],
            datasets: [{
              data: [10, 20, 30, 40]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'top',
                navigation: {
                  display: 'auto',
                  maxRows: 1
                }
              }
            },
          }
        });

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(4);

        chart.data.labels.push('Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10');
        chart.update();

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should hide navigation after removing labels when display auto', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
            datasets: [{
              data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'top',
                navigation: {
                  display: 'auto',
                  maxRows: 1
                }
              }
            },
          }
        });

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(10);

        chart.data.labels.splice(4, 6);
        chart.update();

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(4);
      });

      it('should respect max rows', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
            datasets: [{
              data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'top',
                navigation: {
                  display: 'auto',
                  maxRows: 1
                }
              }
            },
          }
        });

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(10);

        chart.options.plugins.legend.navigation.maxRows = 2;
        chart.update();

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(8);
        expect(chart.legend.navigation.legendItems.length).toBe(8);
        expect(chart.legend.legendItems.length).toBe(10);

        chart.options.plugins.legend.navigation.maxRows = 3;
        chart.update();

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should respect horizontal grid', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['AAAAAAAAAAAAAAAAAAAA', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
            datasets: [{
              data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'top',
                navigation: {
                  display: true,
                  maxRows: 5,
                  grid: {
                    x: true
                  }
                }
              }
            },
          }
        });

        expect(chart.legend.navigation).toBeTruthy();

        const largestLabel = chart.legend.legendHitBoxes[0];

        chart.legend.legendHitBoxes.forEach((box) => {
          expect(box.offsetWidth).toBe(largestLabel.offsetWidth);
        });

        chart.options.plugins.legend.navigation.grid.x = false;
        chart.update();

        chart.legend.legendHitBoxes.slice(1).forEach((box) => {
          expect(largestLabel.offsetWidth).toBeGreaterThan(box.offsetWidth);
        });
      });

      it('should respect vertical grid', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: [['Label 1', 'Multiline'], 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
            datasets: [{
              data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'top',
                navigation: {
                  display: true,
                  maxRows: 5,
                  grid: {
                    y: true
                  }
                }
              }
            },
          }
        });

        expect(chart.legend.navigation).toBeTruthy();

        const padding = chart.options.plugins.legend.labels.padding;
        let highestLabel = chart.legend.legendHitBoxes[0];
        let topBlock = chart.legend.navigation.blocks[0];

        expect(topBlock.height).toBe(highestLabel.height + padding);

        chart.legend.navigation.blocks.forEach((block, blockIndex) => {
          for (let i = block.start; i < block.end; i++) {
            const legend = chart.legend.legendHitBoxes[i];
            expect(legend.top - padding).toBe(topBlock.height * blockIndex);
          }
        });

        chart.options.plugins.legend.navigation.grid.y = false;
        chart.update();

        highestLabel = chart.legend.legendHitBoxes[0];
        topBlock = chart.legend.navigation.blocks[0];

        expect(topBlock.height).toBe(highestLabel.height + padding);

        chart.legend.navigation.blocks.slice(1).forEach((block) => {
          for (let i = block.start; i < block.end; i++) {
            const legend = chart.legend.legendHitBoxes[i];
            expect((legend.top + block.height) - topBlock.height - padding).toBeLessThan(topBlock.height);
          }
        });
      });

      it('should show navigation on resize when display auto', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  navigation: {
                    display: 'auto',
                    maxRows: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 800, height: 512}
          }
        );

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(8);
        expect(chart.legend.legendItems.length).toBe(8);

        chart.resize(512, 512);

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(5);
        expect(chart.legend.navigation.legendItems.length).toBe(5);
        expect(chart.legend.legendItems.length).toBe(8);
      });
    });

    describe('vertical', function() {
      it('should not show navigation by default', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10', 'Label 11', 'Label 12', 'Label 13', 'Label 14', 'Label 15'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10, 20, 30, 40, 50, 60]
              }]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  maxWidth: 100,
                }
              }
            }
          },
          {
            canvas: {width: 512, height: 250}
          }
        );

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(15);
        expect(chart.legend.legendItems.length).toBe(15);
      });

      it('should not show navigation if display false', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
            datasets: [{
              data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'right',
                navigation: {
                  display: false
                }
              }
            }
          }
        });

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should not show navigation if options is false', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
            datasets: [{
              data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'right',
                navigation: false
              }
            },
          }
        });

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should show navigation if display true', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2', 'Label 3'],
            datasets: [{
              data: [10, 20, 30]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'right',
                navigation: {
                  display: true,
                  maxCols: 1
                }
              }
            },
          }
        });

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(3);
        expect(chart.legend.navigation.legendItems.length).toBe(3);
      });

      it('should not show navigation if display auto and enough space', function() {
        const chart = acquireChart({
          type: 'doughnut',
          data: {
            labels: ['Label 1', 'Label 2'],
            datasets: [{
              data: [10, 20]
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'right',
                navigation: {
                  display: 'auto',
                  maxCols: 1
                }
              }
            },
          }
        });

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(2);
        expect(chart.legend.legendItems.length).toBe(2);
      });

      it('should show navigation if display auto and low space', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  navigation: {
                    display: 'auto',
                    maxCols: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 130}
          }
        );

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should change pages when clicking on the navigation', async function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  navigation: {
                    display: true,
                    maxCols: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 130}
          }
        );

        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.navigation.page).toBe(0);

        const next = {
          x: chart.legend.navigation.next.x + (chart.legend.navigation.next.width / 2),
          y: chart.legend.navigation.next.y + (chart.legend.navigation.next.height / 2)
        };

        await jasmine.triggerMouseEvent(chart, 'click', next);

        expect(chart.legend.navigation.page).toBe(1);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);

        await jasmine.triggerMouseEvent(chart, 'click', next);

        expect(chart.legend.navigation.page).toBe(2);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(2);

        await jasmine.triggerMouseEvent(chart, 'click', next);

        expect(chart.legend.navigation.page).toBe(2);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(2);

        const prev = {
          x: chart.legend.navigation.prev.x + (chart.legend.navigation.prev.width / 2),
          y: chart.legend.navigation.prev.y + (chart.legend.navigation.prev.height / 2)
        };

        await jasmine.triggerMouseEvent(chart, 'click', prev);

        expect(chart.legend.navigation.page).toBe(1);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);

        await jasmine.triggerMouseEvent(chart, 'click', prev);

        expect(chart.legend.navigation.page).toBe(0);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);

        await jasmine.triggerMouseEvent(chart, 'click', prev);

        expect(chart.legend.navigation.page).toBe(0);
        expect(chart.legend.legendItems.length).toBe(10);
        expect(chart.legend.legendHitBoxes.length).toBe(4);
      });

      it('should show navigation after changing the options', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  navigation: {
                    display: false,
                    maxRows: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 130}
          }
        );

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);

        chart.options.plugins.legend.navigation.display = true;
        chart.update();

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should hide navigation after changing the options', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  navigation: {
                    display: true,
                    maxRows: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 130}
          }
        );

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(10);

        chart.options.plugins.legend.navigation.display = false;
        chart.update();

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should show navigation after adding labels when display auto', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4'],
              datasets: [{
                data: [10, 20, 30, 40]
              }]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  navigation: {
                    display: 'auto',
                    maxCols: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 130}
          }
        );

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(4);

        chart.data.labels.push('Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10');
        chart.update();

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should hide navigation after removing labels when display auto', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  navigation: {
                    display: 'auto',
                    maxCols: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 130}
          }
        );

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(10);

        chart.data.labels.splice(4, 6);
        chart.update();

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(4);
      });

      it('should respect max cols', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  navigation: {
                    display: 'auto',
                    maxCols: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 800, height: 130}
          }
        );

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(10);

        chart.options.plugins.legend.navigation.maxCols = 2;
        chart.update();

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(8);
        expect(chart.legend.navigation.legendItems.length).toBe(8);
        expect(chart.legend.legendItems.length).toBe(10);

        chart.options.plugins.legend.navigation.maxCols = 3;
        chart.update();

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(10);
        expect(chart.legend.legendItems.length).toBe(10);
      });

      it('should respect horizontal grid', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['AAAAAAAAAAAAAAA', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  maxWidth: 800,
                  navigation: {
                    display: true,
                    maxCols: 5,
                    grid: {
                      x: true
                    }
                  }
                }
              },
            }
          },
          {
            canvas: {width: 800, height: 130}
          }
        );

        expect(chart.legend.navigation).toBeTruthy();

        const padding = chart.options.plugins.legend.labels.padding;
        let largestLabel = chart.legend.legendHitBoxes[0];
        let leftBlock = chart.legend.navigation.blocks[0];

        expect(leftBlock.width).toBe(largestLabel.width + padding);

        chart.legend.navigation.blocks.forEach((block, blockIndex) => {
          for (let i = block.start; i < block.end; i++) {
            const legend = chart.legend.legendHitBoxes[i];
            expect(legend.left - padding).toBe(chart.legend.left + (leftBlock.width * blockIndex));
          }
        });

        chart.options.plugins.legend.navigation.grid.x = false;
        chart.update();

        largestLabel = chart.legend.legendHitBoxes[0];
        leftBlock = chart.legend.navigation.blocks[0];

        expect(leftBlock.width).toBe(largestLabel.width + padding);

        let leftOffset = leftBlock.width;
        chart.legend.navigation.blocks.slice(1).forEach((block) => {
          for (let i = block.start; i < block.end; i++) {
            const legend = chart.legend.legendHitBoxes[i];
            expect((legend.left - chart.legend.left + block.width) - leftOffset - padding).toBeLessThan(leftBlock.width);
          }
          leftOffset += block.width;
        });
      });

      it('should respect vertical grid', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: [['Label 1', 'Multiline'], 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  navigation: {
                    display: true,
                    maxCols: 5,
                    grid: {
                      y: true
                    }
                  }
                }
              },
            }
          },
          {
            canvas: {width: 800, height: 200}
          }
        );

        expect(chart.legend.navigation).toBeTruthy();

        const highestLabel = chart.legend.legendHitBoxes[0];

        chart.legend.legendHitBoxes.forEach((box) => {
          expect(box.offsetHeight).toBe(highestLabel.offsetHeight);
        });

        chart.options.plugins.legend.navigation.grid.y = false;
        chart.update();

        chart.legend.legendHitBoxes.slice(1).forEach((box) => {
          expect(highestLabel.offsetHeight).toBeGreaterThan(box.offsetHeight);
        });
      });

      it('should show navigation on resize when display auto', function() {
        const chart = acquireChart(
          {
            type: 'doughnut',
            data: {
              labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8'],
              datasets: [{
                data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 10]
              }]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  navigation: {
                    display: 'auto',
                    maxCols: 1
                  }
                }
              },
            }
          },
          {
            canvas: {width: 512, height: 512}
          }
        );

        expect(chart.legend.navigation).toBeUndefined();
        expect(chart.legend.legendHitBoxes.length).toBe(8);
        expect(chart.legend.legendItems.length).toBe(8);

        chart.resize(512, 130);

        expect(chart.legend.navigation).toBeTruthy();
        expect(chart.legend.legendHitBoxes.length).toBe(4);
        expect(chart.legend.navigation.legendItems.length).toBe(4);
        expect(chart.legend.legendItems.length).toBe(8);
      });
    });
  });
});
