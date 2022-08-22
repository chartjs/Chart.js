# Utils

## Disclaimer
The Utils file contains multiple helper functions that the chart.js sample pages use to generate charts.
These functions are subject to change, including but not limited to breaking changes without prior notice.

Because of this please don't rely on this file in production environments.

## Functions

<<< @/scripts/utils.js

[File on github](https://github.com/chartjs/Chart.js/blob/master/docs/scripts/utils.js)

## Components

Some of the samples make reference to a `components` object. This is an artifact of using a module bundler to build the samples. The creation of that components object is shown below. If chart.js is included as a browser script, these items are accessible via the `Chart` object, i.e `Chart.Tooltip`.

<<< @/scripts/components.js

[File on github](https://github.com/chartjs/Chart.js/blob/master/docs/scripts/components.js)
