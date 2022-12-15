const exports = require('../dist/chart.cjs');
const {Chart, registerables} = exports;

Chart.register(...registerables);

module.exports = Object.assign(Chart, exports);
