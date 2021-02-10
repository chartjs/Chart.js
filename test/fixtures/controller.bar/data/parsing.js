const data = [{x: 'Jan', net: 100, cogs: 50, gm: 50}, {x: 'Feb', net: 120, cogs: 55, gm: 75}];

module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb'],
      datasets: [{
        label: 'Net sales',
        backgroundColor: 'blue',
        data: data,
        parsing: {
          yAxisKey: 'net'
        }
      }, {
        label: 'Cost of goods sold',
        backgroundColor: 'red',
        data: data,
        parsing: {
          yAxisKey: 'cogs'
        }
      }, {
        label: 'Gross margin',
        backgroundColor: 'green',
        data: data,
        parsing: {
          yAxisKey: 'gm'
        }
      }]
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
