# Multi Series Pie

```js chart-editor
// <block:setup:1>
const DATA_COUNT = 5;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

const labels = Utils.months({count: 7});
const data = {
  labels: ['Overall Yay', 'Overall Nay', 'Group A Yay', 'Group A Nay', 'Group B Yay', 'Group B Nay', 'Group C Yay', 'Group C Nay'],
  datasets: [
    {
      backgroundColor: ['#AAA', '#777'],
      data: [21, 79]
    },
    {
      backgroundColor: ['hsl(0, 100%, 60%)', 'hsl(0, 100%, 35%)'],
      data: [33, 67]
    },
    {
      backgroundColor: ['hsl(100, 100%, 60%)', 'hsl(100, 100%, 35%)'],
      data: [20, 80]
    },
    {
      backgroundColor: ['hsl(180, 100%, 60%)', 'hsl(180, 100%, 35%)'],
      data: [10, 90]
    }
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'pie',
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          generateLabels: function(chart) {
            // Get the default label list
            const original = Chart.overrides.pie.plugins.legend.labels.generateLabels;
            const labelsOriginal = original.call(this, chart);

            // Build an array of colors used in the datasets of the chart
            let datasetColors = chart.data.datasets.map(function(e) {
              return e.backgroundColor;
            });
            datasetColors = datasetColors.flat();

            // Modify the color and hide state of each label
            labelsOriginal.forEach(label => {
              // There are twice as many labels as there are datasets. This converts the label index into the corresponding dataset index
              label.datasetIndex = (label.index - label.index % 2) / 2;

              // The hidden state must match the dataset's hidden state
              label.hidden = !chart.isDatasetVisible(label.datasetIndex);

              // Change the color to match the dataset
              label.fillStyle = datasetColors[label.index];
            });

            return labelsOriginal;
          }
        },
        onClick: function(mouseEvent, legendItem, legend) {
          // toggle the visibility of the dataset from what it currently is
          legend.chart.getDatasetMeta(
            legendItem.datasetIndex
          ).hidden = legend.chart.isDatasetVisible(legendItem.datasetIndex);
          legend.chart.update();
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const labelIndex = (context.datasetIndex * 2) + context.dataIndex;
            return context.chart.data.labels[labelIndex] + ': ' + context.formattedValue;
          }
        }
      }
    }
  },
};
// </block:config>

module.exports = {
  config: config,
};
```

## Docs
* [Doughnut and Pie Charts](../../charts/doughnut.md)
* [Options](../../general/options.md)
  * [Scriptable Options](../../general/options.md#scriptable-options)