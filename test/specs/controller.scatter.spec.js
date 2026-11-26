describe('Chart.controllers.scatter', function() {
  it('should be registered as dataset controller', function() {
    expect(typeof Chart.controllers.scatter).toBe('function');
  });

  it('should only show a single point in the tooltip on multiple datasets', async function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          data: [{
            x: 10,
            y: 15
          },
          {
            x: 12,
            y: 10
          }],
          label: 'dataset1'
        },
        {
          data: [{
            x: 20,
            y: 10
          },
          {
            x: 4,
            y: 8
          }],
          label: 'dataset2'
        }]
      },
      options: {}
    });
    var point = chart.getDatasetMeta(0).data[1];

    await triggerMouseEvent(chart, 'mousemove', point);
    expect(chart.tooltip.body.length).toEqual(1);
  });

  it('should not create line element by default', function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          data: [{
            x: 10,
            y: 15
          },
          {
            x: 12,
            y: 10
          }],
          label: 'dataset1'
        },
        {
          data: [{
            x: 20,
            y: 10
          },
          {
            x: 4,
            y: 8
          }],
          label: 'dataset2'
        }]
      },
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.dataset instanceof Chart.elements.LineElement).toBe(false);
  });

  it('should create line element if showline is true at datasets options', function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          showLine: true,
          data: [{
            x: 10,
            y: 15
          },
          {
            x: 12,
            y: 10
          }],
          label: 'dataset1'
        },
        {
          data: [{
            x: 20,
            y: 10
          },
          {
            x: 4,
            y: 8
          }],
          label: 'dataset2'
        }]
      },
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.dataset instanceof Chart.elements.LineElement).toBe(true);
  });

  it('should create line element if showline is true at root options', function() {
    var chart = window.acquireChart({
      type: 'scatter',
      data: {
        datasets: [{
          data: [{
            x: 10,
            y: 15
          },
          {
            x: 12,
            y: 10
          }],
          label: 'dataset1'
        },
        {
          data: [{
            x: 20,
            y: 10
          },
          {
            x: 4,
            y: 8
          }],
          label: 'dataset2'
        }]
      },
      options: {
        showLine: true
      }
    });

    var meta = chart.getDatasetMeta(0);
    expect(meta.dataset instanceof Chart.elements.LineElement).toBe(true);
  });

  it('should not override tooltip title and label callbacks', async() => {
    const chart = window.acquireChart({
      type: 'scatter',
      data: {
        labels: ['Label 1', 'Label 2'],
        datasets: [{
          data: [{
            x: 10,
            y: 15
          },
          {
            x: 12,
            y: 10
          }],
          label: 'Dataset 1'
        }, {
          data: [{
            x: 20,
            y: 10
          },
          {
            x: 4,
            y: 8
          }],
          label: 'Dataset 2'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
      }
    });
    const {tooltip} = chart;
    const point = chart.getDatasetMeta(0).data[0];

    await triggerMouseEvent(chart, 'mousemove', point);

    expect(tooltip.title).toEqual(['Label 1']);
    expect(tooltip.body).toEqual([{
      before: [],
      lines: ['Dataset 1: (10, 15)'],
      after: []
    }]);

    chart.options.plugins.tooltip = {mode: 'dataset'};
    chart.update();
    await triggerMouseEvent(chart, 'mousemove', point);

    expect(tooltip.title).toEqual(['Dataset 1']);
    expect(tooltip.body).toEqual([{
      before: [],
      lines: ['Label 1: (10, 15)'],
      after: []
    }, {
      before: [],
      lines: ['Label 2: (12, 10)'],
      after: []
    }]);
  });

  describe('tooltip label', function() {
    function labelOf(index, data, scales) {
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {scales}
      });
      return chart.getDatasetMeta(0).controller.getLabelAndValue(index).label;
    }

    it('should come from a category x axis whose labels come from the data', function() {
      const data = {datasets: [{data: [{x: 'a', y: 1}, {x: 'b', y: 2}]}]};
      expect(labelOf(1, data, {x: {type: 'category'}})).toBe('b');
    });

    it('should come from a category y axis when the x axis is linear', function() {
      const data = {datasets: [{data: [{x: 1, y: 'a'}, {x: 2, y: 'b'}]}]};
      expect(labelOf(1, data, {x: {type: 'linear'}, y: {type: 'category'}})).toBe('b');
    });

    it('should come from the x axis when both axes are category axes', function() {
      const data = {datasets: [{data: [{x: 'a', y: 'c'}, {x: 'b', y: 'd'}]}]};
      const scales = {x: {type: 'category', labels: ['a', 'b']}, y: {type: 'category', labels: ['c', 'd']}};
      expect(labelOf(1, data, scales)).toBe('b');
    });

    it('should name the category of the point, not the label at its index', function() {
      const data = {datasets: [{data: [{x: 'a', y: 1}, {x: 'b', y: 2}, {x: 'a', y: 3}]}]};
      expect(labelOf(2, data, {x: {type: 'category'}})).toBe('a');
    });

    it('should be the entry of data.labels at the index when there is one', function() {
      const data = {
        labels: ['first', 'second'],
        datasets: [{data: [{x: 'a', y: 1}, {x: 'b', y: 2}]}]
      };
      expect(labelOf(1, data, {x: {type: 'category', labels: ['a', 'b']}})).toBe('second');
    });

    it('should be empty without data.labels or a category axis', function() {
      const data = {datasets: [{data: [{x: 1, y: 1}, {x: 2, y: 2}]}]};
      expect(labelOf(1, data, {})).toBe('');
    });

    it('should be empty for a point without a category', function() {
      const data = {datasets: [{data: [{x: 'a', y: 1}, {x: null, y: 2}]}]};
      expect(labelOf(1, data, {x: {type: 'category'}})).toBe('');
    });
  });
});
