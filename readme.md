This is a fork of Chart.js by Nick Downie, http://www.chartjs.org.

Chart.js
=======
*Simple HTML5 Charts using the canvas element* [chartjs.org](http://www.chartjs.org)

Documentation
-------
You can find documentation at [chartjs.org/docs](http://www.chartjs.org/docs).

License
-------
Chart.js was taken down on the 19th March. It is now back online for good and IS available under the [MIT license](http://opensource.org/licenses/MIT).

Fork
-------

A few features have been added. See relevant samples pages for a demo. [View the new Chart types here.](http://www.caseyy.org/code/a-stem-fork-of-chart-js/)

### box-and-whisker plots (special case of bar charts)

A new chart type, implemented as a child of Bar charts.

CAYdenberg:

> Box plots seperate the data into 4 quartiles, which are represented
> in a "box-and-whisker" arrangement. The best way to calculate the quartiles is by 
> using the chart calculator, and pass the entire population as an array. Alternatively, 
> the "breakpoints" of each quartiles can be passed in the data object as [q0, q1, q2, q3, q4]

spilliams:

> The standard usage of box-and-whisker plots arranges data into the 4 quartiles. If any outliers are present in the standard data set, they **are included** in the box and/or whiskers.
> If you wish to introduce outliers separate from that dataset, provide them in an `outliers` option of the dataset. You may style them using configuration options. See the demo for code samples.
> (This allows "outliers" to be placed inside the box, in order to compare, for instance, one particular student's score next to the distribution of the rest of the class)

### scatter charts

A new chart type, implemented as a child of Line charts.

CAYdenberg:

> This is a scatter plot as a opposed to a line graph. X and Y data is 
> supplied seperately as two different arrays: xVal : [] and data : []. These arrays 
> should therefore be the same length. Labels (values on the x-axis) can now be supplied
> seperately from the actual data. Alternatively, the axis can be specified by the xScale
> information in the options.

### support for error bars in bar and line charts

Bar charts support error bars.

Line charts support error bars.

CAYdenberg:

> This is still a "line graph" in the
> traditional sense: X points are not supplied directly, but instead the x-axis
> represents a series of categories that are evenly spaced.

### a Chart Calculator

CAYdenberg:

> I have also added a Chart calculator, in 
> which an array is passed in place of a single datapoint. The position of 
> the data point is calculated from the average (or median) of the data in 
> the array and the error bars are calculated as range or Standard 
> Deviaiton.

### fill color functions

Added by spilliams

A dataset's `fillColor` option can now contain a function instead of just a static value. This is intended to allow individual bars (in the same dataset) of a bar chart to have different colors. It also enables bars to have different colors based on animation percentage.

Applies to bar charts and box-and-whisker plots, but no other chart type (yet).

### fill color arrays

Added by spilliams

If a dataset's `fillColor` option is an array, the context cycles through the array in an orderly fashion, recursing over each element (so `fillColor` could be an array of arrays, or a mixed array of strings and functions).

Applies to bar charts and box-and-whisker plots, but no other chart type (yet).

### value labels

Added by spilliams

There is now a feature to add value labels to a bar chart or box-and-whisker plot.

