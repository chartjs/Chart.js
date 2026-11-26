const noAxisMessage = (id) => `Cannot determine type of '${id}' axis. Please provide 'axis' or 'position' option.`;

function pointsAreFinite(chart, datasetIndex, prop) {
  return chart.getDatasetMeta(datasetIndex).data.every((point) => Number.isFinite(point[prop]));
}

describe('Chart.Config', function() {
  describe('axis of a scale', function() {
    // https://github.com/chartjs/Chart.js/issues/11640
    it('should take the axis of the dataset that binds an id starting with r', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3], yAxisID: 'ramazan'}]
        },
        options: {
          scales: {
            ramazan: {}
          }
        }
      });

      expect(chart.scales.ramazan.axis).toBe('y');
      expect(chart.getDatasetMeta(0).yScale).toBe(chart.scales.ramazan);
      expect(pointsAreFinite(chart, 0, 'y')).toBe(true);
    });

    it('should take the axis of the dataset that binds an id starting with the other axis letter', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3], xAxisID: 'yFoo'}]
        },
        options: {
          scales: {
            yFoo: {}
          }
        }
      });

      expect(chart.scales.yFoo.axis).toBe('x');
      expect(chart.getDatasetMeta(0).xScale).toBe(chart.scales.yFoo);
      expect(pointsAreFinite(chart, 0, 'x')).toBe(true);
    });

    it('should take the radial axis of the dataset that binds it with rAxisID', function() {
      const chart = window.acquireChart({
        type: 'radar',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3], rAxisID: 'foo'}]
        },
        options: {
          scales: {
            foo: {type: 'radialLinear'}
          }
        }
      });

      expect(chart.scales.foo.axis).toBe('r');
      expect(chart.getDatasetMeta(0).rScale).toBe(chart.scales.foo);
      expect(pointsAreFinite(chart, 0, 'x')).toBe(true);
      expect(pointsAreFinite(chart, 0, 'y')).toBe(true);
    });

    it('should fail for an unbound id starting with r whose type is not radial', function() {
      function createChart() {
        return window.acquireChart({
          type: 'line',
          options: {
            scales: {
              ramazan: {type: 'linear'}
            }
          }
        });
      }

      expect(createChart).toThrow(new Error(noAxisMessage('ramazan')));
    });

    it('should make an unbound id starting with x the radial axis when its type is radial', function() {
      const chart = window.acquireChart({
        type: 'radar',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3]}]
        },
        options: {
          scales: {
            xFoo: {type: 'radialLinear'}
          }
        }
      });

      expect(chart.scales.xFoo.axis).toBe('r');
    });

    it('should count a scale type that extends nothing radial as radial when it has getPointPositionForValue', function() {
      class FreeRadialScale extends Chart.Scale {
        static id = 'freeRadial';
        static defaults = {};
        determineDataLimits() {}
        buildTicks() {
          return [];
        }
        getPointPositionForValue() {
          return {x: 0, y: 0, angle: 0};
        }
      }
      Chart.register(FreeRadialScale);

      try {
        const chart = window.acquireChart({
          type: 'line',
          options: {
            scales: {
              r2: {type: 'freeRadial'},
              xFree: {type: 'freeRadial'}
            }
          }
        });

        expect(chart.scales.r2.axis).toBe('r');
        expect(chart.scales.xFree.axis).toBe('r');
      } finally {
        Chart.unregister(FreeRadialScale);
      }
    });

    it('should take the axis that the defaults of a type that is not radial declare', function() {
      class DeclaredYScale extends Chart.LinearScale {
        static id = 'declaredY';
        static defaults = {axis: 'y'};
      }
      class DeclaredXScale extends Chart.LinearScale {
        static id = 'declaredX';
        static defaults = {axis: 'x'};
      }
      Chart.register(DeclaredYScale, DeclaredXScale);

      try {
        const chart = window.acquireChart({
          type: 'line',
          options: {
            scales: {
              ramazan: {type: 'declaredY'},
              rFoo: {type: 'declaredX'}
            }
          }
        });

        expect(chart.scales.ramazan.axis).toBe('y');
        expect(chart.scales.rFoo.axis).toBe('x');
      } finally {
        Chart.unregister(DeclaredYScale, DeclaredXScale);
      }
    });

    it('should take the axis of a position in the defaults of the type', function() {
      class LeftScale extends Chart.LinearScale {
        static id = 'leftByDefault';
        static defaults = {position: 'left'};
      }
      Chart.register(LeftScale);

      try {
        const chart = window.acquireChart({
          type: 'line',
          options: {
            scales: {
              foo: {type: 'leftByDefault'}
            }
          }
        });

        expect(chart.scales.foo.axis).toBe('y');
      } finally {
        Chart.unregister(LeftScale);
      }
    });

    it('should take the radial axis of an rAxisID binding also for a type that is not radial', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3], rAxisID: 'foo'}]
        },
        options: {
          scales: {
            foo: {type: 'linear'}
          }
        }
      });

      expect(chart.options.scales.foo.axis).toBe('r');
    });

    it('should read the first letter of the id in either case', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3]}]
        },
        options: {
          scales: {
            Xfoo: {},
            Yvalue: {}
          }
        }
      });

      expect(chart.scales.Xfoo.axis).toBe('x');
      expect(chart.scales.Yvalue.axis).toBe('y');
    });

    it('should let axis decide before position', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3]}]
        },
        options: {
          scales: {
            foo: {axis: 'x', position: 'left'}
          }
        }
      });

      expect(chart.options.scales.foo.axis).toBe('x');
    });

    it('should decide the axis of a scale added after construction from its binding', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3], yAxisID: 'ramazan2'}]
        }
      });

      chart.options.scales.ramazan2 = {type: 'linear'};
      chart.update();

      expect(chart.scales.ramazan2.axis).toBe('y');
      expect(pointsAreFinite(chart, 0, 'y')).toBe(true);
    });

    it('should fail when an unbound scale added after construction is decided by nothing', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3]}]
        }
      });

      chart.options.scales.rFoo = {type: 'linear'};

      expect(() => chart.update()).toThrow(new Error(noAxisMessage('rFoo')));
    });

    it('should fail with the documented message when nothing decides the axis', function() {
      function createChart() {
        return window.acquireChart({
          type: 'line',
          options: {
            scales: {
              foo: {}
            }
          }
        });
      }

      expect(createChart).toThrow(new Error(noAxisMessage('foo')));
    });

    it('should let axis and position decide, also over the type', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3]}]
        },
        options: {
          scales: {
            ramazan: {axis: 'y', type: 'linear'},
            rTop: {position: 'top', type: 'linear'},
            foo: {axis: 'x'},
            bar: {position: 'right'}
          }
        }
      });

      expect(chart.scales.ramazan.axis).toBe('y');
      expect(chart.scales.rTop.axis).toBe('x');
      expect(chart.scales.foo.axis).toBe('x');
      expect(chart.scales.bar.axis).toBe('y');
    });

    it('should let axis decide for a radial type on an id starting with x', function() {
      const chart = window.acquireChart({
        type: 'radar',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3], rAxisID: 'xFoo'}]
        },
        options: {
          scales: {
            xFoo: {axis: 'r', type: 'radialLinear'}
          }
        }
      });

      expect(chart.scales.xFoo.axis).toBe('r');
    });

    it('should follow the first letter of an unbound id without a type', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3]}]
        },
        options: {
          scales: {
            y2: {},
            xTop: {},
            r2: {}
          }
        }
      });

      expect(chart.scales.y2.axis).toBe('y');
      expect(chart.scales.xTop.axis).toBe('x');
      expect(chart.scales.r2.axis).toBe('r');
    });

    it('should make a bound id starting with r with a cartesian type the axis of the binding', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3], yAxisID: 'ramazan'}]
        },
        options: {
          scales: {
            ramazan: {type: 'linear'}
          }
        }
      });

      expect(chart.scales.ramazan.axis).toBe('y');
    });

    it('should let the first letter decide when the type is registered after construction', async function() {
      class LaterScale extends Chart.LinearScale {
        static id = 'later';
        static defaults = {};
      }

      const canvas = document.createElement('canvas');
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'width: 300px; height: 200px';
      const chart = new Chart(canvas, {
        type: 'line',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            ramazan: {type: 'later'}
          }
        }
      });

      try {
        expect(chart.options.scales.ramazan.axis).toBe('r');

        Chart.register(LaterScale);
        await new Promise((resolve) => {
          window.waitForResize(chart, resolve);
          wrapper.appendChild(canvas);
          document.body.appendChild(wrapper);
        });

        expect(chart.scales.ramazan.axis).toBe('r');
        expect(chart.scales.ramazan.type).toBe('later');
      } finally {
        chart.destroy();
        wrapper.remove();
        Chart.unregister(LaterScale);
      }
    });

    it('should keep the scale vertical when its dataset is rebound from yAxisID to xAxisID', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [{data: [1, 2, 3], yAxisID: 'foo'}]
        },
        options: {
          scales: {
            foo: {}
          }
        }
      });
      expect(chart.scales.foo.axis).toBe('y');

      const dataset = chart.data.datasets[0];
      delete dataset.yAxisID;
      dataset.xAxisID = 'foo';
      chart.update();

      expect(chart.scales.foo.axis).toBe('y');
    });

    // Deciding a first-letter axis again at update is a change of its own.
    it('should keep the first-letter axis of a scale created before the dataset that binds it', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: []
        },
        options: {
          scales: {
            ramazan: {}
          }
        }
      });
      expect(chart.scales.ramazan.axis).toBe('r');

      chart.data.datasets.push({data: [1, 2, 3], yAxisID: 'ramazan'});
      chart.update();

      expect(chart.scales.ramazan.axis).toBe('r');
    });

    it('should put a dataset without yAxisID on the first vertical scale listed, also when a binding made it vertical', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: ['a', 'b', 'c'],
          datasets: [
            {data: [1, 2, 3], yAxisID: 'ramazan'},
            {data: [3, 2, 1]}
          ]
        },
        options: {
          scales: {
            ramazan: {},
            y: {}
          }
        }
      });

      expect(chart.getDatasetMeta(0).yAxisID).toBe('ramazan');
      expect(chart.getDatasetMeta(1).yAxisID).toBe('ramazan');
      expect(pointsAreFinite(chart, 0, 'y')).toBe(true);
      expect(pointsAreFinite(chart, 1, 'y')).toBe(true);
    });
  });
});
