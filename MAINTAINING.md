# Maintaining
## Release Process
Chart.js relies on [Travis CI](https://travis-ci.org/) to automate the library [releases](https://github.com/chartjs/Chart.js/releases).

### Releasing a New Version

1. Update the release version on [GitHub](https://github.com/chartjs/Chart.js/releases/new) for the release drafted by the `release-drafter` tool
2. Publish the release
3. follow the build process on [GitHub Actions](https://github.com/chartjs/Chart.js/actions?query=workflow%3A%22Node.js+Package%22)

Creation of this tag triggers a new build:

* `Chart.js.zip` package is generated, containing dist files and examples
* `dist/*.js` and `Chart.js.zip` are attached to the GitHub release (downloads)
* A new npm package is published on [npmjs](https://www.npmjs.com/package/chart.js)

Finally, [cdnjs](https://cdnjs.com/libraries/Chart.js) is automatically updated from the npm release.

### Further Reading

* [GitHub Action releases](https://github.com/chartjs/Chart.js/pull/7891)
* [dist/* files](https://github.com/chartjs/Chart.js/issues/3033)
* [cdnjs npm auto update](https://github.com/cdnjs/cdnjs/pull/8401)
