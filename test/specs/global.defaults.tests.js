describe('Default Configs', function() {
  describe('Doughnut Chart', function() {
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

      var expectedCommon = {
        fontColor: '#666',
        hidden: false,
        strokeStyle: '#000',
        textAlign: undefined,
        lineWidth: 2,
        pointStyle: undefined,
        lineDash: [],
        lineDashOffset: 0,
        lineJoin: undefined,
        borderRadius: undefined,
      };

      var expected = [{
        text: 'label1',
        fillStyle: 'red',
        index: 0,
        ...expectedCommon,
      }, {
        text: 'label2',
        fillStyle: 'green',
        index: 1,
        ...expectedCommon,
      }, {
        text: 'label3',
        fillStyle: 'blue',
        index: 2,
        ...expectedCommon,
      }];
      expect(chart.legend.legendItems).toEqual(expected);
    });

    it('should return correct legend label objects with border radius', function() {
      var chart = window.acquireChart({
        type: 'doughnut',
        data: {
          labels: ['label1'],
          datasets: [{
            data: [10],
            backgroundColor: ['red'],
            borderWidth: 2,
            borderColor: '#000',
            borderDash: [1, 2, 3],
            borderDashOffset: 1,
            borderJoinStyle: 'miter',
            borderRadius: 3,
          }]
        },
        options: {
          plugins: {
            legend: {
              labels: {
                useBorderRadius: true,
                borderRadius: 5,
                textAlign: 'left',
              }
            }
          }
        }
      });

      var expected = [{
        text: 'label1',
        fillStyle: 'red',
        index: 0,
        fontColor: '#666',
        hidden: false,
        strokeStyle: '#000',
        textAlign: 'left',
        lineWidth: 2,
        pointStyle: undefined,
        lineDash: [1, 2, 3],
        lineDashOffset: 1,
        lineJoin: 'miter',
        borderRadius: 5
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
        fontColor: '#666',
        hidden: false,
        index: 0,
        strokeStyle: '#000',
        textAlign: undefined,
        lineWidth: 2,
        pointStyle: undefined
      }, {
        text: 'label2',
        fillStyle: 'green',
        fontColor: '#666',
        hidden: false,
        index: 1,
        strokeStyle: '#000',
        textAlign: undefined,
        lineWidth: 2,
        pointStyle: undefined
      }, {
        text: 'label3',
        fillStyle: 'blue',
        fontColor: '#666',
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
