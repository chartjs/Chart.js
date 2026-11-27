describe('Chart.DatasetController splice synchronization', function() {
  [true, false].forEach(function(parsing) {
    describe(`with parsing ${parsing}`, function() {
      it('preserves surviving elements after a silent length edit before splice', function() {
        const data = [0, 1, 2, 3].map(value => ({x: 0, y: value}));
        const chart = acquireChart({
          type: 'line',
          data: {datasets: [{data}]},
          options: {parsing, scales: {x: {type: 'linear'}}}
        });
        const meta = chart.getDatasetMeta(0);
        const first = meta.data[0];
        const last = meta.data[1];
        const inserted = {x: 0, y: 9};

        data.length = 2;
        data.splice(1, 0, inserted);
        chart.update('none');

        expect(meta.data).toHaveLength(3);
        expect(meta.data[0]).toBe(first);
        expect(meta.data[2]).toBe(last);
        expect(meta._parsed).toEqual(data);
        expect(meta.data[1].y).toBeCloseTo(chart.scales.y.getPixelForValue(9));
      });

      it('does not coerce an object start again in the chart listener', function() {
        const original = [0, 1, 2, 3].map(value => ({x: 0, y: value}));
        const data = original.slice();
        const chart = acquireChart({
          type: 'line',
          data: {datasets: [{data}]},
          options: {parsing, scales: {x: {type: 'linear'}}}
        });
        const meta = chart.getDatasetMeta(0);
        const last = meta.data[3];
        const start = {valueOf: vi.fn(() => -1)};
        const inserted = {x: 0, y: 9};

        data.splice(start, 0, inserted);
        chart.update('none');

        expect(start.valueOf).toHaveBeenCalledTimes(1);
        expect(data).toEqual([...original.slice(0, 3), inserted, original[3]]);
        expect(meta.data).toHaveLength(5);
        expect(meta.data[4]).toBe(last);
        expect(meta._parsed).toEqual(data);
        expect(meta.data.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
      });

      it('resynchronizes an opaque deletion without replaying its conversion', function() {
        const data = [0, 1, 2, 3].map(value => ({x: 0, y: value}));
        const chart = acquireChart({
          type: 'line',
          data: {datasets: [{data}]},
          options: {parsing, scales: {x: {type: 'linear'}}}
        });
        const start = {valueOf: vi.fn(() => -2)};

        data.splice(start, 1);
        chart.update('none');

        const meta = chart.getDatasetMeta(0);
        expect(start.valueOf).toHaveBeenCalledTimes(1);
        expect(data.map(point => point.y)).toEqual([0, 1, 3]);
        expect(meta._parsed).toEqual(data);
        expect(meta.data).toHaveLength(3);
        expect(meta.data.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
      });

      const cases = [
        {name: 'negative insertion index', start: -1, count: 0},
        {name: 'negative replacement index', start: -2, count: 1},
        {name: 'index before the beginning', start: -10, count: 0},
        {name: 'index after the end', start: 20, count: 0},
        {name: 'fractional index', start: 1.9, count: 0},
        {name: 'numeric string index', start: '1', count: 0},
        {name: 'negative delete count', start: 1, count: -1},
        {name: 'unbounded delete count', start: -2, count: Infinity}
      ];

      cases.forEach(function({name, start, count}) {
        it(`preserves data and surviving elements for ${name}`, function() {
          const original = [0, 1, 2, 3].map(value => ({x: 0, y: value}));
          const data = original.slice();
          const chart = acquireChart({
            type: 'line',
            data: {datasets: [{data}]},
            options: {parsing, scales: {x: {type: 'linear'}}}
          });
          const meta = chart.getDatasetMeta(0);
          const elements = meta.data.slice();
          const inserted = {x: 0, y: 10};
          const expected = original.slice();
          const removed = expected.splice(start, count, inserted);

          expect(data.splice(start, count, inserted)).toEqual(removed);
          chart.update();

          expect(data).toEqual(expected);
          expect(meta._parsed).toEqual(expected);
          expect(meta.data.length).toBe(expected.length);
          expected.forEach(function(value, index) {
            const element = meta.data[index];
            expect(element.x).toBeCloseTo(chart.scales.x.getPixelForValue(value.x));
            expect(element.y).toBeCloseTo(chart.scales.y.getPixelForValue(value.y));
            if (value !== inserted) {
              expect(element).toBe(elements[original.indexOf(value)]);
            }
          });
        });
      });

      it('normalizes each splice before multiple queued changes are applied', function() {
        const original = [0, 1, 2, 3].map(value => ({x: 0, y: value}));
        const data = original.slice();
        const chart = acquireChart({
          type: 'line',
          data: {datasets: [{data}]},
          options: {parsing, scales: {x: {type: 'linear'}}}
        });
        const meta = chart.getDatasetMeta(0);
        const first = meta.data[0];
        const last = meta.data[3];
        const inserted = {x: 0, y: 10};

        data.push({x: 0, y: 4});
        data.splice(-2, 0, inserted);
        data.splice(1, 2);
        chart.update();

        expect(meta._parsed).toEqual(data);
        expect(meta.data.length).toBe(4);
        expect(meta.data[0]).toBe(first);
        expect(meta.data[2]).toBe(last);
      });
    });
  });
});
