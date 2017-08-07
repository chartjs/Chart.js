# Chart.js

[![Build Status](https://travis-ci.org/chartjs/Chart.js.svg?branch=master)](https://travis-ci.org/chartjs/Chart.js) [![Code Climate](https://codeclimate.com/github/chartjs/Chart.js/badges/gpa.svg)](https://codeclimate.com/github/chartjs/Chart.js) [![Coverage Status](https://coveralls.io/repos/github/chartjs/Chart.js/badge.svg?branch=master)](https://coveralls.io/github/chartjs/Chart.js?branch=master)

[![Chart.js on Slack](https://img.shields.io/badge/slack-Chart.js-blue.svg)](https://chart-js-automation.herokuapp.com/)

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
