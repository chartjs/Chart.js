# Getting Started

Let's get started using Chart.js!

First, we need to have a canvas in our page.

```html
<canvas id="myChart"></canvas>
```

Now that we have a canvas we can use, we need to include Chart.js in our page.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js"></script>
```

Now, we can create a chart. We add a script to our page:

```javascript
var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
            label: "My First dataset",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    },

    // Configuration options go here
    options: {}
});
```

It's that easy to get started using Chart.js! From here you can explore the many options that can help you customise your charts with scales, tooltips, labels, colors, custom actions, and much more.

There are many examples of Chart.js that are available in the `/samples` folder of `Chart.js.zip` that is attatched to every [release](https://github.com/chartjs/Chart.js/releases).