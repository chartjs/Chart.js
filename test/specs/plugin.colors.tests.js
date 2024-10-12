describe('Plugin.colors', () => {
  describe('auto', jasmine.fixture.specs('plugin.colors'));

  describe('Plugin.colors.chartDefaults', () => {
    beforeAll(() => {
      Chart.defaults.backgroundColor = ['green', 'yellow'];
    });

    afterAll(() => {
      Chart.defaults.backgroundColor = 'rgba(0,0,0,0.1)';
    });

    it('should not use colors plugin when chart defaults are given', () => {
      const chart = window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            data: [1, 10],
            label: 'dataset1'
          }],
          labels: ['label1', 'label2']
        },
        options: {
          plugins: {
            colors: {
              enabled: true
            }
          }
        }
      });

      const meta = chart.getDatasetMeta(0);
      expect(meta.data[0].options.backgroundColor).toBe('green');
      expect(meta.data[1].options.backgroundColor).toBe('yellow');
    });
  });
});
