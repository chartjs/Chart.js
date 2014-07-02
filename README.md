# Chart.js

*Simple HTML5 Charts using the canvas element* [chartjs.org](http://www.chartjs.org)

## Documentation

You can find documentation at [chartjs.org/docs](http://www.chartjs.org/docs). The markdown files that build the site are available under `/docs`. Please note - in some of the json examples of configuration you might notice some liquid tags - this is just for the generating the site html, please disregard.

## License

Chart.js is available under the [MIT license](http://opensource.org/licenses/MIT).

## Bugs & issues

When reporting bugs or issues, if you could include a link to a simple [jsbin](http://jsbin.com) or similar demonstrating the issue, that'd be really helpful.


## Contributing
New contributions to the library are welcome, just a couple of guidelines:

- Tabs for indentation, not spaces please.
- Please ensure you're changing the individual files in `/src`, not the concatenated output in the `Chart.js` file in the root of the repo.
- Please check that your code will pass `jshint` code standards, `gulp jshint` will run this for you.
- Please keep pull requests concise, and document new functionality in the relevant `.md` file.
- Consider whether your changes are useful for all users, or if creating a Chart.js extension would be more appropriate.
- Please avoid committing in the build Chart.js & Chart.min.js file, as it causes conflicts when merging.
