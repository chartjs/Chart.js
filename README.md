<p align="center">
  <a href="https://www.chartjs.org/" target="_blank">
    <img src="https://www.chartjs.org/media/logo-title.svg" alt="https://www.chartjs.org/"><br/>
  </a>
    Simple yet flexible JavaScript charting for designers & developers
</p>

<p align="center">
    <a href="https://www.chartjs.org/docs/latest/getting-started/installation.html"><img src="https://img.shields.io/github/release/chartjs/Chart.js.svg?style=flat-square&maxAge=600" alt="Downloads"></a>
    <a href="https://github.com/chartjs/Chart.js/actions?query=workflow%3ACI+branch%3Amaster"><img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/chartjs/Chart.js/ci.yml?branch=master&style=flat-square"></a>
    <a href="https://coveralls.io/github/chartjs/Chart.js?branch=master"><img src="https://img.shields.io/coveralls/chartjs/Chart.js.svg?style=flat-square&maxAge=600" alt="Coverage"></a>
    <a href="https://github.com/chartjs/awesome"><img src="https://awesome.re/badge-flat2.svg" alt="Awesome"></a>
    <a href="https://discord.gg/HxEguTK6av"><img src="https://img.shields.io/badge/discord-chartjs-blue?style=flat-square&maxAge=3600" alt="Discord"></a>
</p>

## Documentation

All the links point to the new version 4 of the lib.

* [Introduction](https://www.chartjs.org/docs/latest/)
* [Getting Started](https://www.chartjs.org/docs/latest/getting-started/index)
* [General](https://www.chartjs.org/docs/latest/general/data-structures)
* [Configuration](https://www.chartjs.org/docs/latest/configuration/index)
* [Charts](https://www.chartjs.org/docs/latest/charts/line)
* [Axes](https://www.chartjs.org/docs/latest/axes/index)
* [Developers](https://www.chartjs.org/docs/latest/developers/index)
* [Popular Extensions](https://github.com/chartjs/awesome)
* [Samples](https://www.chartjs.org/samples/)

In case you are looking for an older version of the docs, you will have to specify the specific version in the url like this: [https://www.chartjs.org/docs/2.9.4/](https://www.chartjs.org/docs/2.9.4/)

## Contributing

Instructions on building and testing Chart.js can be found in [the documentation](https://www.chartjs.org/docs/master/developers/contributing.html#building-and-testing). Before submitting an issue or a pull request, please take a moment to look over the [contributing guidelines](https://www.chartjs.org/docs/master/developers/contributing) first. For support, please post questions on [Stack Overflow](https://stackoverflow.com/questions/tagged/chart.js) with the `chart.js` tag.



##Project Overview

Chart.js is a free and open-source JavaScript library for creating HTML5 canvas charts. It is one of the most popular charting libraries available, and is used by thousands of web developers worldwide.

Chart.js is known for its simplicity and flexibility. It is easy to learn and use, even for beginners. Chart.js also offers a wide range of features and customization options, making it suitable for creating a wide variety of charts.

##Installation

To install Chart.js, you can use the following steps:

1. Add the Chart.js library to your HTML page. You can do this by adding the following script tag:

```
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>


2. Include the Chart.js CSS file in your HTML page. You can do this by adding the following link tag:

html
<link href="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/Chart.min.css" rel="stylesheet">
```
####OR

use 
`npm install chart.js`
 If u want to avoid avoid downloading the library manually
                        

##Simple Chart Usage Example

The following code shows a simple example of how to create a line chart using Chart.js:

```
HTML
<canvas id="myChart"></canvas>


JS
const canvas = document.querySelector('#myChart');
const ctx = canvas.getContext('2d');

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [{
      label: 'Sales',
      data: [100, 200, 300, 400, 500, 600]
    }]
  }
});

``````
This code will create a line chart with the label "Sales" and the data points 100, 200, 300, 400, 500, and 600.

**Configuration Options**


Chart.js offers a wide range of configuration options for customizing charts. You can configure the chart type, data, labels, colors, and more. You can also add titles, legends, and other elements to your charts.

For more information on configuration options, please see the Chart.js documentation: https://www.chartjs.org/docs/.

**API Reference**

The Chart.js API provides a number of methods and properties for controlling and interacting with charts. For example, you can use the API to update the chart data, change the chart type, and add or remove chart elements.

For more information on the Chart.js API, please see the Chart.js API reference: https://www.chartjs.org/docs/latest/developers/api.html.

**Migration Reference**

If you are upgrading from an older version of Chart.js, please see the Chart.js migration reference: https://www.chartjs.org/docs/latest/migration/v4-migration.html for information on the changes that have been made.

##Conclusion

Chart.js is a powerful and flexible JavaScript library for creating HTML5 canvas charts. It is easy to learn and use, and offers a wide range of features and customization options. Chart.js is a great choice for web developers of all skill levels who need to create data visualizations for their websites and web applications.


To preview the Markdown text, you can use a Markdown editor or viewer. For example, you can use the following website to preview the Markdown text: https://dillinger.io/

##Sample Charts

Here are a few sample charts created using Chart.js :

  <img src="https://www.tibco.com/sites/tibco/files/media_entity/2022-01/doughnut-chart-example.svg" alt="pie chart representation">

  <img src="https://images.twinkl.co.uk/tw1n/image/private/t_630/u/ux/barchart_ver_1.jpg" alt="Bar chart representation">


  <img src="https://dctqed2pc42y2.cloudfront.net/overleaf-assets/images/spillkakeeng.svg" alt="pie chart representation">

Join the Chart.js Discord Community to get help and support from other Chart.js users: [Chart.js Discord Community](https://discord.com/invite/HxEguTK6av)



## License

Chart.js is available under the [MIT license](LICENSE.md).
