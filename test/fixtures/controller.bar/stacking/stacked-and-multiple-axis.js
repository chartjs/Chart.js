module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Dataset 1',
          data: [100, 90, 100, 50, 99, 87, 34],
          backgroundColor: 'rgba(255,99,132,0.8)',
          stack: 'a',
          xAxisID: 'x'
        },
        {
          label: 'Dataset 2',
          data: [20, 25, 30, 32, 58, 14, 12],
          backgroundColor: 'rgba(54,162,235,0.8)',
          stack: 'b',
          xAxisID: 'x2'
        },
        {
          label: 'Dataset 3',
          data: [80, 30, 40, 60, 70, 80, 47],
          backgroundColor: 'rgba(75,192,192,0.8)',
          stack: 'a',
          xAxisID: 'x3'
        },
        {
          label: 'Dataset 4',
          data: [80, 30, 40, 60, 70, 80, 47],
          backgroundColor: 'rgba(54,162,235,0.8)',
          stack: 'a',
          xAxisID: 'x3'
        },
      ]
    },
    options: {
      plugins: false,
      barThickness: 'flex',
      scales: {
        x: {
          stacked: true,
          display: false,
        },
        x2: {
          labels: ['January 2024', 'February 2024', 'March 2024', 'April 2024', 'May 2024', 'June 2024', 'July 2024'],
          stacked: true,
          display: false,
        },
        x3: {
          labels: ['January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025', 'July 2025'],
          stacked: true,
          display: false,
        },
        y: {
          stacked: true,
          display: false,
        }
      }
    }
  },
  options: {
  }
};
