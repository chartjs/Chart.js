import {Chart, IBarControllerConfiguration} from '../..';

const bar = new Chart(document.createElement('canvas'), {
    type: 'bar',
    data: {
        labels: ['A', 'B'],
        datasets: [
            {
                data: [1,2],
            }
        ]
    }
});

const barTyped = new Chart<number, string, IBarControllerConfiguration<number, string>>(document.createElement('canvas'), {
    type: 'bar',
    data: {
        labels: ['A', 'B'],
        datasets: [
            {
                data: [1,2],
            }
        ]
    }
});