import React, {useEffect} from 'react';
import {Chart, DoughnutController, ArcElement} from 'chart.js';
import {merge} from 'chart.js/helpers';

Chart.register(DoughnutController, ArcElement);

function App() {
  useEffect(() => {
    const c = Chart.getChart('myChart');
    if (c) {
      c.destroy();
    }

    merge({a: 1}, {b: 2});

    // eslint-disable-next-line no-new
    new Chart('myChart', {
      type: 'doughnut',
      data: {
        labels: ['Chart', 'JS'],
        datasets: [{
          data: [2, 3]
        }]
      }
    });
  }, []);

  return (
    <div className="App">
      <canvas id="myChart"></canvas>
    </div>
  );
}

export default App;
