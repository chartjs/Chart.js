module.exports = {
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'label1',
        data: [{
          x: 0,
          y: 30
        }, {
          x: 5,
          y: 35
        }, {
          x: 10,
          y: 20
        }],
        backgroundColor: '#42A8E4'
      },
      {
        label: 'label2',
        data: [{
          x: 0,
          y: 10
        }, {
          x: 5,
          y: 15
        }, {
          x: 10,
          y: 15
        }],
        backgroundColor: '#FC3F55'
      },
      {
        label: 'label3',
        data: [{
          x: 0,
          y: -15
        }, {
          x: 5,
          y: -10
        }, {
          x: 10,
          y: -20
        }],
        backgroundColor: '#FFBE3F'
      }],
    },
    options: {
      scales: {
        x: {
          display: false,
          position: 'bottom',
        },
        y: {
          stacked: true,
          display: false,
          position: 'left',
        },
      },
      plugins: {
        legend: false,
        title: false,
        tooltip: false,
        filler: true
      }
    },
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
