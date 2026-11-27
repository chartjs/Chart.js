describe('Plugin.decimation', function() {

  describe('min-max', function() {
    function points(data) {
      const chart = window.acquireChart({
        type: 'line',
        data: {datasets: [{data}]},
        options: {
          parsing: false,
          scales: {x: {type: 'linear'}},
          plugins: {
            decimation: {enabled: true, algorithm: 'min-max', threshold: 2}
          }
        }
      }, {
        canvas: {height: 100, width: 20},
        wrapper: {height: 100, width: 20}
      });
      return chart.data.datasets[0].data;
    }

    function values(data) {
      return points(data).map(point => point.y);
    }

    it('preserves final bucket extrema and endpoint', function() {
      const data = [
        {x: 0, y: 0}, {x: 10, y: 2}, {x: 10, y: 100},
        {x: 10, y: -20}, {x: 10, y: 3}
      ];
      expect(values(data)).toEqual([0, 2, 100, -20, 3]);
    });

    it('preserves extrema when x values are identical', function() {
      const data = [
        {x: 10, y: 0}, {x: 10, y: 3}, {x: 10, y: 40},
        {x: 10, y: -10}, {x: 10, y: 4}
      ];
      expect(values(data)).toEqual([0, 40, -10, 4]);
    });

    it('keeps the first tied extrema in source order', function() {
      const data = [
        {x: 10, y: 0, id: 'start'},
        {x: 10, y: -30, id: 'first-min'},
        {x: 10, y: -30, id: 'second-min'},
        {x: 10, y: 50, id: 'first-max'},
        {x: 10, y: 50, id: 'second-max'},
        {x: 10, y: 5, id: 'end'}
      ];
      const decimated = points(data);

      expect(decimated.map(point => point.id)).toEqual(['start', 'first-min', 'first-max', 'end']);
      expect(decimated[3]).toBe(data[5]);
    });
  });

  describe('lttb', function() {
    const originalData = [
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 2},
      {x: 3, y: 3},
      {x: 4, y: 4},
      {x: 5, y: 5},
      {x: 6, y: 6},
      {x: 7, y: 7},
      {x: 8, y: 8},
      {x: 9, y: 9}];

    it('should draw all element if sample is greater than data based on canvas width', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: originalData,
            label: 'dataset1'
          }]
        },
        scales: {
          x: {
            type: 'linear',
            min: 0,
            max: 9
          }
        },
        options: {
          plugins: {
            decimation: {
              enabled: true,
              algorithm: 'lttb',
              samples: 100
            }
          }
        }
      }, {
        canvas: {
          height: 1,
          width: 1
        },
        wrapper: {
          height: 1,
          width: 1
        }
      });

      expect(chart.data.datasets[0].data.length).toBe(10);
    });

    it('should draw the specified number of elements based on canvas width', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: originalData,
            label: 'dataset1'
          }]
        },
        options: {
          parsing: false,
          scales: {
            x: {
              type: 'linear',
              min: 0,
              max: 9
            }
          },
          plugins: {
            decimation: {
              enabled: true,
              algorithm: 'lttb',
              samples: 7
            }
          }
        }
      }, {
        canvas: {
          height: 1,
          width: 1
        },
        wrapper: {
          height: 1,
          width: 1
        }
      });

      expect(chart.data.datasets[0].data.length).toBe(7);
    });

    it('should draw the specified number of elements based on threshold', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: originalData,
            label: 'dataset1'
          }]
        },
        options: {
          parsing: false,
          scales: {
            x: {
              type: 'linear'
            }
          },
          plugins: {
            decimation: {
              enabled: true,
              algorithm: 'lttb',
              samples: 5,
              threshold: 7
            }
          }
        }
      }, {
        canvas: {
          height: 100,
          width: 100
        },
        wrapper: {
          height: 100,
          width: 100
        }
      });

      expect(chart.data.datasets[0].data.length).toBe(5);
    });

    it('should draw all element only in range', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            data: originalData,
            label: 'dataset1'
          }]
        },
        options: {
          parsing: false,
          scales: {
            x: {
              type: 'linear',
              min: 3,
              max: 6
            }
          },
          plugins: {
            decimation: {
              enabled: true,
              algorithm: 'lttb',
              samples: 7
            }
          }
        }
      }, {
        canvas: {
          height: 1,
          width: 1
        },
        wrapper: {
          height: 1,
          width: 1
        }
      });

      // Data range is 4 (3->6) and the first point is added
      const expectedPoints = 5;
      expect(chart.data.datasets[0].data.length).toBe(expectedPoints);
      expect(chart.data.datasets[0].data[0].x).toBe(originalData[2].x);
      expect(chart.data.datasets[0].data[1].x).toBe(originalData[3].x);
      expect(chart.data.datasets[0].data[2].x).toBe(originalData[4].x);
      expect(chart.data.datasets[0].data[3].x).toBe(originalData[5].x);
      expect(chart.data.datasets[0].data[4].x).toBe(originalData[6].x);
    });

    it('should not crash with uneven points', function() {
      const data = [];
      for (let i = 0; i < 15552; i++) {
        data.push({x: i, y: i});
      }

      function createChart() {
        return window.acquireChart({
          type: 'line',
          data: {
            datasets: [{
              data
            }]
          },
          options: {
            devicePixelRatio: 1.25,
            parsing: false,
            scales: {
              x: {
                type: 'linear'
              }
            },
            plugins: {
              decimation: {
                enabled: true,
                algorithm: 'lttb'
              }
            }
          }
        }, {
          canvas: {width: 511, height: 511},
        });
      }
      expect(createChart).not.toThrow();
    });

    function decimatedConfig(dataset) {
      return {
        type: 'line',
        data: {
          datasets: [dataset]
        },
        options: {
          parsing: false,
          scales: {
            x: {
              type: 'linear'
            }
          },
          plugins: {
            decimation: {
              enabled: true,
              algorithm: 'lttb',
              samples: 5,
              threshold: 7
            }
          }
        }
      };
    }

    it('should leave a frozen dataset undecimated', function() {
      const dataset = Object.freeze({data: originalData, label: 'dataset1'});
      let chart;

      expect(function() {
        chart = window.acquireChart(decimatedConfig(dataset));
      }).not.toThrow();
      expect(chart.getDatasetMeta(0).data.length).toBe(10);
    });

    it('should leave a sealed dataset undecimated', function() {
      const dataset = Object.seal({data: originalData, label: 'dataset1'});
      let chart;

      expect(function() {
        chart = window.acquireChart(decimatedConfig(dataset));
      }).not.toThrow();
      expect(chart.getDatasetMeta(0).data.length).toBe(10);
    });

    it('should not throw on destroy for a dataset frozen after decimation', function() {
      const dataset = {data: originalData, label: 'dataset1'};
      const chart = window.acquireChart(decimatedConfig(dataset));

      expect(dataset.data.length).toBe(5);
      Object.freeze(dataset);

      expect(function() {
        chart.destroy();
      }).not.toThrow();
    });

    it('should restore the original data when the chart is destroyed', function() {
      const dataset = {data: originalData, label: 'dataset1'};
      const chart = window.acquireChart(decimatedConfig(dataset));

      expect(dataset.data.length).toBe(5);

      chart.destroy();

      expect(dataset.data).toBe(originalData);
      expect(dataset._data).toBeUndefined();
      expect(dataset._decimated).toBeUndefined();
    });

    it('should restore the original data when decimation is turned off', function() {
      const dataset = {data: originalData, label: 'dataset1'};
      const chart = window.acquireChart(decimatedConfig(dataset));

      expect(dataset.data.length).toBe(5);

      chart.options.plugins.decimation = false;
      chart.update();

      expect(dataset.data).toBe(originalData);
      expect(dataset._data).toBeUndefined();
      expect(dataset._decimated).toBeUndefined();
    });
  });
});
