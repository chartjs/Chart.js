# Chart.js

This project was fork from : https://github.com/nnnick/Chart.js.


*Simple HTML5 Charts using the canvas element* [chartjs.org](http://www.chartjs.org)

## Documentation

You can find documentation at [chartjs.org/docs](http://www.chartjs.org/docs/). The markdown files that build the site are available under `/docs`. Please note - in some of the json examples of configuration you might notice some liquid tags - this is just for the generating the site html, please disregard.

## Bugs, issues and contributing

Before submitting an issue or a pull request to the project, please take a moment to look over the [contributing guidelines](https://github.com/nnnick/Chart.js/blob/master/CONTRIBUTING.md) first.

For support using Chart.js, please post questions with the [`chartjs` tag on Stack Overflow](http://stackoverflow.com/questions/tagged/chartjs).

## License

Chart.js is available under the [MIT license](http://opensource.org/licenses/MIT).

## What's new in my branch ?

### Doughnut chart

Two options are now available :
 - **startAngle** : A number between 0 and 2 (both included). Start your chart in your wanted angle. (1.5 = North, 1 = West, 0.5 = South, 0 = East);
 - **totalAngle** : A number between 0 and 2 (both included). It's corresponding to the total chart angle. (2 = 360°, 1 = 180°, 0 = 0°).

The methods that find angle (dataset) under mouse coordinates is more generic. Now, the test of angle is on `angle - 2Pi` or `angle` or `angle + 2Pi`. So, all cases are tested.

Look at `example/test.html` to a preview. 

### Line chart

Two options are now available :
 - **onlyOneToolTip** : A boolean. Prevent from a lot of tooltips. The correction take only the nearest tooltip from your mouse coordinates;
 - **scaleGridLineStep** : A number. Prevent from a lot of Y-Labels. Display on the Y-Scall only a text on *scaleGridLineStep* steps. (index % scaleGridLineStep == 0).

### Default values
All originals values are like before my change, so upgrade ChartJS will not broken user's charts.
 - **startAngle** : 1.5;
 - **totalAngle** : 2;
 - **onlyOneToolTip** : false;
 - **scaleGridLineStep** : 1;
