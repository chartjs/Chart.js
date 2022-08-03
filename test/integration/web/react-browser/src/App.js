import { useEffect } from 'react';
import {Chart, DoughnutController, ArcElement} from 'chart.js';

Chart.register(DoughnutController, ArcElement);

function App() {
  useEffect(() => {
    const c = Chart.getChart('myChart');
    if(c) c.destroy();

    new Chart('myChart', {
      type: 'doughnut',
      data: {
        labels: ['FF', 'DD'],
        datasets: [{
          data: [2, 3]
        }]
      }
    })
  }, [])

  return (
    <div className="App">
      <canvas id="myChart"></canvas>
    </div>
  );
}

export default App;
