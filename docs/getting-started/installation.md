# Installation

Chart.js can be installed as a dependency of your application via [npm](https://www.npmjs.com/package/chart.js) or [bower](https://libraries.io/bower/chartjs). It is recommended to get Chart.js this way.

## Including as a dependency in your build

### Optional Chart.js dependencies

If you are using the time scale you will need to include either [Moment.js](https://momentjs.com) or [Luxon](https://moment.github.io/luxon/docs/manual/install.html#node) in your dependencies. If you do not include Moment.js you will receive a warning that it is missing from your build. You may ignore this warning if you are not using the time scale or have included Luxon.

### npm
[![npm](https://img.shields.io/npm/v/chart.js.svg?style=flat-square&maxAge=600)](https://npmjs.com/package/chart.js)
[![npm](https://img.shields.io/npm/dm/chart.js.svg?style=flat-square&maxAge=600)](https://npmjs.com/package/chart.js)

```bash
npm install chart.js --save
```

### Bower
[![bower](https://img.shields.io/bower/v/chartjs.svg?style=flat-square&maxAge=600)](https://libraries.io/bower/chartjs)

```bash
bower install chart.js --save
```

## Pre-built scripts

Chart.js provides two different builds for you to choose: `Stand-Alone Build`, `Bundled Build`.

### Stand-Alone Build
Files:
* `dist/Chart.js`
* `dist/Chart.min.js`

The stand-alone build includes Chart.js as well as the color parsing library. If this version is used, you are required to include [Moment.js](http://momentjs.com/) before Chart.js for the functionality of the time axis.

### Bundled Build
Files:
* `dist/Chart.bundle.js`
* `dist/Chart.bundle.min.js`

The bundled build includes Moment.js in a single file. You should use this version if you require time axes and want to include a single file. You should not use this build if your application already included Moment.js. Otherwise, Moment.js will be included twice which results in increasing page load time and possible version compatibility issues. The Moment.js version in the bundled build is private to Chart.js so if you want to use Moment.js yourself, it's better to use Chart.js (non bundled) and import Moment.js manually.

You can get these builds from the CDNs below.

### CDNJS
[![cdnjs](https://img.shields.io/cdnjs/v/Chart.js.svg?style=flat-square&maxAge=600)](https://cdnjs.com/libraries/Chart.js)

Chart.js built files are available on [CDNJS](https://cdnjs.com/):

https://cdnjs.com/libraries/Chart.js

### jsDelivr
[![jsdelivr](https://img.shields.io/npm/v/chart.js.svg?label=jsdelivr&style=flat-square&maxAge=600)](https://cdn.jsdelivr.net/npm/chart.js@latest/dist/) [![jsdelivr hits](https://data.jsdelivr.com/v1/package/npm/chart.js/badge)](https://www.jsdelivr.com/package/npm/chart.js)

Chart.js built files are also available through [jsDelivr](https://www.jsdelivr.com/):

https://www.jsdelivr.com/package/npm/chart.js?path=dist

### Github
[![github](https://img.shields.io/github/release/chartjs/Chart.js.svg?style=flat-square&maxAge=600)](https://github.com/chartjs/Chart.js/releases/latest)

You can download the latest version of [Chart.js on GitHub](https://github.com/chartjs/Chart.js/releases/latest).

If you download or clone the repository, you must [build](../developers/contributing.md#building-and-testing) Chart.js to generate the dist files. Chart.js no longer comes with prebuilt release versions, so an alternative option to downloading the repo is **strongly** advised.
