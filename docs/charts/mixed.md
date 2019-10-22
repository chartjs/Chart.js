# Mixed Chart Types

With Chart.js, it is possible to create mixed charts that are a combination of two or more different chart types. A common example is a bar chart that also includes a line dataset.

Creating a mixed chart starts with the initialization of a basic chart.

```javascript
var myChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
});
```

At this point we have a standard bar chart. Now we need to convert one of the datasets to a line dataset.

```javascript
var mixedChart = new Chart(ctx, {
    type: 'bar',
    data: {
        datasets: [{
            label: 'Bar Dataset',
            data: [10, 20, 30, 40]
        }, {
            label: 'Line Dataset',
            data: [50, 50, 50, 50],

            // Changes this dataset to become a line
            type: 'line'
        }],
        labels: ['January', 'February', 'March', 'April']
    },
    options: options
});
```

At this point we have a chart rendering how we'd like. It's important to note that the default options for a line chart are not merged in this case. Only the options for the default type are merged in. In this case, that means that the default options for a bar chart are merged because that is the type specified by the `type` field.

{% chartjs %}
{
    "type": "bar",
    "data": {
        "labels": [
            "January",
            "February",
            "March",
            "April"
        ],
        "datasets": [{
            "label": "Bar Dataset",
            "data": [10, 20, 30, 40],
            "borderColor": "rgb(255, 99, 132)",
            "backgroundColor": "rgba(255, 99, 132, 0.2)"
        }, {
            "label": "Line Dataset",
            "data": [50, 50, 50, 50],
            "type": "line",
            "fill": false,
            "borderColor": "rgb(54, 162, 235)"
        }]
    },
    "options": {
        "scales": {
            "yAxes": [{
                "ticks": {
                    "beginAtZero": true
                }
            }]
        }
    }
}
{% endchartjs %}

## Drawing order

 By default, datasets are drawn so that first one is top-most. This can be altered by specifying `order` option to datasets. `order` defaults to `0`.

 ```javascript
var mixedChart = new Chart(ctx, {
    type: 'bar',
    data: {
        datasets: [{
            label: 'Bar Dataset',
            data: [10, 20, 30, 40],
            // this dataset is drawn below
            order: 1
        }, {
            label: 'Line Dataset',
            data: [10, 10, 10, 10],
            type: 'line',
            // this dataset is drawn on top
            order: 2
        }],
        labels: ['January', 'February', 'March', 'April']
    },
    options: options
});
```
