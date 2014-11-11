# Chart.js

*This is an extension of Chart.js(http://www.chartjs.org) which supports/will support:*

1. Error bars (on bar and line charts)
1. Scatter plots
1. Box plots
1. Trendlines (on scatter plots and line charts)

## Documentation

You can find documentation for Chart.js at [chartjs.org/docs](http://www.chartjs.org/docs/). Usage of the extension is noted below.

## Error Bars

Including error bars is extremely simple. Download *this* version of Chart.js and include it in your site. To add error bars, include an array called `error` (of the same length as the `data` array) in each dataset.

Additional options:

		//String - direction of the error bars. "up", "down", or "both"
		errorDir : "both",

		//Number - stroke width of the error bars
		errorStrokeWidth : 1,

		//Number - ratio of the width of the error bar caps to the width of the bar
		errorCapWidth : 0.75,
		//For line charts, errorCapWidth is the ratio of the width of the error bar
		//caps to the radius of the points, and the default is 2.5.
		
## Compatibility

This repo is compatible with @nnnick/Chart.js, so even if you are already using Chart.js on your site, switching to my version will not harm anything. I am not changing the core, so new updates to there will simply be merged in here.

## Other features

A previous version (based on the old, non-API version of Chart.js) also supported scatter plots, box plots, and trendlines. This version of the project is available in the "old" branch.

If you'd like to contribute, please push to the develop branch. I am not updating the build files (or documentation) there, so push to the individual src files. Also, do not modify Chart.Core.js - any new core functions should go in Chart.Stem.js.

Any new code MUST maintain compatibility with @nnnick/Chart.js.

## Roadmap

1. Create box plot chart type
1. Create scatter plot chart type
1. Add trendline feature
1. Add a calculator so that values for error bars etc. can be determined on the fly
1. Fix the scaling to account for all the new features (so they don't literally go off the charts)
1. Include error in tooltips (?)
1. Create a new site

## License

Chart.js, and this exension, are available under the [MIT license](http://opensource.org/licenses/MIT).

## Bugs & issues

When reporting bugs or issues, if you could include a link to a simple [jsbin](http://jsbin.com) or similar demonstrating the issue, that'd be really helpful.
