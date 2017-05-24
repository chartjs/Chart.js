# Chart.js

[![Chart.js on Slack](https://img.shields.io/badge/slack-Chart.js-blue.svg)](https://chart-js-automation.herokuapp.com/)

## Installation

You can download the latest version of Chart.js from the [GitHub releases](https://github.com/chartjs/Chart.js/releases/latest) or use a [Chart.js CDN](https://cdnjs.com/libraries/Chart.js). Detailed installation instructions can be found on the [installation](./getting-started/installation.md) page.

## Creating a Chart

It's easy to get started with Chart.js. All that's required is the script included in your page along with a single `<canvas>` node to render the chart.

In this example, we create a bar chart for a single dataset and render that in our page. You can see all the ways to use Chart.js in the [usage documentation](./getting-started/usage.md)
```html
<canvas id="myChart" width="400" height="400"></canvas>
<script>
var ctx = document.getElementById("myChart").getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
</script>
```

## Contributing

Before submitting an issue or a pull request to the project, please take a moment to look over the [contributing guidelines](https://github.com/chartjs/Chart.js/blob/master/docs/developers/contributing.md) first.

For support using Chart.js, please post questions with the [`chartjs` tag on Stack Overflow](http://stackoverflow.com/questions/tagged/chartjs).

## License

Chart.js is available under the [MIT license](http://opensource.org/licenses/MIT).
