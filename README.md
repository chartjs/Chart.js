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

## Project Overview

Chart.js is a free, open-source JavaScript library for making HTML-based charts. Chart.js provides a set of frequently used chart types, plugins, and customization options. In addition to a reasonable set of [built-in chart types](https://www.chartjs.org/docs/latest/charts/area.html), you can use additional community-maintained [chart types](https://github.com/chartjs/awesome#charts). On top of that, it’s possible to combine several chart types into a mixed chart (essentially, blending multiple chart types into one on the same canvas).

Chart.js comes with built-in TypeScript typings and is compatible with all popular [JavaScript frameworks](https://github.com/chartjs/awesome#javascript) including [React](https://github.com/reactchartjs/react-chartjs-2), [Vue](https://github.com/reactchartjs/react-chartjs-2), [Svelte](https://github.com/SauravKanchan/svelte-chartjs), and [Angular](https://github.com/valor-software/ng2-charts). You can use Chart.js directly or leverage well-maintained wrapper packages that allow for a more native integration with your frameworks of choice.

## Documentation

All the links point to the new version 4 of the lib.

- [Introduction](https://www.chartjs.org/docs/latest/)
- [Getting Started](https://www.chartjs.org/docs/latest/getting-started/index)
- [General](https://www.chartjs.org/docs/latest/general/data-structures)
- [Configuration](https://www.chartjs.org/docs/latest/configuration/index)
- [Charts](https://www.chartjs.org/docs/latest/charts/line)
- [Axes](https://www.chartjs.org/docs/latest/axes/index)
- [Developers](https://www.chartjs.org/docs/latest/developers/index)
- [Popular Extensions](https://github.com/chartjs/awesome)
- [Samples](https://www.chartjs.org/samples/)

In case you are looking for an older version of the docs, you will have to specify the specific version in the url like this: [https://www.chartjs.org/docs/2.9.4/](https://www.chartjs.org/docs/2.9.4/)

## Installation

Here are the methods to install Chart.js:

- ### Using npm

  Copy and paste the following command into CLI to download Chart.js using npm in your project.

  ```
    npm install chart.js
  ```

- ### Using CDN

  Using CDN to install and use Chart.js in your project is one of the fastest and efficient way. First, copy the latest CDN link from CDN website:
  [https://cdnjs.com/libraries/Chart.js](https://cdnjs.com/libraries/Chart.js)

  From the above link, copy the URL that has **_Chart.min.js_** at the end and paste it into the src attribute of script tag.

  ```
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.min.js"></script>
  ```

- ### Using jsDelivr

  Chart.js can also be installed using jsDelivr. Simply follow the link: [https://www.jsdelivr.com/package/npm/chart.js?path=dist](https://www.jsdelivr.com/package/npm/chart.js?path=dist)

  Copy the URL from the install section and paste it into src atribute of script tag.

  ```
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  ```

- ### Using GitHub

  You can download the latest version of [Chart.js on GitHub](https://github.com/chartjs/Chart.js/releases/tag/v4.4.0).

  If you download or clone the repository, you must build Chart.js to generate the dist files. Chart.js no longer comes with prebuilt release versions, so an alternative option to downloading the repo is strongly advised.

Still confused? Here's a [step-by-step](https://www.chartjs.org/docs/latest/getting-started/usage.html) guide on how to use Chart.js in your projects.

## Contributing

Instructions on building and testing Chart.js can be found in [the documentation](https://www.chartjs.org/docs/master/developers/contributing.html#building-and-testing). Before submitting an issue or a pull request, please take a moment to look over the [contributing guidelines](https://www.chartjs.org/docs/master/developers/contributing) first. For support, please post questions on [Stack Overflow](https://stackoverflow.com/questions/tagged/chart.js) with the `chart.js` tag.

## License

Chart.js is available under the [MIT license](LICENSE.md).
