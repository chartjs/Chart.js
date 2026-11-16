import assert from 'node:assert/strict';
import {Chart} from 'chart.js';
import {valueOrDefault, color, getHoverColor} from 'chart.js/helpers';

Chart.register({
  id: 'TEST_PLUGIN',
  dummyValue: valueOrDefault(0, 1)
});

// The color helpers call into @kurkle/color.
assert.equal(color('#ff0000').hexString(), '#F00');
assert.equal(getHoverColor('#ff0000'), '#E60000');
