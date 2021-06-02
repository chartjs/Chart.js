# Getting Started

Let's get started using Chart.js!

First, we need to have a canvas in our page. It's recommended to give the chart its own container for [responsiveness](../configuration/responsive.md).

```html
<div>
  <canvas id="myChart"></canvas>
</div>
```

Now that we have a canvas we can use, we need to include Chart.js in our page.

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

Now, we can create a chart. We add a script to our page:

```js chart-editor
// <block:setup:1>
const labels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
];
const data = {
  labels: labels,
  datasets: [{
    label: 'My First dataset',
    backgroundColor: 'rgb(255, 99, 132)',
    borderColor: 'rgb(255, 99, 132)',
    data: [0, 10, 5, 2, 20, 30, 45],
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data,
  options: {}
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

Finally, render the chart using our configuration:

```html
<script>
  // === include 'setup' then 'config' above ===

  var myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
</script>
```

It's that easy to get started using Chart.js! From here you can explore the many options that can help you customise your charts with scales, tooltips, labels, colors, custom actions, and much more.

All our examples are [available online](/samples/) but you can also download the `Chart.js.zip` archive attached to every [release](https://github.com/chartjs/Chart.js/releases) to experiment with our samples locally from the `/samples` folder.

To run the samples locally you first have to install all the necessary packages using the `npm ci` command, after this you can run `npm run docs:dev` to build the documentation. As soon as the build is done, you can go to [http://localhost:8080/samples/](http://localhost:8080/samples/) to see the samples.
