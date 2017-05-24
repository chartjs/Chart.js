# Installation
Chart.js can be installed via npm or bower. It is recommended to get Chart.js this way.

## npm

```bash
npm install chart.js --save
```

## Bower

```bash
bower install chart.js --save
```

## CDN
or just use these [Chart.js CDN](https://cdnjs.com/libraries/Chart.js) links.


## Github
You can download the latest version of [Chart.js on GitHub](https://github.com/chartjs/Chart.js/releases/latest).

If you download or clone the repository, you must [build](../developers/contributing.md#building-chartjs) Chart.js to generate the dist files. Chart.js no longer comes with prebuilt release versions, so an alternative option to downloading the repo is **strongly** advised.

# Selecting the Correct Build

Chart.js provides two different builds that are available for your use.

## Stand-Alone Build
Files:
* `dist/Chart.js`
* `dist/Chart.min.js`

This version only includes Chart.js. If this version is used and you require the use of the time axis, [Moment.js](http://momentjs.com/) will need to be included before Chart.js.

## Bundled Build
Files:
* `dist/Chart.bundle.js`
* `dist/Chart.bundle.min.js`

The bundled version includes Moment.js built into the same file. This version should be used if you wish to use time axes and want a single file to include. Do not use this build if your application already includes Moment.js. If you do, Moment.js will be included twice, increasing the page load time and potentially introducing version issues.