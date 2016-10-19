# Maintaining
## Release Process
Chart.js relies on [Travis CI](https://travis-ci.org/) to automate the library [releases](https://github.com/chartjs/Chart.js/releases).

### Releasing a New Version

1. draft release notes on [GitHub](https://github.com/chartjs/Chart.js/releases/new) for the upcoming tag
1. update `master` `package.json` version using [semver](http://semver.org/) semantic
1. merge `master` into the `release` branch
1. follow the build process on [Travis CI](https://travis-ci.org/chartjs/Chart.js)

> **Note:** if `master` is merged in `release` with a `package.json` version that already exists, the tag
creation fails and the release process is aborted.

### Automated Tasks
Merging into the `release` branch kicks off the automated release process:

* build of the `dist/*.js` files
* `bower.json` is generated from `package.json`
* `dist/*.js` and `bower.json` are added to a detached branch
* a tag is created from the `package.json` version
* tag (with dist files) is pushed to GitHub

Creation of this tag triggers a new build:

* `Chart.js.zip` package is generated, containing dist files and examples
* `dist/*.js` and `Chart.js.zip` are attached to the GitHub release (downloads)
* a new npm package is published on [npmjs](https://www.npmjs.com/package/chart.js)

Finally, [cdnjs](https://cdnjs.com/libraries/Chart.js) is automatically updated from the npm release.

### Further Reading

* [Travis GitHub releases](https://github.com/chartjs/Chart.js/pull/2555)
* [Bower support and dist/* files](https://github.com/chartjs/Chart.js/issues/3033)
* [cdnjs npm auto update](https://github.com/cdnjs/cdnjs/pull/8401)
