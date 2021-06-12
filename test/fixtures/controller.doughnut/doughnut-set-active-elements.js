module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9248',
  config: {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [34, 33, 17, 16],
          backgroundColor: ['#D92323', '#E45757', '#ED8D8D', '#F5C4C4']
        }
      ]
    },
    options: {
      events: [], // for easier saving of the fixture only
      borderWidth: 0,
      hoverBorderWidth: 4,
      hoverBorderColor: 'black',
      cutout: '80%',
    }
  },
  options: {
    run(chart) {
      chart.setActiveElements([{datasetIndex: 0, index: 1}]);
      chart.update();
    }
  }
};
