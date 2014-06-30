---
title: Notes
anchor: notes
---

### Browser support
Browser support for the canvas element is available in all modern & major mobile browsers <a href="http://caniuse.com/canvas" target="_blank">(caniuse.com/canvas)</a>.

For IE8 & below, I would recommend using the polyfill ExplorerCanvas - available at <a href="https://code.google.com/p/explorercanvas/" target="_blank">https://code.google.com/p/explorercanvas/</a>. It falls back to Internet explorer's format VML when canvas support is not available. Example use:

```html
<head>
	<!--[if lte IE 8]>
		<script src="excanvas.js"></script>
	<![endif]-->
</head>
```

Usually I would recommend feature detection to choose whether or not to load a polyfill, rather than IE conditional comments, however in this case, VML is a Microsoft proprietary format, so it will only work in IE.

Some important points to note in my experience using ExplorerCanvas as a fallback.

- Initialise charts on load rather than DOMContentReady when using the library, as sometimes a race condition will occur, and it will result in an error when trying to get the 2d context of a canvas.
- New VML DOM elements are being created for each animation frame and there is no hardware acceleration. As a result animation is usually slow and jerky, with flashing text. It is a good idea to dynamically turn off animation based on canvas support. I recommend using the excellent <a href="http://modernizr.com/" target="_blank">Modernizr</a> to do this.
- When declaring fonts, the library explorercanvas requires the font name to be in single quotes inside the string. For example, instead of your scaleFontFamily property being simply "Arial", explorercanvas support, use "'Arial'" instead. Chart.js does this for default values.

### Bugs & issues

Please report these on the GitHub page - at <a href="https://github.com/nnnick/Chart.js" target="_blank">github.com/nnnick/Chart.js</a>. If you could include a link to a simple <a href="http://jsbin.com/" target="_blank">jsbin</a> or similar to demonstrate the issue, that'd be really helpful.


### Contributing
New contributions to the library are welcome, just a couple of guidelines:

- Tabs for indentation, not spaces please.
- Please ensure you're changing the individual files in `/src`, not the concatenated output in the `Chart.js` file in the root of the repo.
- Please check that your code will pass `jshint` code standards, `gulp jshint` will run this for you.
- Please keep pull requests concise, and document new functionality in the relevant `.md` file.
- Consider whether your changes are useful for all users, or if creating a Chart.js extension would be more appropriate.

### License
Chart.js is open source and available under the <a href="http://opensource.org/licenses/MIT" target="_blank">MIT license</a>.