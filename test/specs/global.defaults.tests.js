describe('Default Configs', function() {
  describe('Bubble Chart', function() {
    it('should return correct tooltip strings', function() {
      var chart = window.acquireChart({
        type: 'bubble',
        data: {
          datasets: [{
            label: 'My dataset',
            data: [{
              x: 10,
              y: 12,
              r: 5
            }]
          }]
        },
      });

      // fake out the tooltip hover and force the tooltip to update
      chart.tooltip._active = [{element: chart.getDatasetMeta(0).data[0], datasetIndex: 0, index: 0}];
      chart.tooltip.update();

      // Title is always blank
      expect(chart.tooltip.title).toEqual([]);
      expect(chart.tooltip.body).toEqual([{
        before: [],
        lines: ['My dataset: (10, 12, 5)'],
        after: []
      }]);
    });
  });

  describe('Doughnut Chart', function() {
    it('should return correct tooltip strings', function() {
      var chart = window.acquireChart({
        type: 'doughnut',
        data: {
          labels: ['label1', 'label2', 'label3'],
          datasets: [{
            data: [10, 20, 30],
          }]
        },
      });

      // fake out the tooltip hover and force the tooltip to update
      chart.tooltip._active = [{element: chart.getDatasetMeta(0).data[1], datasetIndex: 0, index: 1}];
      chart.tooltip.update();

      // Title is always blank
      expect(chart.tooltip.title).toEqual([]);
      expect(chart.tooltip.body).toEqual([{
        before: [],
        lines: ['label2: 20'],
        after: []
      }]);
    });

    it('should return correct tooltip string for a multiline label', function() {
      var chart = window.acquireChart({
        type: 'doughnut',
        data: {
          labels: ['label1', ['row1', 'row2', 'row3'], 'label3'],
          datasets: [{
            data: [10, 20, 30],
          }]
        },
      });

      // fake out the tooltip hover and force the tooltip to update
      chart.tooltip._active = [{element: chart.getDatasetMeta(0).data[1], datasetIndex: 0, index: 1}];
      chart.tooltip.update();

      // Title is always blank
      expect(chart.tooltip.title).toEqual([]);
      expect(chart.tooltip.body).toEqual([{
        before: [],
        lines: [
          'row1: 20',
          'row2',
          'row3'
        ],
        after: []
      }]);
    });

    it('should return correct legend label objects', function() {
      var chart = window.acquireChart({
        type: 'doughnut',
        data: {
          labels: ['label1', 'label2', 'label3'],
          datasets: [{
            data: [10, 20, NaN],
            backgroundColor: ['red', 'green', 'blue'],
            borderWidth: 2,
            borderColor: '#000'
          }]
        },
      });

      var expected = [{
        text: 'label1',
        fillStyle: 'red',
        hidden: false,
        index: 0,
        strokeStyle: '#000',
        textAlign: undefined,
        lineWidth: 2,
        pointStyle: undefined
      }, {
        text: 'label2',
        fillStyle: 'green',
        hidden: false,
        index: 1,
        strokeStyle: '#000',
        textAlign: undefined,
        lineWidth: 2,
        pointStyle: undefined
      }, {
        text: 'label3',
        fillStyle: 'blue',
        hidden: false,
        index: 2,
        strokeStyle: '#000',
        textAlign: undefined,
        lineWidth: 2,
        pointStyle: undefined
      }];
      expect(chart.legend.legendItems).toEqual(expected);
    });

    it('should hide the correct arc when a legend item is clicked', function() {
      var config = Chart.overrides.doughnut;
      var chart = window.acquireChart({
        type: 'doughnut',
        data: {
          labels: ['label1', 'label2', 'label3'],
          datasets: [{
            data: [10, 20, NaN],
            backgroundColor: ['red', 'green', 'blue'],
            borderWidth: 2,
            borderColor: '#000'
          }]
        },
      });
      spyOn(chart, 'update').and.callThrough();

      var legendItem = chart.legend.legendItems[0];
      config.plugins.legend.onClick(null, legendItem, chart.legend);

      expect(chart.getDataVisibility(0)).toBe(false);
      expect(chart.update).toHaveBeenCalled();

      config.plugins.legend.onClick(null, legendItem, chart.legend);
      expect(chart.getDataVisibility(0)).toBe(true);
    });
  });

  describe('Polar Area Chart', function() {
    it('should return correct tooltip strings', function() {
      var chart = window.acquireChart({
        type: 'polarArea',
        data: {
          labels: ['label1', 'label2', 'label3'],
          datasets: [{
            data: [10, 20, 30],
          }]
        },
      });

      // fake out the tooltip hover and force the tooltip to update
      chart.tooltip._active = [{element: chart.getDatasetMeta(0).data[1], datasetIndex: 0, index: 1}];
      chart.tooltip.update();

      // Title is always blank
      expect(chart.tooltip.title).toEqual([]);
      expect(chart.tooltip.body).toEqual([{
        before: [],
        lines: ['label2: 20'],
        after: []
      }]);
    });

    it('should return correct legend label objects', function() {
      var chart = window.acquireChart({
        type: 'polarArea',
        data: {
          labels: ['label1', 'label2', 'label3'],
          datasets: [{
            data: [10, 20, NaN],
            backgroundColor: ['red', 'green', 'blue'],
            borderWidth: 2,
            borderColor: '#000'
          }]
        },
      });

      var expected = [{
        text: 'label1',
        fillStyle: 'red',
        hidden: false,
        index: 0,
        strokeStyle: '#000',
        textAlign: undefined,
        lineWidth: 2,
        pointStyle: undefined
      }, {
        text: 'label2',
        fillStyle: 'green',
        hidden: false,
        index: 1,
        strokeStyle: '#000',
        textAlign: undefined,
        lineWidth: 2,
        pointStyle: undefined
      }, {
        text: 'label3',
        fillStyle: 'blue',
        hidden: false,
        index: 2,
        strokeStyle: '#000',
        textAlign: undefined,
        lineWidth: 2,
        pointStyle: undefined
      }];
      expect(chart.legend.legendItems).toEqual(expected);
    });

    it('should hide the correct arc when a legend item is clicked', function() {
      var config = Chart.overrides.polarArea;
      var chart = window.acquireChart({
        type: 'polarArea',
        data: {
          labels: ['label1', 'label2', 'label3'],
          datasets: [{
            data: [10, 20, NaN],
            backgroundColor: ['red', 'green', 'blue'],
            borderWidth: 2,
            borderColor: '#000'
          }]
        },
      });
      spyOn(chart, 'update').and.callThrough();

      var legendItem = chart.legend.legendItems[0];
      config.plugins.legend.onClick(null, legendItem, chart.legend);

      expect(chart.getDataVisibility(0)).toBe(false);
      expect(chart.update).toHaveBeenCalled();

      config.plugins.legend.onClick(null, legendItem, chart.legend);
      expect(chart.getDataVisibility(0)).toBe(true);
    });
  });
});
