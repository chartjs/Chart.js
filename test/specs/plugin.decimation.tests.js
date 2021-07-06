describe('Plugin.decimation', function() {

  describe('auto', jasmine.fixture.specs('plugin.decimation'));

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
  });
});
