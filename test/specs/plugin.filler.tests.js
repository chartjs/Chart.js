describe('Plugin.filler', function() {
  const fillerPluginRegisterWarning = 'Tried to use the \'fill\' option without the \'Filler\' plugin enabled. Please import and register the \'Filler\' plugin and make sure it is not disabled in the options';
  function decodedFillValues(chart) {
    return chart.data.datasets.map(function(dataset, index) {
      var meta = chart.getDatasetMeta(index) || {};
      expect(meta.$filler).toBeDefined();
      return meta.$filler.fill;
    });
  }

  describe('auto', jasmine.fixture.specs('plugin.filler'));

  describe('dataset.fill', function() {
    it('Should show a warning when trying to use the filler plugin in the dataset when it\'s not registered', function() {
      spyOn(console, 'warn');
      Chart.unregister(Chart.Filler);
      window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            fill: true
          }]
        }
      });

      expect(console.warn).toHaveBeenCalledWith(fillerPluginRegisterWarning);

      Chart.register(Chart.Filler);
    });

    it('Should show a warning when trying to use the filler plugin in the root options when it\'s not registered', function() {
      // jasmine.createSpy('warn');
      spyOn(console, 'warn');
      Chart.unregister(Chart.Filler);
      window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
          }]
        },
        options: {
          fill: true
        }
      });

      expect(console.warn).toHaveBeenCalledWith(fillerPluginRegisterWarning);

      Chart.register(Chart.Filler);
    });

    it('should support boundaries', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [
            {fill: 'origin'},
            {fill: 'start'},
            {fill: 'end'},
          ]
        }
      });

      expect(decodedFillValues(chart)).toEqual(['origin', 'start', 'end']);
    });

    it('should support absolute dataset index', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [
            {fill: 1},
            {fill: 3},
            {fill: 0},
            {fill: 2},
          ]
        }
      });

      expect(decodedFillValues(chart)).toEqual([1, 3, 0, 2]);
    });

    it('should support relative dataset index', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [
            {fill: '+3'},
            {fill: '-1'},
            {fill: '+1'},
            {fill: '-2'},
          ]
        }
      });

      expect(decodedFillValues(chart)).toEqual([
        3, // 0 + 3
        0, // 1 - 1
        3, // 2 + 1
        1, // 3 - 2
      ]);
    });

    it('should handle default fill when true (origin)', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [
            {fill: true},
            {fill: false},
          ]
        }
      });

      expect(decodedFillValues(chart)).toEqual(['origin', false]);
    });

    it('should ignore self dataset index', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [
            {fill: 0},
            {fill: '-0'},
            {fill: '+0'},
            {fill: 3},
          ]
        }
      });

      expect(decodedFillValues(chart)).toEqual([
        false, // 0 === 0
        false, // 1 === 1 - 0
        false, // 2 === 2 + 0
        false, // 3 === 3
      ]);
    });

    it('should ignore out of bounds dataset index', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [
            {fill: -2},
            {fill: 4},
            {fill: '-3'},
            {fill: '+1'},
          ]
        }
      });

      expect(decodedFillValues(chart)).toEqual([
        false, // 0 - 2 < 0
        false, // 1 + 4 > 3
        false, // 2 - 3 < 0
        false, // 3 + 1 > 3
      ]);
    });

    it('should ignore invalid values', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [
            {fill: 'foo'},
            {fill: '+foo'},
            {fill: '-foo'},
            {fill: '+1.1'},
            {fill: '-2.2'},
            {fill: 3.3},
            {fill: -4.4},
            {fill: NaN},
            {fill: Infinity},
            {fill: ''},
            {fill: null},
            {fill: []},
          ]
        }
      });

      expect(decodedFillValues(chart)).toEqual([
        false, // NaN (string)
        false, // NaN (string)
        false, // NaN (string)
        false, // float (string)
        false, // float (string)
        false, // float (number)
        false, // float (number)
        false, // NaN
        false, // !isFinite
        false, // empty string
        false, // null
        false, // array
      ]);
    });
  });

  describe('options.plugins.filler.propagate', function() {
    it('should compute propagated fill targets if true', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [
            {fill: 'start', hidden: true},
            {fill: '-1', hidden: true},
            {fill: 1, hidden: true},
            {fill: '-2', hidden: true},
            {fill: '+1'},
            {fill: '+2'},
            {fill: '-1'},
            {fill: 'end', hidden: true},
          ]
        },
        options: {
          plugins: {
            filler: {
              propagate: true
            }
          }
        }
      });


      expect(decodedFillValues(chart)).toEqual([
        'start', // 'start'
        'start', // 1 - 1 -> 0 (hidden) -> 'start'
        'start', // 1 (hidden) -> 0 (hidden) -> 'start'
        'start', // 3 - 2 -> 1 (hidden) -> 0 (hidden) -> 'start'
        5,       // 4 + 1
        'end',   // 5 + 2 -> 7 (hidden) -> 'end'
        5,       // 6 - 1 -> 5
        'end',   // 'end'
      ]);
    });

    it('should preserve initial fill targets if false', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [
            {fill: 'start', hidden: true},
            {fill: '-1', hidden: true},
            {fill: 1, hidden: true},
            {fill: '-2', hidden: true},
            {fill: '+1'},
            {fill: '+2'},
            {fill: '-1'},
            {fill: 'end', hidden: true},
          ]
        },
        options: {
          plugins: {
            filler: {
              propagate: false
            }
          }
        }
      });

      expect(decodedFillValues(chart)).toEqual([
        'start', // 'origin'
        0,       // 1 - 1
        1,       // 1
        1,       // 3 - 2
        5,       // 4 + 1
        7,       // 5 + 2
        5,       // 6 - 1
        'end',   // 'end'
      ]);
    });

    it('should prevent recursive propagation', function() {
      var chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [
            {fill: '+2', hidden: true},
            {fill: '-1', hidden: true},
            {fill: '-1', hidden: true},
            {fill: '-2'}
          ]
        },
        options: {
          plugins: {
            filler: {
              propagate: true
            }
          }
        }
      });

      expect(decodedFillValues(chart)).toEqual([
        false, // 0 + 2 -> 2 (hidden) -> 1 (hidden) -> 0 (loop)
        false, // 1 - 1 -> 0 (hidden) -> 2 (hidden) -> 1 (loop)
        false, // 2 - 1 -> 1 (hidden) -> 0 (hidden) -> 2 (loop)
        false, // 3 - 2 -> 1 (hidden) -> 0 (hidden) -> 2 (hidden) -> 1 (loop)
      ]);
    });
  });
});


describe('Filler scale boundaries', function() {
  ['x', 'y'].forEach(function(indexAxis) {
    [false, true].forEach(function(reverse) {
      ['start', 'end'].forEach(function(fill) {
        ['beforeDraw', 'beforeDatasetsDraw', 'beforeDatasetDraw'].forEach(function(drawTime) {
          it('fills the ' + fill + ' boundary for ' + [indexAxis, reverse, drawTime].join(', '), function() {
            var valueAxis = indexAxis === 'x' ? 'y' : 'x';
            var chart = window.acquireChart({
              type: 'line',
              data: {labels: ['A', 'B'], datasets: [{data: [5, 5], fill, backgroundColor: 'blue', borderWidth: 0, pointRadius: 0}]},
              options: {
                indexAxis,
                animation: false,
                layout: {padding: {left: 100, right: 20, top: 30, bottom: 170}},
                plugins: {legend: false, filler: {drawTime}},
                scales: {
                  x: {display: false},
                  y: {display: false},
                  [valueAxis]: {display: false, reverse, min: 0, max: 10}
                }
              }
            });
            function pixel(fraction) {
              var a = chart.chartArea;
              var x = a.left + a.width * (valueAxis === 'x' ? fraction : 0.5);
              var y = a.top + a.height * (valueAxis === 'y' ? fraction : 0.5);
              return Array.from(chart.ctx.getImageData(x, y, 1, 1).data);
            }
            var startFraction = valueAxis === 'x' ? 0.2 : 0.8;
            var filled = fill === 'start' ? startFraction : 1 - startFraction;
            expect(pixel(filled)).toEqual([0, 0, 255, 255]);
            expect(pixel(1 - filled)[3]).toEqual(0);
            chart.update();
            expect(pixel(filled)).toEqual([0, 0, 255, 255]);
          });
        });
      });
    });
  });
});


describe('Filler value boundary controls', function() {
  ['x', 'y'].forEach(function(indexAxis) {
    [false, true].forEach(function(reverse) {
      ['origin', {value: 0}].forEach(function(fill) {
        it('keeps value targets for ' + [indexAxis, reverse, JSON.stringify(fill)].join(', '), function() {
          var valueAxis = indexAxis === 'x' ? 'y' : 'x';
          var chart = window.acquireChart({
            type: 'line',
            data: {labels: ['A', 'B'], datasets: [{data: [5, 5], fill, backgroundColor: 'blue', borderWidth: 0, pointRadius: 0}]},
            options: {
              indexAxis,
              animation: false,
              layout: {padding: {left: 100, right: 20, top: 30, bottom: 170}},
              plugins: {legend: false},
              scales: {
                x: {display: false},
                y: {display: false},
                [valueAxis]: {display: false, reverse, min: 0, max: 10}
              }
            }
          });
          var a = chart.chartArea;
          var valuePixel = chart.scales[valueAxis].getPixelForValue(2);
          var x = valueAxis === 'x' ? valuePixel : a.left + a.width / 2;
          var y = valueAxis === 'y' ? valuePixel : a.top + a.height / 2;
          expect(Array.from(chart.ctx.getImageData(x, y, 1, 1).data)).toEqual([0, 0, 255, 255]);
        });
      });
    });
  });
});
