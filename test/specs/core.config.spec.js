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

  // Guards for the scale merge (`mergeScaleConfig`): every scale option that
  // a default, an override or the chart gives, read by name through the
  // scale's options, with the scale's bounds, after the chart is created and
  // after each of two updates. The snapshot holds what master resolves; the
  // point pixels depend on the fonts of the machine, so they are only compared
  // between the three reads.
  describe('resolved scale options', function() {
    const labels = ['a', 'b', 'c', 'd'];
    const values = [10, 20, 15, 30];
    const points = [{x: 1, y: 2}, {x: 3, y: 5}, {x: 4, y: 1}, {x: 6, y: 4}];
    const configurations = {
      line: () => ({
        type: 'line',
        data: {labels, datasets: [{data: values}]}
      }),
      bar: () => ({
        type: 'bar',
        data: {labels, datasets: [{data: values}]}
      }),
      'horizontal bar': () => ({
        type: 'bar',
        data: {labels, datasets: [{data: values}]},
        options: {indexAxis: 'y'}
      }),
      stacked: () => ({
        type: 'bar',
        data: {labels, datasets: [{data: values}, {data: values}]},
        options: {scales: {x: {stacked: true}, y: {stacked: true}}}
      }),
      scatter: () => ({
        type: 'scatter',
        data: {datasets: [{data: points}]}
      }),
      bubble: () => ({
        type: 'bubble',
        data: {datasets: [{data: points.map((p) => ({...p, r: 5}))}]}
      }),
      radar: () => ({
        type: 'radar',
        data: {labels, datasets: [{data: values}]}
      }),
      'polar area': () => ({
        type: 'polarArea',
        data: {labels, datasets: [{data: values}]}
      }),
      doughnut: () => ({
        type: 'doughnut',
        data: {labels, datasets: [{data: values}]}
      }),
      'bar chart with a line dataset first': () => ({
        type: 'bar',
        data: {labels, datasets: [{type: 'line', data: values}, {data: values}]}
      }),
      'line chart with a bar dataset first': () => ({
        type: 'line',
        data: {labels, datasets: [{type: 'bar', data: values}, {data: values}]}
      }),
      // The chart type's x is a category scale, the dataset type's linear.
      'line chart with a scatter dataset and an x without a type': () => ({
        type: 'line',
        data: {labels, datasets: [{type: 'scatter', data: points}]},
        options: {scales: {x: {}}}
      }),
      'multi-axis': () => ({
        type: 'line',
        data: {labels, datasets: [{data: values, yAxisID: 'y'}, {data: values, yAxisID: 'y1'}]},
        options: {
          scales: {
            y: {position: 'left'},
            y1: {position: 'right', grid: {drawOnChartArea: false}}
          }
        }
      }),
      'second axis only a dataset names': () => ({
        type: 'bar',
        data: {labels, datasets: [{data: values}, {type: 'line', data: values, yAxisID: 'y1'}]}
      }),
      logarithmic: () => ({
        type: 'line',
        data: {labels, datasets: [{data: values}]},
        options: {scales: {y: {type: 'logarithmic'}}}
      }),
      'linear x': () => ({
        type: 'line',
        data: {datasets: [{data: points}]},
        options: {scales: {x: {type: 'linear'}}}
      }),
      'extra axes no dataset binds': () => ({
        type: 'line',
        data: {labels, datasets: [{data: values}]},
        options: {scales: {y2: {position: 'right'}, x2: {axis: 'x'}}}
      }),
      time: () => ({
        type: 'line',
        data: {labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04'], datasets: [{data: values}]},
        options: {scales: {x: {type: 'time', time: {unit: 'day'}}}}
      }),
      'options the chart sets': () => ({
        type: 'bar',
        data: {labels, datasets: [{data: values}]},
        options: {
          scales: {
            x: {offset: false, grid: {color: 'red', offset: true}, ticks: {color: 'blue'}},
            y: {beginAtZero: false, max: 40, title: {display: true, text: 'value'}}
          }
        }
      }),
      scriptable: () => ({
        type: 'line',
        data: {labels, datasets: [{data: values}]},
        options: {
          scales: {
            y: {
              grid: {color: (ctx) => (ctx.type === 'scale' ? 'green' : 'gray')},
              ticks: {color: (ctx) => (ctx.scale.id === 'y' ? 'orange' : 'black')}
            }
          }
        }
      })
    };

    const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

    function serialize(value) {
      if (typeof value === 'function') {
        return `[Function ${value.name || 'anonymous'}]`;
      }
      if (Array.isArray(value)) {
        return value.map(serialize);
      }
      if (value !== null && typeof value === 'object') {
        return '[Object]';
      }
      return value;
    }

    // Options that no default names but the merge or the chart sets.
    const mergedKeys = {axis: true, id: true, position: true, stacked: true, weight: true};

    // The objects whose keys name the options to read for one scale: the
    // scale defaults, the overrides of the chart's and the datasets' types, and
    // what the chart gave. Read by these names, the result does not depend on
    // which keys the chart's stored scale options hold.
    function keySources(config, scaleType, userScale) {
      const types = new Set([config.type, ...config.data.datasets.map((d) => d.type).filter(Boolean)]);
      const sources = [mergedKeys, Chart.defaults.scale, Chart.defaults.scales[scaleType] || {}, userScale || {}];
      types.forEach((type) => {
        Object.values((Chart.overrides[type] || {}).scales || {}).forEach((scale) => sources.push(scale));
      });
      return sources;
    }

    function readOptions(resolver, sources, prefix, out) {
      const keys = new Set();
      sources.forEach((source) => Object.keys(source).forEach((key) => key.startsWith('_') || keys.add(key)));
      Array.from(keys).sort().forEach((key) => {
        const nested = sources.map((source) => source[key]).filter(isPlainObject);
        if (nested.length) {
          readOptions(resolver[key], nested, `${prefix}${key}.`, out);
        } else {
          out[prefix + key] = serialize(resolver[key]);
        }
      });
      return out;
    }

    function firstPointPixel(chart) {
      const element = chart.getDatasetMeta(0).data[0];
      return element && {x: element.x, y: element.y};
    }

    function readScales(chart, config) {
      const scales = {};
      Object.keys(chart.scales).sort().forEach((id) => {
        const scale = chart.scales[id];
        const userScale = ((config.options || {}).scales || {})[id];
        scales[id] = {
          min: scale.min,
          max: scale.max,
          options: readOptions(scale.options, keySources(config, scale.type, userScale), '', {})
        };
      });
      return scales;
    }

    // No built-in chart type has scale overrides under both names.
    it('should prefer the overrides of the axis to those of _index_ and _value_', function() {
      class AxisOverridesController extends Chart.LineController {
        static id = 'axisOverrides';
        static overrides = {
          scales: {
            x: {offset: true},
            _index_: {type: 'category', offset: false, reverse: true},
            y: {beginAtZero: true},
            _value_: {type: 'linear', beginAtZero: false, reverse: true}
          }
        };
      }
      Chart.register(AxisOverridesController);
      try {
        const chart = window.acquireChart({
          type: 'axisOverrides',
          data: {labels, datasets: [{data: values}]},
          options: {scales: {x: {}, y: {}}}
        });

        for (let i = 0; i < 2; i++) {
          expect(chart.scales.x.options.offset).toBe(true);
          expect(chart.scales.x.options.reverse).toBe(true);
          expect(chart.scales.y.options.beginAtZero).toBe(true);
          expect(chart.scales.y.options.reverse).toBe(true);
          chart.update();
        }
      } finally {
        Chart.unregister(AxisOverridesController);
      }
    });

    Object.keys(configurations).forEach((name) => {
      it(`should resolve the scale options of the "${name}" configuration, also after updates`, function() {
        const chart = window.acquireChart(configurations[name]());
        const config = configurations[name]();
        const created = readScales(chart, config);
        const pixel = firstPointPixel(chart);

        chart.update();
        expect(readScales(chart, config)).toEqual(created);
        expect(firstPointPixel(chart)).toEqual(pixel);

        chart.update();
        expect(readScales(chart, config)).toEqual(created);
        expect(firstPointPixel(chart)).toEqual(pixel);

        expect(created).toMatchSnapshot();
      });
    });
  });

  // What the scale merge keeps apart: the record of each stored entry and the
  // derived object of the defaults a scale takes.
  describe('stored and derived scale options', function() {
    const impliedScaleConfig = () => ({
      type: 'bar',
      data: {
        labels: ['a', 'b', 'c'],
        datasets: [{data: [10, 11, 12]}, {type: 'line', data: [10, 11, 12], yAxisID: 'y1'}]
      },
      options: {scales: {y: {min: 5}}}
    });
    const record = (chart, id) => chart.config._scaleRecords.get(chart.config.options.scales[id]);

    it('should record which entries only a dataset implies, also after updates', function() {
      const chart = window.acquireChart(impliedScaleConfig());

      expect(record(chart, 'x')).toEqual({implied: true});
      expect(record(chart, 'y')).toEqual({implied: false});
      expect(record(chart, 'y1')).toEqual({implied: true});

      const y1Record = record(chart, 'y1');
      chart.update();
      chart.update();

      expect(record(chart, 'x')).toEqual({implied: true});
      expect(record(chart, 'y')).toEqual({implied: false});
      expect(record(chart, 'y1')).toBe(y1Record);
    });

    it('should keep the record of an implied entry when its dataset is removed', function() {
      const chart = window.acquireChart(impliedScaleConfig());

      chart.data.datasets.pop();
      chart.update();

      expect(chart.scales.y1).toBeDefined();
      expect(record(chart, 'y1')).toEqual({implied: true});
    });

    it('should count an entry the chart replaces as given', function() {
      const chart = window.acquireChart(impliedScaleConfig());

      chart.options.scales.y1 = {};
      chart.update();

      expect(record(chart, 'y1')).toEqual({implied: false});
    });

    it('should count every entry as given after the chart options are replaced', function() {
      const chart = window.acquireChart(impliedScaleConfig());

      chart.options = {scales: {y1: {}}};
      chart.update();

      expect(record(chart, 'y1')).toEqual({implied: false});
    });

    // The keys of the derived object of one scale: those of its sources.
    const keysOf = (...sources) => Array.from(new Set(sources.flatMap((source) => Object.keys(source)))).sort();

    it('should derive the defaults of the chart and dataset types for each scale', function() {
      const chart = window.acquireChart(impliedScaleConfig());
      const derived = chart.config._derivedOptions.scales;

      expect(Object.keys(derived).sort()).toEqual(['x', 'y', 'y1']);
      expect(derived.x.type).toBe('category');
      expect(derived.x.offset).toBe(true);
      expect(derived.y.beginAtZero).toBe(true);
      expect(derived.y1.type).toBe('linear');
      expect(derived.y1.ticks.callback).toBe(Chart.defaults.scales.linear.ticks.callback);
      expect(chart.config.options.scales.y1.beginAtZero).toBe(false);
    });

    it('should derive for a given scale the chart type, dataset type and scale type defaults, not defaults.scale', function() {
      const chart = window.acquireChart({
        type: 'bar',
        data: {labels: ['a', 'b', 'c'], datasets: [{type: 'line', data: [10, 11, 12]}]},
        options: {scales: {y: {}}}
      });
      const {bar, line} = Chart.overrides;

      for (let i = 0; i < 2; i++) {
        const derived = chart.config._derivedOptions.scales.y;
        expect(Object.keys(derived).sort()).toEqual(
          keysOf(bar.scales._value_, line.scales._value_, Chart.defaults.scales.linear)
        );
        expect(derived.beginAtZero).toBe(true);
        expect(derived.ticks.callback).toBe(Chart.defaults.scales.linear.ticks.callback);
        expect(derived.grid).toBeUndefined();
        expect(derived.display).toBeUndefined();
        expect(chart.config.options.scales.y.display).toBe(true);
        expect(chart.config.options.scales.y.grid.color).toBe(Chart.defaults.scale.grid.color);
        chart.update();
      }
    });

    it('should derive for an implied scale the dataset type defaults only, also after updates', function() {
      const chart = window.acquireChart(impliedScaleConfig());
      const {line} = Chart.overrides;

      for (let i = 0; i < 3; i++) {
        const derived = chart.config._derivedOptions.scales.y1;
        expect(Object.keys(derived).sort()).toEqual(keysOf(line.scales._value_, Chart.defaults.scales.linear));
        expect(derived.beginAtZero).toBeUndefined();
        expect(chart.config.options.scales.y1.beginAtZero).toBe(false);
        chart.update();
      }
    });

    it('should derive defaults only, not what the chart or the merge sets', function() {
      const chart = window.acquireChart(impliedScaleConfig());
      const derived = chart.config._derivedOptions.scales;

      chart.update();

      ['x', 'y', 'y1'].forEach((id) => {
        expect(Object.keys(chart.config._derivedOptions.scales[id])).not.toContain('axis');
        expect(Object.keys(chart.config._derivedOptions.scales[id])).not.toContain('id');
        expect(Object.keys(chart.config._derivedOptions.scales[id])).not.toContain('position');
      });
      expect(Object.keys(derived.y)).not.toContain('min');
      expect(chart.config.options.scales.y.min).toBe(5);
    });

    it('should rebuild the derived object at every update', function() {
      const chart = window.acquireChart(impliedScaleConfig());
      const derived = chart.config._derivedOptions;

      chart.update();

      expect(chart.config._derivedOptions).not.toBe(derived);
      expect(chart.config._derivedOptions).toEqual(derived);
    });

    it('should follow a changed chart type at update', function() {
      const chart = window.acquireChart({
        type: 'bar',
        data: {labels: ['a', 'b', 'c'], datasets: [{data: [10, 11, 12]}]},
        options: {scales: {x: {}, y: {}}}
      });
      expect(chart.config._derivedOptions.scales.x.offset).toBe(true);
      expect(chart.config._derivedOptions.scales.y.beginAtZero).toBe(true);

      chart.config.type = 'line';
      chart.update();

      expect(chart.config._derivedOptions.scales.x.offset).toBeUndefined();
      expect(chart.config._derivedOptions.scales.y.beginAtZero).toBeUndefined();
    });

    it('should follow a changed dataset type at update', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {labels: ['a', 'b', 'c'], datasets: [{data: [10, 11, 12]}]}
      });
      expect(chart.config._derivedOptions.scales.y.beginAtZero).toBeUndefined();

      chart.data.datasets[0].type = 'bar';
      chart.update();

      expect(chart.config._derivedOptions.scales.x.offset).toBe(true);
      expect(chart.config._derivedOptions.scales.y.beginAtZero).toBe(true);
    });

    it('should hold clones, so that a write through the options reaches no defaults', function() {
      const chart = window.acquireChart(impliedScaleConfig());
      const derived = chart.config._derivedOptions.scales;
      const defaultColor = Chart.defaults.scale.grid.color;
      const linearTicks = Chart.defaults.scales.linear.ticks;
      const callback = linearTicks.callback;

      expect(derived.x.grid).not.toBe(Chart.overrides.bar.scales._index_.grid);
      expect(derived.x.grid).not.toBe(chart.config.options.scales.x.grid);
      expect(derived.y.ticks).not.toBe(linearTicks);
      expect(derived.y.ticks).not.toBe(chart.config.options.scales.y.ticks);

      chart.options.scales.y.grid.color = 'red';
      chart.options.scales.y.title.padding.top = 20;
      chart.options.scales.x.grid.offset = false;
      chart.options.scales.y.ticks.callback = () => '';

      expect(chart.config.options.scales.y.grid.color).toBe('red');
      expect(Chart.defaults.scale.grid.color).toBe(defaultColor);
      expect(Chart.defaults.scale.title.padding.top).toBe(4);
      expect(Chart.overrides.bar.scales._index_.grid.offset).toBe(true);
      expect(derived.x.grid.offset).toBe(true);
      expect(linearTicks.callback).toBe(callback);
      expect(derived.y.ticks.callback).toBe(callback);

      chart.update();

      expect(chart.config._derivedOptions.scales.x.grid.offset).toBe(true);
      expect(chart.config.options.scales.y.grid.color).toBe('red');
    });
  });

  // The chart-building tests of helpers._isRadialScale; the others are in
  // test/specs/helpers.core.unit.spec.js, which runs in Node.
  describe('_isRadialScale', function() {
    const helpers = Chart.helpers;

    it('should be true for a radial scale and its prototype', function() {
      const chart = window.acquireChart({
        type: 'radar',
        data: {labels: ['a', 'b', 'c'], datasets: [{data: [1, 2, 3]}]}
      });

      expect(helpers._isRadialScale(chart.scales.r)).toBe(true);
      expect(helpers._isRadialScale(Chart.RadialLinearScale.prototype)).toBe(true);
    });

    it('should be false for a cartesian scale and its prototype', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {labels: ['a', 'b', 'c'], datasets: [{data: [1, 2, 3]}]}
      });

      expect(helpers._isRadialScale(chart.scales.y)).toBe(false);
      expect(helpers._isRadialScale(Chart.LinearScale.prototype)).toBe(false);
      expect(helpers._isRadialScale(Chart.CategoryScale.prototype)).toBe(false);
    });
  });
});
