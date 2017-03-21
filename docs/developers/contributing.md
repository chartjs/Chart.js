# Contributing

New contributions to the library are welcome, but we ask that you please follow these guidelines:

- Use tabs for indentation, not spaces.
- Only change the individual files in `/src`.
- Check that your code will pass `eslint` code standards, `gulp lint` will run this for you.
- Check that your code will pass tests, `gulp test` will run tests for you.
- Keep pull requests concise, and document new functionality in the relevant `.md` file.
- Consider whether your changes are useful for all users, or if creating a Chart.js plugin would be more appropriate.

# Building Chart.js

Chart.js uses <a href="http://gulpjs.com/" target="_blank">gulp</a> to build the library into a single JavaScript file.

Firstly, we need to ensure development dependencies are installed. With node and npm installed, after cloning the Chart.js repo to a local directory, and navigating to that directory in the command line, we can run the following:

```bash
npm install
npm install -g gulp
```

This will install the local development dependencies for Chart.js, along with a CLI for the JavaScript task runner <a href="http://gulpjs.com/" target="_blank">gulp</a>.

Now, we can run the `gulp build` task.

```bash
gulp build
```

# Bugs & issues

Please report these on the GitHub page - at <a href="https://github.com/chartjs/Chart.js" target="_blank">github.com/chartjs/Chart.js</a>. If you could include a link to a simple <a href="http://jsbin.com/" target="_blank">jsbin</a> or similar to demonstrate the issue, that'd be really helpful.

