describe('Core.Interaction', function() {
  describe('point mode', function() {
    let chart;

    beforeEach(function() {
      chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)'
          }, {
            label: 'Dataset 2',
            data: [40, 20, 40],
            pointHoverBorderColor: 'rgb(0, 0, 255)',
            pointHoverBackgroundColor: 'rgb(0, 255, 255)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        }
      });
    });

    it ('should return all items under the point', function() {
      var meta0 = chart.getDatasetMeta(0);
      var meta1 = chart.getDatasetMeta(1);
      var point = meta0.data[1];

      var evt = {
        type: 'click',
        chart: chart,
        native: true, // needed otherwise things its a DOM event
        x: point.x,
        y: point.y,
      };

      var elements = Chart.Interaction.modes.point(chart, evt, {}).map(item => item.element);
      expect(elements).toEqual([point, meta1.data[1]]);
    });

    it ('should return an empty array when no items are found', function() {
      var evt = {
        type: 'click',
        chart: chart,
        native: true, // needed otherwise things its a DOM event
        x: 0,
        y: 0
      };

      var elements = Chart.Interaction.modes.point(chart, evt, {}).map(item => item.element);
      expect(elements).toEqual([]);
    });
  });

  describe('index mode', function() {
    describe('intersect: true', function() {
      let chart;

      beforeEach(function() {
        chart = window.acquireChart({
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
          }
        });
      });

      it ('gets correct items', function() {
        var meta0 = chart.getDatasetMeta(0);
        var meta1 = chart.getDatasetMeta(1);
        var point = meta0.data[1];

        var evt = {
          type: 'click',
          chart: chart,
          native: true, // needed otherwise things its a DOM event
          x: point.x,
          y: point.y,
        };

        var elements = Chart.Interaction.modes.index(chart, evt, {intersect: true}).map(item => item.element);
        expect(elements).toEqual([point, meta1.data[1]]);
      });

      it ('returns empty array when nothing found', function() {
        var evt = {
          type: 'click',
          chart: chart,
          native: true, // needed otherwise things its a DOM event
          x: 0,
          y: 0,
        };

        var elements = Chart.Interaction.modes.index(chart, evt, {intersect: true}).map(item => item.element);
        expect(elements).toEqual([]);
      });
    });

    describe ('intersect: false', function() {
      let chart;
      var data = {
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
      };

      beforeEach(function() {
        chart = window.acquireChart({
          type: 'line',
          data: data
        });
      });

      it ('axis: x gets correct items', function() {
        var meta0 = chart.getDatasetMeta(0);
        var meta1 = chart.getDatasetMeta(1);

        var evt = {
          type: 'click',
          chart: chart,
          native: true, // needed otherwise things its a DOM event
          x: chart.chartArea.left,
          y: chart.chartArea.top
        };

        var elements = Chart.Interaction.modes.index(chart, evt, {intersect: false}).map(item => item.element);
        expect(elements).toEqual([meta0.data[0], meta1.data[0]]);
      });

      it ('axis: y gets correct items', function() {
        chart = window.acquireChart({
          type: 'bar',
          data: data,
          options: {
            indexAxis: 'y',
          }
        });

        var meta0 = chart.getDatasetMeta(0);
        var meta1 = chart.getDatasetMeta(1);
        var center = meta0.data[0].getCenterPoint();

        var evt = {
          type: 'click',
          chart: chart,
          native: true, // needed otherwise things its a DOM event
          x: center.x,
          y: center.y + 30,
        };

        var elements = Chart.Interaction.modes.index(chart, evt, {axis: 'y', intersect: false}).map(item => item.element);
        expect(elements).toEqual([meta0.data[0], meta1.data[0]]);
      });

      it ('axis: xy gets correct items', function() {
        var meta0 = chart.getDatasetMeta(0);
        var meta1 = chart.getDatasetMeta(1);

        var evt = {
          type: 'click',
          chart: chart,
          native: true, // needed otherwise things its a DOM event
          x: chart.chartArea.left,
          y: chart.chartArea.top
        };

        var elements = Chart.Interaction.modes.index(chart, evt, {axis: 'xy', intersect: false}).map(item => item.element);
        expect(elements).toEqual([meta0.data[0], meta1.data[0]]);
      });
    });
  });

  describe('dataset mode', function() {
    describe('intersect: true', function() {
      let chart;

      beforeEach(function() {
        chart = window.acquireChart({
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
          }
        });
      });

      it ('should return all items in the dataset of the first item found', function() {
        var meta = chart.getDatasetMeta(0);
        var point = meta.data[1];

        var evt = {
          type: 'click',
          chart: chart,
          native: true, // needed otherwise things its a DOM event
          x: point.x,
          y: point.y
        };

        var elements = Chart.Interaction.modes.dataset(chart, evt, {intersect: true}).map(item => item.element);
        expect(elements).toEqual(meta.data);
      });

      it ('should return an empty array if nothing found', function() {
        var evt = {
          type: 'click',
          chart: chart,
          native: true, // needed otherwise things its a DOM event
          x: 0,
          y: 0
        };

        var elements = Chart.Interaction.modes.dataset(chart, evt, {intersect: true});
        expect(elements).toEqual([]);
      });
    });

    describe('intersect: false', function() {
      let chart;
      var data = {
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
      };

      beforeEach(function() {
        chart = window.acquireChart({
          type: 'line',
          data: data
        });
      });

      it ('axis: x gets correct items', function() {
        chart = window.acquireChart({
          type: 'bar',
          data: data,
          options: {
            indexAxis: 'y',
          }
        });

        var evt = {
          type: 'click',
          chart: chart,
          native: true, // needed otherwise things its a DOM event
          x: chart.chartArea.left,
          y: chart.chartArea.top
        };

        var elements = Chart.Interaction.modes.dataset(chart, evt, {axis: 'x', intersect: false}).map(item => item.element);
        expect(elements).toEqual(chart.getDatasetMeta(0).data);
      });

      it ('axis: y gets correct items', function() {
        var evt = {
          type: 'click',
          chart: chart,
          native: true, // needed otherwise things its a DOM event
          x: chart.chartArea.left,
          y: chart.chartArea.top
        };

        var elements = Chart.Interaction.modes.dataset(chart, evt, {axis: 'y', intersect: false}).map(item => item.element);
        expect(elements).toEqual(chart.getDatasetMeta(1).data);
      });

      it ('axis: xy gets correct items', function() {
        var evt = {
          type: 'click',
          chart: chart,
          native: true, // needed otherwise things its a DOM event
          x: chart.chartArea.left,
          y: chart.chartArea.top
        };

        var elements = Chart.Interaction.modes.dataset(chart, evt, {intersect: false}).map(item => item.element);
        expect(elements).toEqual(chart.getDatasetMeta(1).data);
      });
    });
  });

  describe('nearest mode', function() {
    describe('intersect: false', function() {
      let lineChart, polarChart;

      beforeEach(function() {
        lineChart = window.acquireChart({
          type: 'line',
          data: {
            datasets: [{
              label: 'Dataset 1',
              data: [10, 40, 30],
              pointRadius: [5, 5, 5],
              pointHoverBorderColor: 'rgb(255, 0, 0)',
              pointHoverBackgroundColor: 'rgb(0, 255, 0)'
            }, {
              label: 'Dataset 2',
              data: [40, 40, 40],
              pointRadius: [10, 10, 10],
              pointHoverBorderColor: 'rgb(0, 0, 255)',
              pointHoverBackgroundColor: 'rgb(0, 255, 255)'
            }],
            labels: ['Point 1', 'Point 2', 'Point 3']
          }
        });
        polarChart = window.acquireChart({
          type: 'polarArea',
          data: {
            datasets: [{
              data: [1, 9, 5]
            }],
            labels: ['Point 1', 'Point 2', 'Point 3']
          },
          options: {
            plugins: {
              legend: {
                display: false
              },
            },
          }
        });
      });

      describe('axis: xy', function() {
        it ('should return the nearest item', function() {
          var chart = lineChart;
          var evt = {
            type: 'click',
            chart: chart,
            native: true, // needed otherwise things its a DOM event
            x: chart.chartArea.left,
            y: chart.chartArea.top
          };

          // Nearest to 0,0 (top left) will be first point of dataset 2
          var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: false}).map(item => item.element);
          var meta = chart.getDatasetMeta(1);
          expect(elements).toEqual([meta.data[0]]);
        });

        it ('should return all items at the same nearest distance', function() {
          var chart = lineChart;
          var meta0 = chart.getDatasetMeta(0);
          var meta1 = chart.getDatasetMeta(1);

          // Halfway between 2 mid points
          var pt = {
            x: meta0.data[1].x,
            y: (meta0.data[1].y + meta1.data[1].y) / 2
          };

          var evt = {
            type: 'click',
            chart: chart,
            native: true, // needed otherwise things its a DOM event
            x: pt.x,
            y: pt.y
          };

          // Both points are nearest
          var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: false}).map(item => item.element);
          expect(elements).toEqual([meta0.data[1], meta1.data[1]]);
        });
      });

      describe('axis: x', function() {
        it ('should return all items at current x', function() {
          var chart = lineChart;
          var meta0 = chart.getDatasetMeta(0);
          var meta1 = chart.getDatasetMeta(1);

          // At 'Point 2', 10
          var pt = {
            x: meta0.data[1].x,
            y: meta0.data[0].y
          };

          var evt = {
            type: 'click',
            chart: chart,
            native: true, // needed otherwise things its a DOM event
            x: pt.x,
            y: pt.y
          };

          // Middle point from both series are nearest
          var elements = Chart.Interaction.modes.nearest(chart, evt, {axis: 'x', intersect: false}).map(item => item.element);
          expect(elements).toEqual([meta0.data[1], meta1.data[1]]);
        });

        it ('should return all items at nearest x-distance', function() {
          var chart = lineChart;
          var meta0 = chart.getDatasetMeta(0);
          var meta1 = chart.getDatasetMeta(1);

          // Haflway between 'Point 1' and 'Point 2', y=10
          var pt = {
            x: (meta0.data[0].x + meta0.data[1].x) / 2,
            y: meta0.data[0].y
          };

          var evt = {
            type: 'click',
            chart: chart,
            native: true, // needed otherwise things its a DOM event
            x: pt.x,
            y: pt.y
          };

          // Should return all (4) points from 'Point 1' and 'Point 2'
          var elements = Chart.Interaction.modes.nearest(chart, evt, {axis: 'x', intersect: false}).map(item => item.element);
          expect(elements).toEqual([meta0.data[0], meta0.data[1], meta1.data[0], meta1.data[1]]);
        });
      });

      describe('axis: y', function() {
        it ('should return item with value 30', function() {
          var chart = lineChart;
          var meta0 = chart.getDatasetMeta(0);

          // 'Point 1', y = 30
          var pt = {
            x: meta0.data[0].x,
            y: meta0.data[2].y
          };

          var evt = {
            type: 'click',
            chart: chart,
            native: true, // needed otherwise things its a DOM event
            x: pt.x,
            y: pt.y
          };

          // Middle point from both series are nearest
          var elements = Chart.Interaction.modes.nearest(chart, evt, {axis: 'y', intersect: false}).map(item => item.element);
          expect(elements).toEqual([meta0.data[2]]);
        });

        it ('should return all items at value 40', function() {
          var chart = lineChart;
          var meta0 = chart.getDatasetMeta(0);
          var meta1 = chart.getDatasetMeta(1);

          // 'Point 1', y = 40
          var pt = {
            x: meta0.data[0].x,
            y: meta0.data[1].y
          };

          var evt = {
            type: 'click',
            chart: chart,
            native: true, // needed otherwise things its a DOM event
            x: pt.x,
            y: pt.y
          };

          // Should return points with value 40
          var elements = Chart.Interaction.modes.nearest(chart, evt, {axis: 'y', intersect: false}).map(item => item.element);
          expect(elements).toEqual([meta0.data[1], meta1.data[0], meta1.data[1], meta1.data[2]]);
        });
      });

      describe('axis: r', function() {
        it ('should return item with value 9', function() {
          var chart = polarChart;
          var meta0 = chart.getDatasetMeta(0);

          var evt = {
            type: 'click',
            chart: chart,
            native: true, // Needed, otherwise assumed to be a DOM event
            x: chart.width / 2,
            y: chart.height / 2 + 5,
          };

          var elements = Chart.Interaction.modes.nearest(chart, evt, {axis: 'r'}).map(item => item.element);
          expect(elements).toEqual([meta0.data[1]]);
        });

        it ('should return item with value 1 when clicked outside of it', function() {
          var chart = polarChart;
          var meta0 = chart.getDatasetMeta(0);

          var evt = {
            type: 'click',
            chart: chart,
            native: true, // Needed, otherwise assumed to be a DOM event
            x: chart.width,
            y: 0,
          };

          var elements = Chart.Interaction.modes.nearest(chart, evt, {axis: 'r', intersect: false}).map(item => item.element);
          expect(elements).toEqual([meta0.data[0]]);
        });
      });
    });

    describe('intersect: true', function() {
      let chart;

      beforeEach(function() {
        chart = window.acquireChart({
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
          }
        });
      });

      describe('axis=xy', function() {
        it ('should return the nearest item', function() {
          var meta = chart.getDatasetMeta(1);
          var point = meta.data[1];

          var evt = {
            type: 'click',
            chart: chart,
            native: true, // needed otherwise things its a DOM event
            x: point.x + 15,
            y: point.y
          };

          // Nothing intersects so find nothing
          var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: true}).map(item => item.element);
          expect(elements).toEqual([]);

          evt = {
            type: 'click',
            chart: chart,
            native: true,
            x: point.x,
            y: point.y
          };
          elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: true}).map(item => item.element);
          expect(elements).toEqual([point]);
        });

        it ('should return the nearest item even if 2 intersect', function() {
          chart.data.datasets[0].pointRadius = [5, 30, 5];
          chart.data.datasets[0].data[1] = 39;

          chart.data.datasets[1].pointRadius = [10, 10, 10];

          chart.update();

          // Trigger an event over top of the
          var meta0 = chart.getDatasetMeta(0);

          // Halfway between 2 mid points
          var pt = {
            x: meta0.data[1].x,
            y: meta0.data[1].y
          };

          var evt = {
            type: 'click',
            chart: chart,
            native: true, // needed otherwise things its a DOM event
            x: pt.x,
            y: pt.y
          };

          var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: true}).map(item => item.element);
          expect(elements).toEqual([meta0.data[1]]);
        });

        it ('should return the all items if more than 1 are at the same distance', function() {
          chart.data.datasets[0].pointRadius = [5, 5, 5];
          chart.data.datasets[0].data[1] = 40;

          chart.data.datasets[1].pointRadius = [10, 10, 10];

          chart.update();

          var meta0 = chart.getDatasetMeta(0);
          var meta1 = chart.getDatasetMeta(1);

          // Halfway between 2 mid points
          var pt = {
            x: meta0.data[1].x,
            y: meta0.data[1].y
          };

          var evt = {
            type: 'click',
            chart: chart,
            native: true, // needed otherwise things its a DOM event
            x: pt.x,
            y: pt.y
          };

          var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: true}).map(item => item.element);
          expect(elements).toEqual([meta0.data[1], meta1.data[1]]);
        });
      });
    });
  });

  describe('x mode', function() {
    let chart;

    beforeEach(function() {
      chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 40, 30],
            pointRadius: [5, 10, 5],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)'
          }, {
            label: 'Dataset 2',
            data: [40, 40, 40],
            pointRadius: [10, 10, 10],
            pointHoverBorderColor: 'rgb(0, 0, 255)',
            pointHoverBackgroundColor: 'rgb(0, 255, 255)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        }
      });
    });

    it('should return items at the same x value when intersect is false', function() {
      var meta0 = chart.getDatasetMeta(0);
      var meta1 = chart.getDatasetMeta(1);

      // Halfway between 2 mid points
      var pt = {
        x: meta0.data[1].x,
        y: meta0.data[1].y
      };

      var evt = {
        type: 'click',
        chart: chart,
        native: true, // needed otherwise things its a DOM event
        x: pt.x,
        y: 0
      };

      var elements = Chart.Interaction.modes.x(chart, evt, {intersect: false}).map(item => item.element);
      expect(elements).toEqual([meta0.data[1], meta1.data[1]]);

      evt = {
        type: 'click',
        chart: chart,
        native: true, // needed otherwise things its a DOM event
        x: pt.x + 20,
        y: 0
      };

      elements = Chart.Interaction.modes.x(chart, evt, {intersect: false}).map(item => item.element);
      expect(elements).toEqual([]);
    });

    it('should return items at the same x value when intersect is true', function() {
      var meta0 = chart.getDatasetMeta(0);
      var meta1 = chart.getDatasetMeta(1);

      // Halfway between 2 mid points
      var pt = {
        x: meta0.data[1].x,
        y: meta0.data[1].y
      };

      var evt = {
        type: 'click',
        chart: chart,
        native: true, // needed otherwise things its a DOM event
        x: pt.x,
        y: 0
      };

      var elements = Chart.Interaction.modes.x(chart, evt, {intersect: true}).map(item => item.element);
      expect(elements).toEqual([]); // we don't intersect anything

      evt = {
        type: 'click',
        chart: chart,
        native: true, // needed otherwise things its a DOM event
        x: pt.x,
        y: pt.y
      };

      elements = Chart.Interaction.modes.x(chart, evt, {intersect: true}).map(item => item.element);
      expect(elements).toEqual([meta0.data[1], meta1.data[1]]);
    });
  });

  describe('y mode', function() {
    let chart;

    beforeEach(function() {
      chart = window.acquireChart({
        type: 'line',
        data: {
          datasets: [{
            label: 'Dataset 1',
            data: [10, 40, 30],
            pointRadius: [5, 10, 5],
            pointHoverBorderColor: 'rgb(255, 0, 0)',
            pointHoverBackgroundColor: 'rgb(0, 255, 0)'
          }, {
            label: 'Dataset 2',
            data: [40, 40, 40],
            pointRadius: [10, 10, 10],
            pointHoverBorderColor: 'rgb(0, 0, 255)',
            pointHoverBackgroundColor: 'rgb(0, 255, 255)'
          }],
          labels: ['Point 1', 'Point 2', 'Point 3']
        }
      });
    });

    it('should return items at the same y value when intersect is false', function() {
      var meta0 = chart.getDatasetMeta(0);
      var meta1 = chart.getDatasetMeta(1);

      // Halfway between 2 mid points
      var pt = {
        x: meta0.data[1].x,
        y: meta0.data[1].y
      };

      var evt = {
        type: 'click',
        chart: chart,
        native: true,
        x: 0,
        y: pt.y,
      };

      var elements = Chart.Interaction.modes.y(chart, evt, {intersect: false}).map(item => item.element);
      expect(elements).toEqual([meta0.data[1], meta1.data[0], meta1.data[1], meta1.data[2]]);

      evt = {
        type: 'click',
        chart: chart,
        native: true,
        x: pt.x,
        y: pt.y + 20, // out of range
      };

      elements = Chart.Interaction.modes.y(chart, evt, {intersect: false}).map(item => item.element);
      expect(elements).toEqual([]);
    });

    it('should return items at the same y value when intersect is true', function() {
      var meta0 = chart.getDatasetMeta(0);
      var meta1 = chart.getDatasetMeta(1);

      // Halfway between 2 mid points
      var pt = {
        x: meta0.data[1].x,
        y: meta0.data[1].y
      };

      var evt = {
        type: 'click',
        chart: chart,
        native: true,
        x: 0,
        y: pt.y
      };

      var elements = Chart.Interaction.modes.y(chart, evt, {intersect: true}).map(item => item.element);
      expect(elements).toEqual([]); // we don't intersect anything

      evt = {
        type: 'click',
        chart: chart,
        native: true,
        x: pt.x,
        y: pt.y,
      };

      elements = Chart.Interaction.modes.y(chart, evt, {intersect: true}).map(item => item.element);
      expect(elements).toEqual([meta0.data[1], meta1.data[0], meta1.data[1], meta1.data[2]]);
    });
  });

  describe('tooltip element of scatter chart', function() {
    it ('out-of-range datapoints are not shown in tooltip', function() {
      let data = [];
      for (let i = 0; i < 1000; i++) {
        data.push({x: i, y: i});
      }

      const chart = window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [{data}]
        },
        options: {
          scales: {
            x: {
              min: 2
            }
          }
        }
      });

      const meta0 = chart.getDatasetMeta(0);
      const firstElement = meta0.data[0];

      const evt = {
        type: 'click',
        chart: chart,
        native: true, // needed otherwise things its a DOM event
        x: firstElement.x,
        y: firstElement.y
      };

      const elements = Chart.Interaction.modes.point(chart, evt, {intersect: true}).map(item => item.element);
      expect(elements).not.toContain(firstElement);
    });

    it ('out-of-range datapoints are shown in tooltip if included', function() {
      let data = [];
      for (let i = 0; i < 1000; i++) {
        data.push({x: i, y: i});
      }

      const chart = window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [{data}]
        },
        options: {
          scales: {
            x: {
              min: 2
            }
          }
        }
      });

      const meta0 = chart.getDatasetMeta(0);
      const firstElement = meta0.data[0];

      const evt = {
        type: 'click',
        chart: chart,
        native: true, // needed otherwise it thinks its a DOM event
        x: firstElement.x,
        y: firstElement.y
      };

      const elements = Chart.Interaction.modes.point(
        chart,
        evt,
        {
          intersect: true,
          includeInvisible: true
        }).map(item => item.element);
      expect(elements).toContain(firstElement);
    });
  });

  describe('bars cut off by the chart area', function() {
    function acquireBarChart(data, y, interaction) {
      return window.acquireChart({
        type: 'bar',
        data: {
          labels: ['a', 'b'],
          datasets: [{data}]
        },
        options: {
          animation: false,
          interaction,
          scales: {y},
          plugins: {
            tooltip: {animation: false}
          }
        }
      });
    }

    it('finds a bar whose base is below the axis minimum and anchors the tooltip in its visible part', async function() {
      const interaction = {mode: 'nearest', intersect: false, axis: 'x'};
      const chart = acquireBarChart([1.5, 10], {min: 1}, interaction);
      const {chartArea} = chart;
      const bar = chart.getDatasetMeta(0).data[0];
      const position = {x: bar.x, y: chartArea.top + 5};

      const evt = {type: 'click', chart, native: true, ...position};
      const elements = Chart.Interaction.modes.nearest(chart, evt, interaction).map(item => item.element);
      expect(elements).toEqual([bar]);

      await triggerMouseEvent(chart, 'mousemove', position);
      const tooltip = chart.tooltip;
      expect(tooltip.dataPoints.map(item => item.dataIndex)).toEqual([0]);
      expect(tooltip.caretX).toBeCloseToPixel(bar.x);
      expect(tooltip.caretY).toBeCloseToPixel((bar.y + chartArea.bottom) / 2);

      // The centre of the whole bar is inside the area, but its base is not
      const tall = chart.getDatasetMeta(0).data[1];
      expect(tall.getCenterPoint().y).toBeLessThan(chartArea.bottom);
      await triggerMouseEvent(chart, 'mousemove', {x: tall.x, y: chartArea.top + 5});
      expect(tooltip.dataPoints.map(item => item.dataIndex)).toEqual([1]);
      expect(tooltip.caretY).toBeCloseToPixel((tall.y + chartArea.bottom) / 2);
    });

    it('finds a bar whose head is above the axis maximum and anchors the tooltip in its visible part', async function() {
      const interaction = {mode: 'index', intersect: true};
      const chart = acquireBarChart([100, 20], {max: 50}, interaction);
      const {chartArea} = chart;
      const bar = chart.getDatasetMeta(0).data[0];
      const position = {x: bar.x, y: chartArea.top + 10};

      const evt = {type: 'click', chart, native: true, ...position};
      const elements = Chart.Interaction.modes.index(chart, evt, interaction).map(item => item.element);
      expect(elements).toEqual([bar]);

      await triggerMouseEvent(chart, 'mousemove', position);
      const tooltip = chart.tooltip;
      expect(tooltip.dataPoints.map(item => item.dataIndex)).toEqual([0]);
      expect(tooltip.caretX).toBeCloseToPixel(bar.x);
      expect(tooltip.caretY).toBeCloseToPixel((chartArea.top + bar.base) / 2);
    });

    it('finds a horizontal bar whose base is left of the axis minimum and anchors the tooltip in its visible part', async function() {
      const interaction = {mode: 'nearest', intersect: false, axis: 'y'};
      const chart = window.acquireChart({
        type: 'bar',
        data: {labels: ['a', 'b'], datasets: [{data: [1.5, 10]}]},
        options: {
          animation: false,
          indexAxis: 'y',
          interaction,
          scales: {x: {min: 1}},
          plugins: {tooltip: {animation: false}}
        }
      });
      const {chartArea} = chart;
      const meta = chart.getDatasetMeta(0);
      const bar = meta.data[0];
      const position = {x: chartArea.right - 5, y: bar.y};

      const evt = {type: 'click', chart, native: true, ...position};
      const elements = Chart.Interaction.modes.nearest(chart, evt, interaction).map(item => item.element);
      expect(elements).toEqual([bar]);

      await triggerMouseEvent(chart, 'mousemove', position);
      const tooltip = chart.tooltip;
      expect(tooltip.dataPoints.map(item => item.dataIndex)).toEqual([0]);
      expect(tooltip.caretX).toBeCloseToPixel((bar.x + chartArea.left) / 2);
      expect(tooltip.caretY).toBeCloseToPixel(bar.y);

      // The centre of the whole bar is inside the area, but its base is not
      const long = meta.data[1];
      expect(long.getCenterPoint().x).toBeGreaterThan(chartArea.left);
      await triggerMouseEvent(chart, 'mousemove', {x: chartArea.right - 5, y: long.y});
      expect(tooltip.dataPoints.map(item => item.dataIndex)).toEqual([1]);
      expect(tooltip.caretX).toBeCloseToPixel((long.x + chartArea.left) / 2);
    });

    it('measures the distance to a cut-off bar from its visible part', function() {
      const chart = window.acquireChart({
        type: 'bar',
        data: {labels: ['a'], datasets: [{data: [100]}, {data: [40]}]},
        options: {animation: false, scales: {y: {max: 50}}}
      });
      const cutOff = chart.getDatasetMeta(0).data[0];
      const inside = chart.getDatasetMeta(1).data[0];
      // Nearer the visible centre of the cut-off bar (25) than the centre of the other (20),
      // but further from the centre of the whole cut-off bar (50).
      const evt = {type: 'click', chart, native: true, x: (cutOff.x + inside.x) / 2, y: chart.scales.y.getPixelForValue(27)};

      const elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: false, axis: 'xy'}).map(item => item.element);
      expect(elements).toEqual([cutOff]);
    });

    it('measures a cut-off bar at its final position when asked to', function() {
      const chart = window.acquireChart({
        type: 'bar',
        data: {labels: ['a'], datasets: [{data: [100]}, {data: [40]}]},
        options: {animation: {duration: 60000}, scales: {y: {max: 50}}}
      });
      const cutOff = chart.getDatasetMeta(0).data[0];
      const inside = chart.getDatasetMeta(1).data[0];
      // Both bars still grow from their base
      expect(cutOff.y).not.toBeCloseToPixel(cutOff.getProps(['y'], true).y);
      const evt = {type: 'click', chart, native: true, x: (cutOff.x + inside.x) / 2, y: chart.scales.y.getPixelForValue(27)};

      const elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: false, axis: 'xy'}, true).map(item => item.element);
      expect(elements).toEqual([cutOff]);
    });

    it('does not find a bar with no part inside the chart area unless includeInvisible is set', function() {
      const interaction = {mode: 'nearest', intersect: false, axis: 'x'};
      const chart = acquireBarChart([0.5, 10], {min: 1}, interaction);
      const meta = chart.getDatasetMeta(0);
      const evt = {type: 'click', chart, native: true, x: meta.data[0].x, y: chart.chartArea.top + 5};

      let elements = Chart.Interaction.modes.nearest(chart, evt, interaction).map(item => item.element);
      expect(elements).toEqual([meta.data[1]]);

      elements = Chart.Interaction.modes.nearest(chart, evt, {...interaction, includeInvisible: true}).map(item => item.element);
      expect(elements).toEqual([meta.data[0]]);
    });

    it('keeps the tooltip of a bar inside the chart area at its head', async function() {
      const chart = acquireBarChart([10, 20], {}, {mode: 'index', intersect: true});
      const bar = chart.getDatasetMeta(0).data[1];

      await triggerMouseEvent(chart, 'mousemove', {x: bar.x, y: bar.y + 5});
      const tooltip = chart.tooltip;
      expect(tooltip.dataPoints.map(item => item.dataIndex)).toEqual([1]);
      expect(tooltip.caretX).toBeCloseToPixel(bar.x);
      expect(tooltip.caretY).toBeCloseToPixel(bar.y);
    });

    it('does not find a bar with no part inside the chart area in the padding around it', function() {
      const chart = window.acquireChart({
        data: {
          labels: ['a', 'b'],
          datasets: [
            {type: 'bar', data: [0.98, 10]},
            {type: 'line', data: [5, 5], pointRadius: 10}
          ]
        },
        options: {animation: false, scales: {y: {min: 1}}}
      });
      const {chartArea} = chart;
      const bar = chart.getDatasetMeta(0).data[0];
      expect(bar.y).toBeGreaterThan(chartArea.bottom);
      // The padding that the points need lets a pointer just below the area count as inside it
      const evt = {type: 'click', chart, native: true, x: bar.x, y: bar.y + 1};
      expect(chart.isPointInArea(evt)).toBe(true);
      expect(bar.inRange(evt.x, evt.y)).toBe(true);

      let elements = Chart.Interaction.modes.point(chart, evt, {intersect: true}).map(item => item.element);
      expect(elements).not.toContain(bar);
      elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: true}).map(item => item.element);
      expect(elements).not.toContain(bar);
    });

    it('finds a bar of zero length on the edge of the chart area', function() {
      const chart = acquireBarChart([0, 10], {min: 0}, {});
      const meta = chart.getDatasetMeta(0);
      const bar = meta.data[0];
      expect(bar.y).toBeCloseToPixel(chart.chartArea.bottom);

      const atBar = {type: 'click', chart, native: true, x: bar.x, y: bar.y};
      let elements = Chart.Interaction.modes.point(chart, atBar, {intersect: true}).map(item => item.element);
      expect(elements).toEqual([bar]);

      const above = {type: 'click', chart, native: true, x: bar.x, y: chart.chartArea.top + 5};
      elements = Chart.Interaction.modes.nearest(chart, above, {intersect: false, axis: 'x'}).map(item => item.element);
      expect(elements).toEqual([bar]);
    });

    it('keeps the generic rule for a bar element subclass with its own geometry', async function() {
      class OwnGeometryElement extends Chart.BarElement {
        static id = 'ownGeometry';
        getCenterPoint(useFinalPosition) {
          return super.getCenterPoint(useFinalPosition);
        }
      }
      class OwnGeometryController extends Chart.BarController {
        static id = 'ownGeometry';
        static defaults = {...Chart.BarController.defaults, dataElementType: 'ownGeometry'};
      }
      Chart.register(OwnGeometryElement, OwnGeometryController);
      try {
        const interaction = {mode: 'nearest', intersect: false, axis: 'x'};
        const chart = window.acquireChart({
          type: 'ownGeometry',
          data: {labels: ['a', 'b'], datasets: [{data: [1.5, 10]}]},
          options: {
            animation: false,
            interaction,
            scales: {y: {min: 1}},
            plugins: {tooltip: {animation: false}}
          }
        });
        const meta = chart.getDatasetMeta(0);
        const bar = meta.data[0];
        expect(bar instanceof OwnGeometryElement).toBe(true);
        // No opinion: the interaction modes and the tooltip keep the generic rule
        expect(bar._getAreaCenter && bar._getAreaCenter(chart.chartArea)).toBeUndefined();

        const position = {x: bar.x, y: chart.chartArea.top + 5};
        const evt = {type: 'click', chart, native: true, ...position};
        const elements = Chart.Interaction.modes.nearest(chart, evt, interaction).map(item => item.element);
        expect(elements).toEqual([meta.data[1]]);

        await triggerMouseEvent(chart, 'mousemove', {x: bar.x, y: bar.y + 5});
        expect(chart.tooltip.dataPoints.map(item => item.dataIndex)).toEqual([0]);
        expect(chart.tooltip.caretY).toBeCloseToPixel(bar.y);
      } finally {
        Chart.unregister(OwnGeometryElement, OwnGeometryController);
      }
    });
  });

  const testCases = [
    {
      data: [12, 19, null, null, null, null, 5, 2],
      clickPointIndex: 0,
      expectedNearestPointIndex: 0
    },
    {
      data: [12, 19, null, null, null, null, 5, 2],
      clickPointIndex: 1,
      expectedNearestPointIndex: 1},
    {
      data: [12, 19, null, null, null, null, 5, 2],
      clickPointIndex: 2,
      expectedNearestPointIndex: 1
    },
    {
      data: [12, 19, null, null, null, null, 5, 2],
      clickPointIndex: 3,
      expectedNearestPointIndex: 1
    },
    {
      data: [12, 19, null, null, null, null, 5, 2],
      clickPointIndex: 4,
      expectedNearestPointIndex: 6
    },
    {
      data: [12, 19, null, null, null, null, 5, 2],
      clickPointIndex: 5,
      expectedNearestPointIndex: 6
    },
    {
      data: [12, 19, null, null, null, null, 5, 2],
      clickPointIndex: 6,
      expectedNearestPointIndex: 6
    },
    {
      data: [12, 19, null, null, null, null, 5, 2],
      clickPointIndex: 7,
      expectedNearestPointIndex: 7
    },
    {
      data: [12, 0, null, null, null, null, 0, 2],
      clickPointIndex: 3,
      expectedNearestPointIndex: 1
    },
    {
      data: [12, 0, null, null, null, null, 0, 2],
      clickPointIndex: 4,
      expectedNearestPointIndex: 6
    },
    {
      data: [12, -1, null, null, null, null, -1, 2],
      clickPointIndex: 3,
      expectedNearestPointIndex: 1
    },
    {
      data: [12, -1, null, null, null, null, -1, 2],
      clickPointIndex: 4,
      expectedNearestPointIndex: 6
    },
    {
      data: [null, 2],
      clickPointIndex: 0,
      expectedNearestPointIndex: 1
    },
    {
      data: [2, null],
      clickPointIndex: 1,
      expectedNearestPointIndex: 0
    },
    {
      data: [null, null, 2],
      clickPointIndex: 0,
      expectedNearestPointIndex: 2
    },
    {
      data: [2, null, null],
      clickPointIndex: 2,
      expectedNearestPointIndex: 0
    }
  ];
  testCases.forEach(({data, clickPointIndex, expectedNearestPointIndex}, i) => {
    it(`should select nearest non-null element with index ${expectedNearestPointIndex} when clicking on element with index ${clickPointIndex} in test case ${i + 1} if spanGaps=true`, function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {
          labels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          datasets: [{
            data: data,
            spanGaps: true,
          }]
        }
      });
      chart.update();
      const meta = chart.getDatasetMeta(0);
      const point = meta.data[clickPointIndex];

      const evt = {
        type: 'click',
        chart: chart,
        native: true, // needed otherwise things its a DOM event
        x: point.x,
        y: point.y,
      };

      const elements = Chart.Interaction.modes.nearest(chart, evt, {axis: 'x', intersect: false}).map(item => item.element);
      expect(elements).toEqual([meta.data[expectedNearestPointIndex]]);
    });
  });
});
