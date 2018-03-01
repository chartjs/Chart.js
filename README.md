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

### Selecting the Correct Build

Chart.js provides two different builds for you to choose: `Stand-Alone Build`, `Bundled Build`.

#### Stand-Alone Build
Files:
* `dist/Chart.js`
* `dist/Chart.min.js`

The stand-alone build includes Chart.js as well as the color parsing library. If this version is used, you are required to include [Moment.js](http://momentjs.com/) before Chart.js for the functionality of the time axis.

#### Bundled Build
Files:
* `dist/Chart.bundle.js`
* `dist/Chart.bundle.min.js`

The bundled build includes Moment.js in a single file. You should use this version if you require time axes and want to include a single file. You should not use this build if your application already included Moment.js. Otherwise, Moment.js will be included twice which results in increasing page load time and possible version compatability issues.

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
