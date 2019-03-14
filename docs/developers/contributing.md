# Contributing

New contributions to the library are welcome, but we ask that you please follow these guidelines:

- Before opening a PR for major additions or changes, please discuss the expected API and/or implementation by [filing an issue](https://github.com/chartjs/Chart.js/issues) or asking about it in the [Chart.js Slack](https://chartjs-slack.herokuapp.com/) #dev channel. This will save you development time by getting feedback upfront and make review faster by giving the maintainers more context and details.
- Consider whether your changes are useful for all users, or if creating a Chart.js [plugin](plugins.md) would be more appropriate.
- Check that your code will pass tests and `eslint` code standards. `gulp test` will run both the linter and tests for you.
- Add unit tests and document new functionality (in the `test/` and `docs/` directories respectively).
- Avoid breaking changes unless there is an upcoming major release, which are infrequent. We encourage people to write plugins for most new advanced features, and care a lot about backwards compatibility.
- We strongly prefer new methods to be added as private whenever possible. A method can be made private either by making a top-level `function` outside of a class or by prefixing it with `_` and adding `@private` JSDoc if inside a class. Public APIs take considerable time to review and become locked once implemented as we have limited ability to change them without breaking backwards compatibility. Private APIs allow the flexibility to address unforeseen cases.

## Joining the project

Active committers and contributors are invited to introduce yourself and request commit access to this project. We have a very active Slack community that you can join [here](https://chartjs-slack.herokuapp.com/). If you think you can help, we'd love to have you!

## Building and Testing

Chart.js uses <a href="https://gulpjs.com/" target="_blank">gulp</a> to build the library into a single JavaScript file.

Firstly, we need to ensure development dependencies are installed. With node and npm installed, after cloning the Chart.js repo to a local directory, and navigating to that directory in the command line, we can run the following:

```bash
> npm install
> npm install -g gulp-cli
```

This will install the local development dependencies for Chart.js, along with a CLI for the JavaScript task runner <a href="https://gulpjs.com/" target="_blank">gulp</a>.

The following commands are now available from the repository root:

```bash
> gulp build                // build dist files in ./dist
> gulp build --watch        // build and watch for changes
> gulp unittest             // run tests from ./test/specs
> gulp unittest --watch     // run tests and watch for source changes
> gulp unittest --coverage  // run tests and generate coverage reports in ./coverage
> gulp lint                 // perform code linting (ESLint)
> gulp test                 // perform code linting and run unit tests
> gulp docs                 // build the documentation in ./dist/docs
> gulp docs --watch         // starts the gitbook live reloaded server
```

More information can be found in [gulpfile.js](https://github.com/chartjs/Chart.js/blob/master/gulpfile.js).

### Image-Based Tests

Some display-related functionality is difficult to test via typical Jasmine units. For this reason, we introduced image-based tests ([#3988](https://github.com/chartjs/Chart.js/pull/3988) and [#5777](https://github.com/chartjs/Chart.js/pull/5777)) to assert that a chart is drawn pixel-for-pixel matching an expected image.

Generated charts in image-based tests should be **as minimal as possible** and focus only on the tested feature to prevent failure if another feature breaks (e.g. disable the title and legend when testing scales).

You can create a new image-based test by following the steps below:
- Create a JS file ([example](https://github.com/chartjs/Chart.js/blob/f7b671006a86201808402c3b6fe2054fe834fd4a/test/fixtures/controller.bubble/radius-scriptable.js)) or JSON file ([example](https://github.com/chartjs/Chart.js/blob/4b421a50bfa17f73ac7aa8db7d077e674dbc148d/test/fixtures/plugin.filler/fill-line-dataset.json)) that defines chart config and generation options.
- Add this file in `test/fixtures/{spec.name}/{feature-name}.json`.
- Add a [describe line](https://github.com/chartjs/Chart.js/blob/4b421a50bfa17f73ac7aa8db7d077e674dbc148d/test/specs/plugin.filler.tests.js#L10) to the beginning of `test/specs/{spec.name}.tests.js` if it doesn't exist yet.
- Run `gulp unittest --watch --inputs=test/specs/{spec.name}.tests.js`.
- Click the *"Debug"* button (top/right): a test should fail with the associated canvas visible.
- Right click on the chart and *"Save image as..."* `test/fixtures/{spec.name}/{feature-name}.png` making sure not to activate the tooltip or any hover functionality
- Refresh the browser page (`CTRL+R`): test should now pass
- Verify test relevancy by changing the feature values *slightly* in the JSON file.

Tests should pass in both browsers. In general, we've hidden all text in image tests since it's quite difficult to get them passing between different browsers. As a result, it is recommended to hide all scales in image-based tests. It is also recommended to disable animations. If tests still do not pass, adjust [`tolerance` and/or `threshold`](https://github.com/chartjs/Chart.js/blob/1ca0ffb5d5b6c2072176fd36fa85a58c483aa434/test/jasmine.matchers.js) at the beginning of the JSON file keeping them **as low as possible**.

When a test fails, the expected and actual images are shown. If you'd like to see the images even when the tests pass, set `"debug": true` in the JSON file.

## Bugs and Issues

Please report these on the GitHub page - at <a href="https://github.com/chartjs/Chart.js" target="_blank">github.com/chartjs/Chart.js</a>. Please do not use issues for support requests. For help using Chart.js, please take a look at the [`chartjs`](https://stackoverflow.com/questions/tagged/chartjs) tag on Stack Overflow.

Well structured, detailed bug reports are hugely valuable for the project.

Guidelines for reporting bugs:

 - Check the issue search to see if it has already been reported
 - Isolate the problem to a simple test case
 - Please include a demonstration of the bug on a website such as [JS Bin](https://jsbin.com/), [JS Fiddle](https://jsfiddle.net/), or [Codepen](https://codepen.io/pen/). ([Template](https://codepen.io/pen?template=JXVYzq)). If filing a bug against `master`, you may reference the latest code via https://www.chartjs.org/dist/master/Chart.min.js (changing the filename to point at the file you need as appropriate). Do not rely on these files for production purposes as they may be removed at any time.

Please provide any additional details associated with the bug, if it's browser or screen density specific, or only happens with a certain configuration or data.
