// Test the rectangle element
const tooltipPlugin = Chart.registry.getPlugin('tooltip');
const Tooltip = tooltipPlugin._element;

describe('Plugin.Tooltip', function() {
  describe('auto', jasmine.fixture.specs('plugin.tooltip'));

  describe('config', function() {
    it('should not include the dataset label in the body string if not defined', function() {
      var data = {
        datasets: [{
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      };
      var tooltipItem = {
        index: 1,
        datasetIndex: 0,
        dataset: data.datasets[0],
        label: 'Point 2',
        formattedValue: '20'
      };

      var label = Chart.defaults.plugins.tooltip.callbacks.label(tooltipItem);
      expect(label).toBe('20');

      data.datasets[0].label = 'My dataset';
      label = Chart.defaults.plugins.tooltip.callbacks.label(tooltipItem);
      expect(label).toBe('My dataset: 20');
    });
  });

  describe('index mode', function() {
    it('Should only use x distance when intersect is false', async function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)'
          }, {
            label: 'Dataset 2',
            data: [40, 40, 40],
            pointHoverBorderColor: 'rgb(0, 0, 255)',
            pointHoverBackgroundColor: 'rgb(0, 255, 255)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        },
        options: {
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
              padding: {
                left: 6,
                top: 6,
                right: 6,
                bottom: 6
              }
            }
          },
          hover: {
            mode: 'index',
            intersect: false
          }
        }
      });

      // Trigger an event over top of the
      var meta = chart.getDatasetMeta(0);
      var point = meta.data[1];

      // Check and see if tooltip was displayed
      var tooltip = chart.tooltip;
      var defaults = Chart.defaults;

      await jasmine.triggerMouseEvent(chart, 'mousemove', {x: point.x, y: chart.chartArea.top + 10});

      expect(tooltip.options.padding).toEqualOptions({
        left: 6,
        top: 6,
        right: 6,
        bottom: 6,
      });
      expect(tooltip.xAlign).toEqual('left');
      expect(tooltip.yAlign).toEqual('center');
      expect(tooltip.options.bodyColor).toEqual('#fff');

      expect(tooltip.options.bodyFont).toEqualOptions({
        family: defaults.font.family,
        style: defaults.font.style,
        size: defaults.font.size,
      });

      expect(tooltip.options).toEqualOptions({
        bodyAlign: 'left',
        bodySpacing: 2,
      });

      expect(tooltip.options.titleColor).toEqual('#fff');
      expect(tooltip.options.titleFont).toEqualOptions({
        family: defaults.font.family,
        weight: 'bold',
        size: defaults.font.size,
      });

      expect(tooltip.options).toEqualOptions({
        titleAlign: 'left',
        titleSpacing: 2,
        titleMarginBottom: 6,
      });

      expect(tooltip.options.footerColor).toEqual('#fff');
      expect(tooltip.options.footerFont).toEqualOptions({
        family: defaults.font.family,
        weight: 'bold',
        size: defaults.font.size,
      });

      expect(tooltip.options).toEqualOptions({
        footerAlign: 'left',
        footerSpacing: 2,
        footerMarginTop: 6,
      });

      expect(tooltip.options).toEqualOptions({
        // Appearance
        caretSize: 5,
        caretPadding: 2,
        cornerRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.8)',
        multiKeyBackground: '#fff',
        displayColors: true
      });

      expect(tooltip).toEqual(jasmine.objectContaining({
        opacity: 1,

        // Text
        title: ['Point 2'],
        beforeBody: [],
        body: [{
          before: [],
          lines: ['Dataset 1: 20'],
          after: []
        }, {
          before: [],
          lines: ['Dataset 2: 40'],
          after: []
        }],
        afterBody: [],
        footer: [],
        labelColors: [{
          borderColor: defaults.borderColor,
          backgroundColor: defaults.backgroundColor,
          borderWidth: 1,
          borderDash: undefined,
          borderDashOffset: undefined,
          borderRadius: 0,
        }, {
          borderColor: defaults.borderColor,
          backgroundColor: defaults.backgroundColor,
          borderWidth: 1,
          borderDash: undefined,
          borderDashOffset: undefined,
          borderRadius: 0,
        }]
      }));

      expect(tooltip.x).toBeCloseToPixel(266);
      expect(tooltip.y).toBeCloseToPixel(150);
    });

    it('Should only display if intersecting if intersect is set', async function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)'
          }, {
            label: 'Dataset 2',
            data: [40, 40, 40],
            pointHoverBorderColor: 'rgb(0, 0, 255)',
            pointHoverBackgroundColor: 'rgb(0, 255, 255)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        },
        options: {
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: true
            }
          }
        }
      });

      // Trigger an event over top of the
      var meta = chart.getDatasetMeta(0);
      var point = meta.data[1];

      await jasmine.triggerMouseEvent(chart, 'mousemove', {x: point.x, y: 0});
      // Check and see if tooltip was displayed
      var tooltip = chart.tooltip;

      expect(tooltip).toEqual(jasmine.objectContaining({
        opacity: 0,
      }));
    });
  });

  it('Should display in single mode', async function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)'
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            mode: 'nearest',
            intersect: true
          }
        }
      }
    });

    // Trigger an event over top of the
    var meta = chart.getDatasetMeta(0);
    var point = meta.data[1];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);
    // Check and see if tooltip was displayed
    var tooltip = chart.tooltip;
    var defaults = Chart.defaults;

    expect(tooltip.options.padding).toEqual(6);
    expect(tooltip.xAlign).toEqual('left');
    expect(tooltip.yAlign).toEqual('center');

    expect(tooltip.options.bodyFont).toEqual(jasmine.objectContaining({
      family: defaults.font.family,
      style: defaults.font.style,
      size: defaults.font.size,
    }));

    expect(tooltip.options).toEqualOptions({
      bodyAlign: 'left',
      bodySpacing: 2,
    });

    expect(tooltip.options.titleFont).toEqual(jasmine.objectContaining({
      family: defaults.font.family,
      weight: 'bold',
      size: defaults.font.size,
    }));

    expect(tooltip.options).toEqualOptions({
      titleAlign: 'left',
      titleSpacing: 2,
      titleMarginBottom: 6,
    });

    expect(tooltip.options.footerFont).toEqualOptions({
      family: defaults.font.family,
      weight: 'bold',
      size: defaults.font.size,
    });

    expect(tooltip.options).toEqualOptions({
      footerAlign: 'left',
      footerSpacing: 2,
      footerMarginTop: 6,
    });

    expect(tooltip.options).toEqualOptions({
      // Appearance
      caretSize: 5,
      caretPadding: 2,
      cornerRadius: 6,
      backgroundColor: 'rgba(0,0,0,0.8)',
      multiKeyBackground: '#fff',
      displayColors: true
    });

    expect(tooltip.opacity).toEqual(1);
    expect(tooltip.title).toEqual(['Point 2']);
    expect(tooltip.beforeBody).toEqual([]);
    expect(tooltip.body).toEqual([{
      before: [],
      lines: ['Dataset 1: 20'],
      after: []
    }]);
    expect(tooltip.afterBody).toEqual([]);
    expect(tooltip.footer).toEqual([]);
    expect(tooltip.labelTextColors).toEqual(['#fff']);

    expect(tooltip.labelColors).toEqual([{
      borderColor: defaults.borderColor,
      backgroundColor: defaults.backgroundColor,
      borderWidth: 1,
      borderDash: undefined,
      borderDashOffset: undefined,
      borderRadius: 0,
    }]);

    expect(tooltip.x).toBeCloseToPixel(267);
    expect(tooltip.y).toBeCloseToPixel(308);
  });

  it('Should display information from user callbacks', async function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)'
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            mode: 'index',
            callbacks: {
              beforeTitle: function() {
                return 'beforeTitle';
              },
              title: function() {
                return 'title';
              },
              afterTitle: function() {
                return 'afterTitle';
              },
              beforeBody: function() {
                return 'beforeBody';
              },
              beforeLabel: function() {
                return 'beforeLabel';
              },
              label: function() {
                return 'label';
              },
              afterLabel: function() {
                return 'afterLabel';
              },
              afterBody: function() {
                return 'afterBody';
              },
              beforeFooter: function() {
                return 'beforeFooter';
              },
              footer: function() {
                return 'footer';
              },
              afterFooter: function() {
                return 'afterFooter';
              },
              labelTextColor: function() {
                return 'labelTextColor';
              },
              labelPointStyle: function() {
                return {
                  pointStyle: 'labelPointStyle',
                  rotation: 42
                };
              }
            }
          }
        }
      }
    });

    // Trigger an event over top of the
    var meta = chart.getDatasetMeta(0);
    var point = meta.data[1];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);
    // Check and see if tooltip was displayed
    var tooltip = chart.tooltip;
    var defaults = Chart.defaults;

    expect(tooltip.options.padding).toEqual(6);
    expect(tooltip.xAlign).toEqual('left');
    expect(tooltip.yAlign).toEqual('center');

    expect(tooltip.options.bodyFont).toEqual(jasmine.objectContaining({
      family: defaults.font.family,
      style: defaults.font.style,
      size: defaults.font.size,
    }));

    expect(tooltip.options).toEqualOptions({
      bodyAlign: 'left',
      bodySpacing: 2,
    });

    expect(tooltip.options.titleFont).toEqual(jasmine.objectContaining({
      family: defaults.font.family,
      weight: 'bold',
      size: defaults.font.size,
    }));

    expect(tooltip.options).toEqualOptions({
      titleSpacing: 2,
      titleMarginBottom: 6,
    });

    expect(tooltip.options.footerFont).toEqual(jasmine.objectContaining({
      family: defaults.font.family,
      weight: 'bold',
      size: defaults.font.size,
    }));

    expect(tooltip.options).toEqualOptions({
      footerAlign: 'left',
      footerSpacing: 2,
      footerMarginTop: 6,
    });

    expect(tooltip.options).toEqualOptions({
      // Appearance
      caretSize: 5,
      caretPadding: 2,
      cornerRadius: 6,
      backgroundColor: 'rgba(0,0,0,0.8)',
      multiKeyBackground: '#fff',
    });

    expect(tooltip).toEqual(jasmine.objectContaining({
      opacity: 1,

      // Text
      title: ['beforeTitle', 'title', 'afterTitle'],
      beforeBody: ['beforeBody'],
      body: [{
        before: ['beforeLabel'],
        lines: ['label'],
        after: ['afterLabel']
      }, {
        before: ['beforeLabel'],
        lines: ['label'],
        after: ['afterLabel']
      }],
      afterBody: ['afterBody'],
      footer: ['beforeFooter', 'footer', 'afterFooter'],
      labelTextColors: ['labelTextColor', 'labelTextColor'],
      labelColors: [{
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor,
        borderWidth: 1,
        borderDash: undefined,
        borderDashOffset: undefined,
        borderRadius: 0,
      }, {
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor,
        borderWidth: 1,
        borderDash: undefined,
        borderDashOffset: undefined,
        borderRadius: 0,
      }],
      labelPointStyles: [{
        pointStyle: 'labelPointStyle',
        rotation: 42
      }, {
        pointStyle: 'labelPointStyle',
        rotation: 42
      }]
    }));

    expect(tooltip.x).toBeCloseToPixel(267);
    expect(tooltip.y).toBeCloseToPixel(58);
  });

  it('Should provide context object to user callbacks', async function() {
    const chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [{x: 1, y: 10}, {x: 2, y: 20}, {x: 3, y: 30}]
        }]
      },
      options: {
        scales: {
          x: {
            type: 'linear'
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            callbacks: {
              beforeLabel: function(ctx) {
                return ctx.parsed.x + ',' + ctx.parsed.y;
              }
            }
          }
        }
      }
    });

    // Trigger an event over top of the
    const meta = chart.getDatasetMeta(0);
    const point = meta.data[1];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);
    expect(chart.tooltip.body[0].before).toEqual(['2,20']);
  });

  it('Should allow sorting items', async function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)'
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            mode: 'index',
            itemSort: function(a, b) {
              return a.datasetIndex > b.datasetIndex ? -1 : 1;
            }
          }
        }
      }
    });

    // Trigger an event over top of the
    var meta0 = chart.getDatasetMeta(0);
    var point0 = meta0.data[1];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point0);
    // Check and see if tooltip was displayed
    var tooltip = chart.tooltip;
    var defaults = Chart.defaults;

    expect(tooltip).toEqual(jasmine.objectContaining({
      // Positioning
      xAlign: 'left',
      yAlign: 'center',

      // Text
      title: ['Point 2'],
      beforeBody: [],
      body: [{
        before: [],
        lines: ['Dataset 2: 40'],
        after: []
      }, {
        before: [],
        lines: ['Dataset 1: 20'],
        after: []
      }],
      afterBody: [],
      footer: [],
      labelColors: [{
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor,
        borderWidth: 1,
        borderDash: undefined,
        borderDashOffset: undefined,
        borderRadius: 0,
      }, {
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor,
        borderWidth: 1,
        borderDash: undefined,
        borderDashOffset: undefined,
        borderRadius: 0,
      }]
    }));

    expect(tooltip.x).toBeCloseToPixel(267);
    expect(tooltip.y).toBeCloseToPixel(150);
  });

  it('Should allow reversing items', async function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)'
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            mode: 'index',
            reverse: true
          }
        }
      }
    });

    // Trigger an event over top of the
    var meta0 = chart.getDatasetMeta(0);
    var point0 = meta0.data[1];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point0);
    // Check and see if tooltip was displayed
    var tooltip = chart.tooltip;
    var defaults = Chart.defaults;

    expect(tooltip).toEqual(jasmine.objectContaining({
      // Positioning
      xAlign: 'left',
      yAlign: 'center',

      // Text
      title: ['Point 2'],
      beforeBody: [],
      body: [{
        before: [],
        lines: ['Dataset 2: 40'],
        after: []
      }, {
        before: [],
        lines: ['Dataset 1: 20'],
        after: []
      }],
      afterBody: [],
      footer: [],
      labelColors: [{
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor,
        borderWidth: 1,
        borderDash: undefined,
        borderDashOffset: undefined,
        borderRadius: 0,
      }, {
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor,
        borderWidth: 1,
        borderDash: undefined,
        borderDashOffset: undefined,
        borderRadius: 0,
      }]
    }));

    expect(tooltip.x).toBeCloseToPixel(267);
    expect(tooltip.y).toBeCloseToPixel(150);
  });

  it('Should follow dataset order', async function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)',
          order: 10
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)',
          order: 5
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            mode: 'index'
          }
        }
      }
    });

    // Trigger an event over top of the
    var meta0 = chart.getDatasetMeta(0);
    var point0 = meta0.data[1];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point0);
    // Check and see if tooltip was displayed
    var tooltip = chart.tooltip;
    var defaults = Chart.defaults;

    expect(tooltip).toEqual(jasmine.objectContaining({
      // Positioning
      xAlign: 'left',
      yAlign: 'center',

      // Text
      title: ['Point 2'],
      beforeBody: [],
      body: [{
        before: [],
        lines: ['Dataset 2: 40'],
        after: []
      }, {
        before: [],
        lines: ['Dataset 1: 20'],
        after: []
      }],
      afterBody: [],
      footer: [],
      labelColors: [{
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor,
        borderWidth: 1,
        borderDash: undefined,
        borderDashOffset: undefined,
        borderRadius: 0,
      }, {
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor,
        borderWidth: 1,
        borderDash: undefined,
        borderDashOffset: undefined,
        borderRadius: 0,
      }]
    }));

    expect(tooltip.x).toBeCloseToPixel(267);
    expect(tooltip.y).toBeCloseToPixel(150);
  });

  it('should filter items from the tooltip using the callback', async function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)',
          tooltipHidden: true
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            mode: 'index',
            filter: function(tooltipItem, index, tooltipItems, data) {
              // For testing purposes remove the first dataset that has a tooltipHidden property
              return !data.datasets[tooltipItem.datasetIndex].tooltipHidden;
            }
          }
        }
      }
    });

    // Trigger an event over top of the
    var meta0 = chart.getDatasetMeta(0);
    var point0 = meta0.data[1];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point0);
    // Check and see if tooltip was displayed
    var tooltip = chart.tooltip;
    var defaults = Chart.defaults;

    expect(tooltip).toEqual(jasmine.objectContaining({
      // Positioning
      xAlign: 'left',
      yAlign: 'center',

      // Text
      title: ['Point 2'],
      beforeBody: [],
      body: [{
        before: [],
        lines: ['Dataset 2: 40'],
        after: []
      }],
      afterBody: [],
      footer: [],
      labelColors: [{
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor,
        borderWidth: 1,
        borderDash: undefined,
        borderDashOffset: undefined,
        borderRadius: 0,
      }]
    }));
  });

  it('should set the caretPadding based on a config setting', async function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)',
          tooltipHidden: true
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            caretPadding: 10
          }
        }
      }
    });

    // Trigger an event over top of the
    var meta0 = chart.getDatasetMeta(0);
    var point0 = meta0.data[1];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point0);
    // Check and see if tooltip was displayed
    var tooltip = chart.tooltip;

    expect(tooltip.options).toEqualOptions({
      // Positioning
      caretPadding: 10,
    });
  });

  ['line', 'bar'].forEach(function(type) {
    it('Should have dataPoints in a ' + type + ' chart', async function() {
      var chart = window.acquireChart({
        type: type,
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)'
          }, {
            label: 'Dataset 2',
            data: [40, 40, 40],
            pointHoverBorderColor: 'rgb(0, 0, 255)',
            pointHoverBackgroundColor: 'rgb(0, 255, 255)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        },
        options: {
          plugins: {
            tooltip: {
              mode: 'nearest',
              intersect: true
            }
          }
        }
      });

      // Trigger an event over top of the element
      var pointIndex = 1;
      var datasetIndex = 0;
      var point = chart.getDatasetMeta(datasetIndex).data[pointIndex];

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);
      // Check and see if tooltip was displayed
      var tooltip = chart.tooltip;

      expect(tooltip instanceof Object).toBe(true);
      expect(tooltip.dataPoints instanceof Array).toBe(true);
      expect(tooltip.dataPoints.length).toBe(1);

      var tooltipItem = tooltip.dataPoints[0];

      expect(tooltipItem.dataIndex).toBe(pointIndex);
      expect(tooltipItem.datasetIndex).toBe(datasetIndex);
      expect(typeof tooltipItem.label).toBe('string');
      expect(tooltipItem.label).toBe(chart.data.labels[pointIndex]);
      expect(typeof tooltipItem.formattedValue).toBe('string');
      expect(tooltipItem.formattedValue).toBe('' + chart.data.datasets[datasetIndex].data[pointIndex]);
    });
  });

  it('Should not update if active element has not changed', async function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)'
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            mode: 'nearest',
            intersect: true,
            callbacks: {
              title: function() {
                return 'registering callback...';
              }
            }
          }
        }
      }
    });

    // Trigger an event over top of the
    var meta = chart.getDatasetMeta(0);
    var firstPoint = meta.data[1];

    var tooltip = chart.tooltip;
    spyOn(tooltip, 'update').and.callThrough();

    // First dispatch change event, should update tooltip
    await jasmine.triggerMouseEvent(chart, 'mousemove', firstPoint);
    expect(tooltip.update).toHaveBeenCalledWith(true, undefined);

    // Reset calls
    tooltip.update.calls.reset();

    // Second dispatch change event (same event), should not update tooltip
    await jasmine.triggerMouseEvent(chart, 'mousemove', firstPoint);
    expect(tooltip.update).not.toHaveBeenCalled();
  });

  it('Should update if active elements are the same, but the position has changed', async function() {
    const chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)'
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true
          }
        },
        plugins: {
          tooltip: {
            mode: 'nearest',
            position: 'nearest',
            intersect: true,
            callbacks: {
              title: function() {
                return 'registering callback...';
              }
            }
          }
        }
      }
    });

    // Trigger an event over top of the
    const meta = chart.getDatasetMeta(0);
    const firstPoint = meta.data[1];

    const meta2 = chart.getDatasetMeta(1);
    const secondPoint = meta2.data[1];

    const tooltip = chart.tooltip;
    spyOn(tooltip, 'update');

    // First dispatch change event, should update tooltip
    await jasmine.triggerMouseEvent(chart, 'mousemove', firstPoint);
    expect(tooltip.update).toHaveBeenCalledWith(true, undefined);

    // Reset calls
    tooltip.update.calls.reset();

    // Second dispatch change event (same event), should update tooltip
    // because position mode is 'nearest'
    await jasmine.triggerMouseEvent(chart, 'mousemove', secondPoint);
    expect(tooltip.update).toHaveBeenCalledWith(true, undefined);
  });

  describe('positioners', function() {
    it('Should call custom positioner with correct parameters and scope', async function() {

      tooltipPlugin.positioners.test = function() {
        return {x: 0, y: 0};
      };

      spyOn(tooltipPlugin.positioners, 'test').and.callThrough();

      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)'
          }, {
            label: 'Dataset 2',
            data: [40, 40, 40],
            pointHoverBorderColor: 'rgb(0, 0, 255)',
            pointHoverBackgroundColor: 'rgb(0, 255, 255)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        },
        options: {
          plugins: {
            tooltip: {
              mode: 'nearest',
              position: 'test'
            }
          }
        }
      });

      // Trigger an event over top of the
      var pointIndex = 1;
      var datasetIndex = 0;
      var meta = chart.getDatasetMeta(datasetIndex);
      var point = meta.data[pointIndex];
      var fn = tooltipPlugin.positioners.test;

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);
      expect(fn.calls.count()).toBe(2);
      expect(fn.calls.first().args[0] instanceof Array).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(fn.calls.first().args[1], 'x')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(fn.calls.first().args[1], 'y')).toBe(true);
      expect(fn.calls.first().object instanceof Tooltip).toBe(true);
    });

    it('Should ignore same x position when calculating average position with index interaction on stacked bar', async function() {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)',
            stack: 'stack1',
          }, {
            label: 'Dataset 2',
            data: [40, 40, 40],
            pointHoverBorderColor: 'rgb(0, 0, 255)',
            pointHoverBackgroundColor: 'rgb(0, 255, 255)',
            stack: 'stack1',
          }, {
            label: 'Dataset 3',
            data: [90, 100, 110],
            pointHoverBorderColor: 'rgb(0, 0, 255)',
            pointHoverBackgroundColor: 'rgb(0, 255, 255)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        },
        options: {
          interaction: {
            mode: 'index'
          },
          plugins: {
            position: 'average',
          },
        }
      });

      // Trigger an event over top of the
      var pointIndex = 1;
      var datasetIndex = 0;
      var meta = chart.getDatasetMeta(datasetIndex);
      var point = meta.data[pointIndex];
      await jasmine.triggerMouseEvent(chart, 'mousemove', point);

      var tooltipModel = chart.tooltip;
      const activeElements = tooltipModel.getActiveElements();

      const xPositionArray = activeElements.map((element) => element.element.x);
      const xPositionArrayAverage = xPositionArray.reduce((a, b) => a + b) / xPositionArray.length;

      const xPositionSet = new Set(xPositionArray);
      const xPositionSetAverage = [...xPositionSet].reduce((a, b) => a + b) / xPositionSet.size;

      expect(xPositionArray.length).toBe(3);
      expect(xPositionSet.size).toBe(2);
      expect(tooltipModel.caretX).not.toBe(xPositionArrayAverage);
      expect(tooltipModel.caretX).toBe(xPositionSetAverage);
    });
  });

  it('Should avoid tooltip truncation in x axis if there is enough space to show tooltip without truncation', async function() {
    var chart = window.acquireChart({
      type: 'pie',
      data: {
        datasets: [{
          data: [
            50,
            50
          ],
          backgroundColor: [
            'rgb(255, 0, 0)',
            'rgb(0, 255, 0)'
          ],
          label: 'Dataset 1'
        }],
        labels: [
          'Red long tooltip text to avoid unnecessary loop steps',
          'Green long tooltip text to avoid unnecessary loop steps'
        ]
      },
      options: {
        responsive: true,
        animation: {
          // without this slice center point is calculated wrong
          animateRotate: false
        },
        plugins: {
          tooltip: {
            animation: false
          }
        }
      }
    });

    async function testSlice(slice, count) {
      var meta = chart.getDatasetMeta(0);
      var point = meta.data[slice].getCenterPoint();
      var tooltipPosition = meta.data[slice].tooltipPosition();

      async function recursive(left) {
        chart.config.data.labels[slice] = chart.config.data.labels[slice] + 'XX';
        chart.update();

        await jasmine.triggerMouseEvent(chart, 'mouseout', point);
        await jasmine.triggerMouseEvent(chart, 'mousemove', point);
        var tooltip = chart.tooltip;
        expect(tooltip.dataPoints.length).toBe(1);
        expect(tooltip.x).toBeGreaterThanOrEqual(0);
        if (tooltip.width <= chart.width) {
          expect(tooltip.x + tooltip.width).toBeLessThanOrEqual(chart.width);
        }
        expect(tooltip.caretX).toBeCloseToPixel(tooltipPosition.x);
        // if tooltip is longer than chart area then all tests done
        if (left === 0) {
          throw new Error('max iterations reached');
        }
        if (tooltip.width < chart.width) {
          await recursive(left - 1);
        }
      }

      await recursive(count);
    }

    // Trigger an event over top of the slice
    for (var slice = 0; slice < 2; slice++) {
      await testSlice(slice, 20);
    }
  });

  it('Should split newlines into separate lines in user callbacks', async function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)'
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            mode: 'index',
            callbacks: {
              beforeTitle: function() {
                return 'beforeTitle\nnewline';
              },
              title: function() {
                return 'title\nnewline';
              },
              afterTitle: function() {
                return 'afterTitle\nnewline';
              },
              beforeBody: function() {
                return 'beforeBody\nnewline';
              },
              beforeLabel: function() {
                return 'beforeLabel\nnewline';
              },
              label: function() {
                return 'label';
              },
              afterLabel: function() {
                return 'afterLabel\nnewline';
              },
              afterBody: function() {
                return 'afterBody\nnewline';
              },
              beforeFooter: function() {
                return 'beforeFooter\nnewline';
              },
              footer: function() {
                return 'footer\nnewline';
              },
              afterFooter: function() {
                return 'afterFooter\nnewline';
              },
              labelTextColor: function() {
                return 'labelTextColor';
              }
            }
          }
        }
      }
    });

    // Trigger an event over top of the
    var meta = chart.getDatasetMeta(0);
    var point = meta.data[1];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);

    // Check and see if tooltip was displayed
    var tooltip = chart.tooltip;
    var defaults = Chart.defaults;

    expect(tooltip.options.padding).toEqual(6);
    expect(tooltip.xAlign).toEqual('center');
    expect(tooltip.yAlign).toEqual('top');

    expect(tooltip.options.bodyFont).toEqualOptions({
      family: defaults.font.family,
      style: defaults.font.style,
      size: defaults.font.size,
    });

    expect(tooltip.options).toEqualOptions({
      bodyAlign: 'left',
      bodySpacing: 2,
    });

    expect(tooltip.options.titleFont).toEqualOptions({
      family: defaults.font.family,
      weight: 'bold',
      size: defaults.font.size,
    });

    expect(tooltip.options).toEqualOptions({
      titleAlign: 'left',
      titleSpacing: 2,
      titleMarginBottom: 6,
    });

    expect(tooltip.options.footerFont).toEqualOptions({
      family: defaults.font.family,
      weight: 'bold',
      size: defaults.font.size,
    });

    expect(tooltip.options).toEqualOptions({
      footerAlign: 'left',
      footerSpacing: 2,
      footerMarginTop: 6,
    });

    expect(tooltip.options).toEqualOptions({
      // Appearance
      caretSize: 5,
      caretPadding: 2,
      cornerRadius: 6,
      backgroundColor: 'rgba(0,0,0,0.8)',
      multiKeyBackground: '#fff',
    });

    expect(tooltip).toEqualOptions({
      opacity: 1,

      // Text
      title: ['beforeTitle', 'newline', 'title', 'newline', 'afterTitle', 'newline'],
      beforeBody: ['beforeBody', 'newline'],
      body: [{
        before: ['beforeLabel', 'newline'],
        lines: ['label'],
        after: ['afterLabel', 'newline']
      }, {
        before: ['beforeLabel', 'newline'],
        lines: ['label'],
        after: ['afterLabel', 'newline']
      }],
      afterBody: ['afterBody', 'newline'],
      footer: ['beforeFooter', 'newline', 'footer', 'newline', 'afterFooter', 'newline'],
      labelTextColors: ['labelTextColor', 'labelTextColor'],
      labelColors: [{
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor
      }, {
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor
      }]
    });
  });

  describe('text align', function() {
    var defaults = Chart.defaults;
    var makeView = function(title, body, footer) {
      const model = {
        // Positioning
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        xAlign: 'left',
        yAlign: 'top',

        options: {
          setContext: () => model.options,
          enabled: true,

          padding: 5,

          // Body
          bodyFont: {
            family: defaults.font.family,
            style: defaults.font.style,
            size: defaults.font.size,
          },
          bodyColor: '#fff',
          bodyAlign: body,
          bodySpacing: 2,

          // Title
          titleFont: {
            family: defaults.font.family,
            weight: 'bold',
            size: defaults.font.size,
          },
          titleColor: '#fff',
          titleAlign: title,
          titleSpacing: 2,
          titleMarginBottom: 6,

          // Footer
          footerFont: {
            family: defaults.font.family,
            weight: 'bold',
            size: defaults.font.size,
          },
          footerColor: '#fff',
          footerAlign: footer,
          footerSpacing: 2,
          footerMarginTop: 6,

          // Appearance
          caretSize: 5,
          cornerRadius: 6,
          caretPadding: 2,
          borderColor: '#aaa',
          borderWidth: 1,
          backgroundColor: 'rgba(0,0,0,0.8)',
          multiKeyBackground: '#fff',
          displayColors: false

        },
        opacity: 1,

        // Text
        title: ['title'],
        beforeBody: [],
        body: [{
          before: [],
          lines: ['label'],
          after: []
        }],
        afterBody: [],
        footer: ['footer'],
        labelTextColors: ['#fff'],
        labelColors: [{
          borderColor: 'rgb(255, 0, 0)',
          backgroundColor: 'rgb(0, 255, 0)'
        }, {
          borderColor: 'rgb(0, 0, 255)',
          backgroundColor: 'rgb(0, 255, 255)'
        }]
      };
      return model;
    };
    var drawBody = [
      {name: 'save', args: []},
      {name: 'setFillStyle', args: ['rgba(0,0,0,0.8)']},
      {name: 'setStrokeStyle', args: ['#aaa']},
      {name: 'setLineWidth', args: [1]},
      {name: 'beginPath', args: []},
      {name: 'moveTo', args: [106, 100]},
      {name: 'lineTo', args: [106, 100]},
      {name: 'lineTo', args: [111, 95]},
      {name: 'lineTo', args: [116, 100]},
      {name: 'lineTo', args: [194, 100]},
      {name: 'quadraticCurveTo', args: [200, 100, 200, 106]},
      {name: 'lineTo', args: [200, 194]},
      {name: 'quadraticCurveTo', args: [200, 200, 194, 200]},
      {name: 'lineTo', args: [106, 200]},
      {name: 'quadraticCurveTo', args: [100, 200, 100, 194]},
      {name: 'lineTo', args: [100, 106]},
      {name: 'quadraticCurveTo', args: [100, 100, 106, 100]},
      {name: 'closePath', args: []},
      {name: 'fill', args: []},
      {name: 'stroke', args: []}
    ];

    var mockContext = window.createMockContext();
    var tooltip = new Tooltip({
      chart: {
        getContext: () => ({}),
        options: {
          plugins: {
            tooltip: {
              animation: false,
            }
          }
        }
      }
    });

    it('Should go left', function() {
      mockContext.resetCalls();
      Chart.helpers.merge(tooltip, makeView('left', 'left', 'left'));
      tooltip.draw(mockContext);

      expect(mockContext.getCalls()).toEqual(Array.prototype.concat(drawBody, [
        {name: 'setTextAlign', args: ['left']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFont', args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'fillText', args: ['title', 105, 112.2]},
        {name: 'setTextAlign', args: ['left']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFont', args: ["normal 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'fillText', args: ['label', 105, 132.6]},
        {name: 'setTextAlign', args: ['left']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFont', args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'fillText', args: ['footer', 105, 153]},
        {name: 'restore', args: []}
      ]));
    });

    it('Should go right', function() {
      mockContext.resetCalls();
      Chart.helpers.merge(tooltip, makeView('right', 'right', 'right'));
      tooltip.draw(mockContext);

      expect(mockContext.getCalls()).toEqual(Array.prototype.concat(drawBody, [
        {name: 'setTextAlign', args: ['right']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFont', args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'fillText', args: ['title', 195, 112.2]},
        {name: 'setTextAlign', args: ['right']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFont', args: ["normal 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'fillText', args: ['label', 195, 132.6]},
        {name: 'setTextAlign', args: ['right']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFont', args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'fillText', args: ['footer', 195, 153]},
        {name: 'restore', args: []}
      ]));
    });

    it('Should center', function() {
      mockContext.resetCalls();
      Chart.helpers.merge(tooltip, makeView('center', 'center', 'center'));
      tooltip.draw(mockContext);

      expect(mockContext.getCalls()).toEqual(Array.prototype.concat(drawBody, [
        {name: 'setTextAlign', args: ['center']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFont', args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'fillText', args: ['title', 150, 112.2]},
        {name: 'setTextAlign', args: ['center']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFont', args: ["normal 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'fillText', args: ['label', 150, 132.6]},
        {name: 'setTextAlign', args: ['center']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFont', args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'fillText', args: ['footer', 150, 153]},
        {name: 'restore', args: []}
      ]));
    });

    it('Should allow mixed', function() {
      mockContext.resetCalls();
      Chart.helpers.merge(tooltip, makeView('right', 'center', 'left'));
      tooltip.draw(mockContext);

      expect(mockContext.getCalls()).toEqual(Array.prototype.concat(drawBody, [
        {name: 'setTextAlign', args: ['right']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFont', args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'fillText', args: ['title', 195, 112.2]},
        {name: 'setTextAlign', args: ['center']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFont', args: ["normal 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'fillText', args: ['label', 150, 132.6]},
        {name: 'setTextAlign', args: ['left']},
        {name: 'setTextBaseline', args: ['middle']},
        {name: 'setFillStyle', args: ['#fff']},
        {name: 'setFont', args: ["normal bold 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"]},
        {name: 'fillText', args: ['footer', 105, 153]},
        {name: 'restore', args: []}
      ]));
    });
  });

  describe('active elements', function() {
    it('should set the active elements', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        },
      });

      const meta = chart.getDatasetMeta(0);
      chart.tooltip.setActiveElements([{datasetIndex: 0, index: 0}], {x: 0, y: 0});
      expect(chart.tooltip.getActiveElements()[0].element).toBe(meta.data[0]);
    });

    it('should not replace the user set active elements by event replay', async function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        },
        options: {
          events: ['pointerdown', 'pointerup']
        }
      });

      const meta = chart.getDatasetMeta(0);
      const point0 = meta.data[0];
      const point1 = meta.data[1];

      await jasmine.triggerMouseEvent(chart, 'pointerdown', {x: point0.x, y: point0.y});
      expect(chart.tooltip.opacity).toBe(1);
      expect(chart.tooltip.getActiveElements()).toEqual([{datasetIndex: 0, index: 0, element: point0}]);

      chart.tooltip.setActiveElements([{datasetIndex: 0, index: 1}]);
      chart.update();
      expect(chart.tooltip.opacity).toBe(1);
      expect(chart.tooltip.getActiveElements()).toEqual([{datasetIndex: 0, index: 1, element: point1}]);

      chart.tooltip.setActiveElements([]);
      chart.update();
      expect(chart.tooltip.opacity).toBe(0);
      expect(chart.tooltip.getActiveElements().length).toBe(0);
    });

    it('should not change the active elements on events outside chartArea, except for mouseout', async function() {
      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }],
        },
        options: {
          scales: {
            x: {display: false},
            y: {display: false}
          },
          layout: {
            padding: 5
          }
        }
      });

      var point = chart.getDatasetMeta(0).data[0];

      await jasmine.triggerMouseEvent(chart, 'mousemove', {x: point.x, y: point.y});
      expect(chart.tooltip.getActiveElements()).toEqual([{datasetIndex: 0, index: 0, element: point}]);

      await jasmine.triggerMouseEvent(chart, 'mousemove', {x: 1, y: 1});
      expect(chart.tooltip.getActiveElements()).toEqual([{datasetIndex: 0, index: 0, element: point}]);

      await jasmine.triggerMouseEvent(chart, 'mouseout', {x: 1, y: 1});
      expect(chart.tooltip.getActiveElements()).toEqual([]);
    });

    it('should update active elements when datasets are removed and added', async function() {
      var dataset = {
        label: 'Dataset 1',
        data: [10, 20, 30],
        pointHoverBorderColor: 'rgb(255, 0, 0)',
        pointHoverBackgroundColor: 'rgb(0, 255, 0)'
      };
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [dataset],
          labels: ['Point 1', 'Point 2', 'Point 3']
        },
        options: {
          plugins: {
            tooltip: {
              mode: 'nearest',
              intersect: true
            }
          }
        }
      });

      var meta = chart.getDatasetMeta(0);
      var point = meta.data[1];
      var expectedPoint = jasmine.objectContaining({datasetIndex: 0, index: 1});

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);

      expect(chart.tooltip.getActiveElements()).toEqual([expectedPoint]);

      chart.data.datasets = [];
      chart.update();

      expect(chart.tooltip.getActiveElements()).toEqual([]);

      chart.data.datasets = [dataset];
      chart.update();

      expect(chart.tooltip.getActiveElements()).toEqual([expectedPoint]);
    });
  });

  it('should tolerate datasets removed on events outside chartArea', async function() {
    const dataset1 = {
      label: 'Dataset 1',
      data: [10, 20, 30],
    };
    const dataset2 = {
      label: 'Dataset 2',
      data: [10, 25, 35],
    };
    const chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [dataset1, dataset2],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });

    const meta = chart.getDatasetMeta(0);
    const point = meta.data[1];
    const expectedPoints = [jasmine.objectContaining({datasetIndex: 0, index: 1}), jasmine.objectContaining({datasetIndex: 1, index: 1})];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);
    await jasmine.triggerMouseEvent(chart, 'mousemove', {x: chart.chartArea.left - 5, y: point.y});

    expect(chart.tooltip.getActiveElements()).toEqual(expectedPoints);

    chart.data.datasets = [dataset1];
    chart.update();

    await jasmine.triggerMouseEvent(chart, 'mousemove', {x: 2, y: 1});

    expect(chart.tooltip.getActiveElements()).toEqual([expectedPoints[0]]);
  });

  it('should tolerate elements removed on events outside chartArea', async function() {
    const dataset1 = {
      label: 'Dataset 1',
      data: [10, 20, 30],
    };
    const dataset2 = {
      label: 'Dataset 2',
      data: [10, 25, 35],
    };
    const chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [dataset1, dataset2],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });

    const meta = chart.getDatasetMeta(0);
    const point = meta.data[1];
    const expectedPoints = [jasmine.objectContaining({datasetIndex: 0, index: 1}), jasmine.objectContaining({datasetIndex: 1, index: 1})];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);
    await jasmine.triggerMouseEvent(chart, 'mousemove', {x: chart.chartArea.left - 5, y: point.y});

    expect(chart.tooltip.getActiveElements()).toEqual(expectedPoints);

    dataset1.data = dataset1.data.slice(0, 1);
    chart.data.datasets = [dataset1];
    chart.update();

    await jasmine.triggerMouseEvent(chart, 'mousemove', {x: 2, y: 1});

    expect(chart.tooltip.getActiveElements()).toEqual([]);
  });

  describe('events', function() {
    it('should not be called on events not in plugin events array', async function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        },
        options: {
          plugins: {
            tooltip: {
              events: ['click']
            }
          }
        }
      });

      const meta = chart.getDatasetMeta(0);
      const point = meta.data[1];

      await jasmine.triggerMouseEvent(chart, 'mousemove', point);
      expect(chart.tooltip.opacity).toEqual(0);
      await jasmine.triggerMouseEvent(chart, 'click', point);
      expect(chart.tooltip.opacity).toEqual(1);
    });
  });

  it('should use default callback if user callback returns undefined', async() => {
    const chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'Dataset 1',
          data: [10, 20, 30],
          pointHoverBorderColor: 'rgb(255, 0, 0)',
          pointHoverBackgroundColor: 'rgb(0, 255, 0)'
        }, {
          label: 'Dataset 2',
          data: [40, 40, 40],
          pointHoverBorderColor: 'rgb(0, 0, 255)',
          pointHoverBackgroundColor: 'rgb(0, 255, 255)'
        }],
        labels: ['Point 1', 'Point 2', 'Point 3']
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              beforeTitle() {
                return undefined;
              },
              title() {
                return undefined;
              },
              afterTitle() {
                return undefined;
              },
              beforeBody() {
                return undefined;
              },
              beforeLabel() {
                return undefined;
              },
              label() {
                return undefined;
              },
              afterLabel() {
                return undefined;
              },
              afterBody() {
                return undefined;
              },
              beforeFooter() {
                return undefined;
              },
              footer() {
                return undefined;
              },
              afterFooter() {
                return undefined;
              },
              labelTextColor() {
                return undefined;
              },
              labelPointStyle() {
                return undefined;
              }
            }
          }
        }
      }
    });
    const {defaults} = Chart;
    const {tooltip} = chart;
    const point = chart.getDatasetMeta(0).data[0];

    await jasmine.triggerMouseEvent(chart, 'mousemove', point);

    expect(tooltip).toEqual(jasmine.objectContaining({
      opacity: 1,

      // Text
      title: ['Point 1'],
      beforeBody: [],
      body: [{
        before: [],
        lines: ['Dataset 1: 10'],
        after: []
      }],
      afterBody: [],
      footer: [],
      labelTextColors: ['#fff'],
      labelColors: [{
        borderColor: defaults.borderColor,
        backgroundColor: defaults.backgroundColor,
        borderWidth: 1,
        borderDash: undefined,
        borderDashOffset: undefined,
        borderRadius: 0,
      }],
      labelPointStyles: [{
        pointStyle: 'circle',
        rotation: 0
      }]
    }));
  });
});
