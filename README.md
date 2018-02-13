# hudl/Chart.js
*Hudl maintained fork of* [Chart.js](http://www.chartjs.org)  

To install add the following to your `package.json` `dependencies`  
`"chart.js": "https://github.com/hudl/Chart.js/archive/v{version-number}.tar.gz",`  
Then `npm install`

## Hudl features
### Centerd x-axis labels on time series

[Implementation](https://github.com/hudl/Chart.js/pull/2)

#### How to use
This works on time series charts with evenly spaced data points and unevenly spaced tick marks  
![image](https://user-images.githubusercontent.com/8510089/36158893-0d37224c-10a3-11e8-94cb-247ce3766634.png)

* Offset tick marks from labels  
`options.scales.xAxes.gridLines.offestGridLines: true`

* Set x-axis distribution type to `series`  
`options.scales.xAxes.distribution: 'series'`

* Make the source of the x-axis ticks `data`  
`options.scales.xAxes.ticks.source: 'data'`

* At this point you should have a bunch of duplicate labels. To get rid of the duplicates you'll need to pass the following callback function to `options.scales.xAxes.ticks.callback`  
```javascript
// Place to store the previous label
let previousLabel;

const callback = value => {
  if (value === previous) {
    previous = value;

    // returning '' leaves the tick mark and sets the label blank
    // returning null will remove the label and the tick mark
    return '';
  }

  previous = value;
  return value;
}
```

* Center the remaining labels  
Add `centerLabels: true` to `scales.xAxes.ticks` within your `options` object.

## Making changes
*Warning*: Changes to this repo must be made using ES5 syntax. `node_modules` is not run through babel before being built.  

## Creating a new release
Once you've merged your branch with master you will need to create a new release for use. You can do this by going to the main `hudl/Chart.js` page and clicking on the releases tab. Then you can click on `Draft a new release`, increment the version number, and give your release a name. Don't forget to update the version number in the `package.json` of the project using `hudl/Chart.js`!

# Chart.js

[![travis](https://img.shields.io/travis/chartjs/Chart.js.svg?style=flat-square&maxAge=60)](https://travis-ci.org/chartjs/Chart.js) [![coveralls](https://img.shields.io/coveralls/chartjs/Chart.js.svg?style=flat-square&maxAge=600)](https://coveralls.io/github/chartjs/Chart.js?branch=master) [![codeclimate](https://img.shields.io/codeclimate/maintainability/chartjs/Chart.js.svg?style=flat-square&maxAge=600)](https://codeclimate.com/github/chartjs/Chart.js) [![slack](https://img.shields.io/badge/slack-chartjs-blue.svg?style=flat-square&maxAge=3600)](https://chartjs-slack.herokuapp.com/)

*Simple HTML5 Charts using the canvas element* [chartjs.org](http://www.chartjs.org)

## Installation

You can download the latest version of Chart.js from the [GitHub releases](https://github.com/chartjs/Chart.js/releases/latest) or use a [Chart.js CDN](https://cdnjs.com/libraries/Chart.js).

To install via npm:

```bash
npm install chart.js --save
```

To install via bower:
```bash
bower install chart.js --save
```

#### Selecting the Correct Build

Chart.js provides two different builds that are available for your use. The `Chart.js` and `Chart.min.js` files include Chart.js and the accompanying color parsing library. If this version is used and you require the use of the time axis, [Moment.js](http://momentjs.com/) will need to be included before Chart.js.

The `Chart.bundle.js` and `Chart.bundle.min.js` builds include Moment.js in a single file. This version should be used if you require time axes and want a single file to include, select this version. Do not use this build if your application already includes Moment.js. If you do, Moment.js will be included twice, increasing the page load time and potentially introducing version issues.

## Documentation

You can find documentation at [www.chartjs.org/docs](http://www.chartjs.org/docs). The markdown files that build the site are available under `/docs`. Previous version documentation is available at [www.chartjs.org/docs/latest/developers/#previous-versions](http://www.chartjs.org/docs/latest/developers/#previous-versions).

## Contributing

Before submitting an issue or a pull request, please take a moment to look over the [contributing guidelines](https://github.com/chartjs/Chart.js/blob/master/docs/developers/contributing.md) first. For support using Chart.js, please post questions with the [`chartjs` tag on Stack Overflow](http://stackoverflow.com/questions/tagged/chartjs).

## Building
Instructions on building and testing Chart.js can be found in [the documentation](https://github.com/chartjs/Chart.js/blob/master/docs/developers/contributing.md#building-and-testing).

## Thanks
- [BrowserStack](https://browserstack.com) for allowing our team to test on thousands of browsers.
- [@n8agrin](https://twitter.com/n8agrin) for the Twitter handle donation.

## License

Chart.js is available under the [MIT license](http://opensource.org/licenses/MIT).
