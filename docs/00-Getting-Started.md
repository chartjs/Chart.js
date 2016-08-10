---
title: Getting started
anchor: getting-started
---

### Download Chart.js

You can download the latest version of [Chart.js on GitHub](https://github.com/chartjs/Chart.js/releases/latest) or just use these [Chart.js CDN](https://cdnjs.com/libraries/Chart.js) links. 
If you download or clone the repository, you must run `gulp build` to generate the dist files. Chart.js no longer comes with prebuilt release versions, so an alternative option to downloading the repo is **strongly** advised.

### Installation

#### npm

```bash
npm install chart.js --save
```

#### bower

Bower support has been dropped since version 2.2.0 but you can still use Chart.js with Bower thanks to [bower-npm-resolver](https://www.npmjs.com/package/bower-npm-resolver).

First, add the resolver in your .bowerrc file:
```json
{
  "resolvers": [
    "bower-npm-resolver"
  ]
}
```

Then:

```bash
npm install -g bower-npm-resolver
bower install npm:chart.js --save
```

### Selecting the Correct Build

Chart.js provides two different builds that are available for your use. The `Chart.js` and `Chart.min.js` files include Chart.js and the accompanying color parsing library. If this version is used and you require the use of the time axis, [Moment.js](http://momentjs.com/) will need to be included before Chart.js.

The `Chart.bundle.js` and `Chart.bundle.min.js` builds include Moment.js in a single file. This version should be used if you require time axes and want a single file to include, select this version. Do not use this build if your application already includes Moment.js. If you do, Moment.js will be included twice, increasing the page load time and potentially introducing version issues.

### Usage

To import Chart.js using an old-school script tag:

```html
<script src="Chart.js"></script>
<script>
    var myChart = new Chart({...})
</script>
```

To import Chart.js using an awesome module loader:

```javascript

// Using CommonJS
var Chart = require('src/chart.js')
var myChart = new Chart({...})

// ES6
import Chart from 'src/chart.js'
let myChart = new Chart({...})

// Using requirejs
require(['path/to/Chartjs'], function(Chart){
 var myChart = new Chart({...})
})

```

### Creating a Chart

To create a chart, we need to instantiate the `Chart` class. To do this, we need to pass in the node, jQuery instance, or 2d context of the canvas of where we want to draw the chart. Here's an example.

```html
<canvas id="myChart" width="400" height="400"></canvas>
```

```javascript
// Any of the following formats may be used
var ctx = document.getElementById("myChart");
var ctx = document.getElementById("myChart").getContext("2d");
var ctx = $("#myChart");
```

Once you have the element or context, you're ready to instantiate a pre-defined chart-type or create your own!

The following example instantiates a bar chart showing the number of votes for different colors and the y-axis starting at 0.

```html
<canvas id="myChart" width="400" height="400"></canvas>
<script>
var ctx = document.getElementById("myChart");
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

It's that easy to get started using Chart.js! From here you can explore the many options that can help you customise your charts with scales, tooltips, labels, colors, custom actions, and much more.

There are many examples of Chart.js that are available in the `/samples` folder of `Chart.js.zip` that is attatched to every [release](https://github.com/chartjs/Chart.js/releases).
