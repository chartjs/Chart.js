# Contributing

New contributions to the library are welcome, but we ask that you please follow these guidelines:

- Use tabs for indentation, not spaces.
- Only change the individual files in `/src`.
- Check that your code will pass `eslint` code standards, `gulp lint` will run this for you.
- Check that your code will pass tests, `gulp test` will run tests for you.
- Keep pull requests concise, and document new functionality in the relevant `.md` file.
- Consider whether your changes are useful for all users, or if creating a Chart.js [plugin](plugins.md) would be more appropriate.

# Joining the project

 Active committers and contributors are invited to introduce yourself and request commit access to this project. We have a very active Slack community that you can join [here](https://chart-js-automation.herokuapp.com/). If you think you can help, we'd love to have you!

# Building and Testing

Chart.js uses <a href="http://gulpjs.com/" target="_blank">gulp</a> to build the library into a single JavaScript file.

Firstly, we need to ensure development dependencies are installed. With node and npm installed, after cloning the Chart.js repo to a local directory, and navigating to that directory in the command line, we can run the following:

```bash
> npm install
> npm install -g gulp
```

This will install the local development dependencies for Chart.js, along with a CLI for the JavaScript task runner <a href="http://gulpjs.com/" target="_blank">gulp</a>.

The following commands are now available from the repository root:

```bash
> gulp build                // build Chart.js in ./dist
> gulp unittest             // run tests from ./test/specs
> gulp unittest --watch     // run tests and watch for source changes
> gulp unittest --coverage  // run tests and generate coverage reports in ./coverage
> gulp lint                 // perform code linting (ESLint)
> gulp test                 // perform code linting and run unit tests
> gulp docs                 // build the documentation in ./dist/docs
```

More information can be found in [gulpfile.js](https://github.com/chartjs/Chart.js/blob/master/gulpfile.js).

# Bugs and Issues

Please report these on the GitHub page - at <a href="https://github.com/chartjs/Chart.js" target="_blank">github.com/chartjs/Chart.js</a>. Please do not use issues for support requests. For help using Chart.js, please take a look at the [`chartjs`](http://stackoverflow.com/questions/tagged/chartjs) tag on Stack Overflow.

Well structured, detailed bug reports are hugely valuable for the project.

Guidelines for reporting bugs:

 - Check the issue search to see if it has already been reported
 - Isolate the problem to a simple test case
 - Please include a demonstration of the bug on a website such as [JS Bin](http://jsbin.com/), [JS Fiddle](http://jsfiddle.net/), or [Codepen](http://codepen.io/pen/). ([Template](http://codepen.io/pen?template=JXVYzq))

Please provide any additional details associated with the bug, if it's browser or screen density specific, or only happens with a certain configuration or data.
