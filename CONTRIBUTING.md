Contributing
============

New contributions to the library are welcome, just a couple of guidelines:

 * Tabs for indentation, not spaces please.
 * Please ensure you're changing the individual files in /src, not the concatenated output in the Chart.js file in the root of the repo.
 * Please check that your code will pass jshint code standards, `gulp jshint` will run this for you.
 * Please keep pull requests concise, and document new functionality in the relevant .md file.
 * Consider whether your changes are useful for all users, or if creating a Chart.js extension would be more appropriate.
 * Please avoid committing in the build Chart.js & Chart.min.js file, as it causes conflicts when merging.
 * Please make all Pull Requests to ```dev``` branch

New Chart Types
===============

Chart.js is designed to be modular. See http://www.chartjs.org/docs/#advanced-usage-writing-new-chart-types

All discussion of new chart types (horizontal bar charts, X-Y scatter plot, etc.) should be done in the Chart.js Google Group at https://groups.google.com/forum/#!forum/chartjs-user-discussion This will get the most exposure for getting people to help define requirements, complete programming and documentation of your vision.

Please do not request new chart types in the project issues. Fully implemented, documented, and useful new charts may be maintained in a new repository. Later, we may add a link to selected external repositories from this project.
