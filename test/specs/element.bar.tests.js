// Test the bar element

describe('Bar element tests', function() {
  it('Should correctly identify as in range', function() {
    var bar = new Chart.elements.BarElement({
      base: 0,
      width: 4,
      x: 10,
      y: 15
    });

    expect(bar.inRange(10, 15)).toBe(true);
    expect(bar.inRange(10, 10)).toBe(true);
    expect(bar.inRange(10, 16)).toBe(false);
    expect(bar.inRange(5, 5)).toBe(false);

    // Test when the y is below the base (negative bar)
    var negativeBar = new Chart.elements.BarElement({
      base: 0,
      width: 4,
      x: 10,
      y: -15
    });

    expect(negativeBar.inRange(10, -16)).toBe(false);
    expect(negativeBar.inRange(10, 1)).toBe(false);
    expect(negativeBar.inRange(10, -5)).toBe(true);
  });

  it('should get the correct tooltip position', function() {
    var bar = new Chart.elements.BarElement({
      base: 0,
      width: 4,
      x: 10,
      y: 15
    });

    expect(bar.tooltipPosition()).toEqual({
      x: 10,
      y: 15,
    });

    // Test when the y is below the base (negative bar)
    var negativeBar = new Chart.elements.BarElement({
      base: -10,
      width: 4,
      x: 10,
      y: -15
    });

    expect(negativeBar.tooltipPosition()).toEqual({
      x: 10,
      y: -15,
    });
  });

  it('should get the center', function() {
    var bar = new Chart.elements.BarElement({
      base: 0,
      width: 4,
      x: 10,
      y: 15
    });

    expect(bar.getCenterPoint()).toEqual({x: 10, y: 7.5});
  });

  describe('unwanted white gap fix', () => {
    it('should not produce white gap when borderWidth > 0', () => {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            data: [50],
            backgroundColor: 'pink',
            borderColor: 'pink',
            borderWidth: 15,
            borderSkipped: false,
          }],
          labels: []
        },
        options: {
          elements: {
            bar: {
              inflateAmount: 0,
            }
          },
        }
      });

      const meta = chart.getDatasetMeta(0);
      const bar = meta.data[0];
      const props = bar.getProps(['width', 'height', 'borderWidth'], true);

      expect(props.borderWidth).toBe(15);
      expect(props.width).toBeGreaterThan(props.borderWidth * 2);
      expect(props.height).toBeGreaterThan(props.borderWidth * 2);
    });

    it('should handle borderRadius without creating a gap', () => {
      var chart = window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            data: [30],
            backgroundColor: 'black',
            borderColor: 'black',
            borderWidth: 10,
            borderRadius: 8,
            borderSkipped: false,
          }],
          labels: []
        },
        options: {
          elements: {
            bar: {
              inflateAmount: 0,
            }
          },
        }
      });

      const meta = chart.getDatasetMeta(0);
      const bar = meta.data[0];
      const props = bar.getProps(['width', 'height', 'borderWidth', 'borderRadius'], true);

      expect(props.borderWidth).toBe(10);
      expect(props.borderRadius).toBe(8);
      expect(props.width).toBeGreaterThan(props.borderRadius + props.borderWidth);
      expect(props.height).toBeGreaterThan(props.borderRadius + props.borderWidth);
    });
  });
});
