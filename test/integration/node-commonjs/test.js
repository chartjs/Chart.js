const assert = require('node:assert/strict');
const {Chart} = require('chart.js');
const {valueOrDefault, color, getHoverColor} = require('chart.js/helpers');

Chart.register({
  id: 'TEST_PLUGIN',
  dummyValue: valueOrDefault(0, 1)
});

// The color helpers call into @kurkle/color, which must expose `Color` on
// its CommonJS build.
assert.equal(color('#ff0000').hexString(), '#F00');
assert.equal(getHoverColor('#ff0000'), '#E60000');
