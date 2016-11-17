Contributing to Chart.js
========================

Contributions to Chart.js are welcome and encouraged, but please have a look through the guidelines in this document before raising an issue, or writing code for the project.


Using issues
------------

The [issue tracker](https://github.com/chartjs/Chart.js/issues) is the preferred channel for reporting bugs, requesting new features and submitting pull requests.

If you're suggesting a new chart type, please take a look at [writing new chart types](https://github.com/chartjs/Chart.js/blob/master/docs/09-Advanced.md#writing-new-chart-types) in the documentation or consider [creating a plugin](https://github.com/chartjs/Chart.js/blob/master/docs/09-Advanced.md#creating-plugins).

To keep the library lightweight for everyone, it's unlikely we'll add many more chart types to the core of Chart.js, but issues are a good medium to design and spec out how new chart types could work and look.

Please do not use issues for support requests. For help using Chart.js, please take a look at the [`chartjs`](http://stackoverflow.com/questions/tagged/chartjs) tag on Stack Overflow.


Reporting bugs
--------------

Well structured, detailed bug reports are hugely valuable for the project.

Guidelines for reporting bugs:

 - Check the issue search to see if it has already been reported
 - Isolate the problem to a simple test case
 - Please include a demonstration of the bug on a website such as [JS Bin](http://jsbin.com/), [JS Fiddle](http://jsfiddle.net/), or [Codepen](http://codepen.io/pen/). ([Template](http://codepen.io/pen?template=JXVYzq))

Please provide any additional details associated with the bug, if it's browser or screen density specific, or only happens with a certain configuration or data.


Local development
-----------------

Run `npm install` to install all the libraries, then run `gulp dev --test` to build and run tests as you make changes.


Pull requests
-------------

Clear, concise pull requests are excellent at continuing the project's community driven growth. But please review [these guidelines](https://github.com/blog/1943-how-to-write-the-perfect-pull-request) and the guidelines below before starting work on the project.

Be advised that **Chart.js 1.0.2 is in feature-complete status**. Pull requests adding new features to the 1.x branch will be disregarded.

Guidelines:

 - Please create an issue first and/or talk with a team member:
   - For bugs, we can discuss the fixing approach
   - For enhancements, we can discuss if it is within the project scope and avoid duplicate effort
 - Please make changes to the files in [`/src`](https://github.com/chartjs/Chart.js/tree/master/src), not `Chart.js` or `Chart.min.js` in the repo root directory, this avoids merge conflicts
 - Tabs for indentation, not spaces please
 - If adding new functionality, please also update the relevant `.md` file in [`/docs`](https://github.com/chartjs/Chart.js/tree/master/docs)
 - Please make your commits in logical sections with clear commit messages

Joining the project
-------------
 - Active committers and contributors are invited to introduce yourself and request commit access to this project.  Please send an email to hello@nickdownie.com or file an issue.
 - We have a very active Slack community that you can join [here](https://chart-js-automation.herokuapp.com/). If you think you can help, we'd love to have you!

License
-------

By contributing your code, you agree to license your contribution under the [MIT license](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md).
