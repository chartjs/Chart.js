Chart.js
=======
*Simple HTML5 Charts using the canvas element* [chartjs.org](http://www.chartjs.org)

Quick FYI
-------
I'm currently working on a big refactor of the library into a more object oriented structure. 

It'll have an extendable class structure for adding community developed chart types. By opening up components into Chart.js into extendable classes, it'll allow for much easier community driven library extensions rather than tacking on new features as required. The refactor will also feature a generisized version of the interaction layer introduced by Regaddi in his tooltips branch - https://github.com/nnnick/Chart.js/pull/51. On top of this, it'll include utility methods on each chart object, for updating, clearing and redrawing charts etc.

I haven't quite got the bandwidth right now to be juggling both issues/requests in master while redesigning all of the core code in Chart.js. By focusing on the refactor, it'll get done WAY quicker.

Extensibility will absolutely be at the core of the refactor, allowing for the development of complex extension modules, but also keeping a lightweight set of core code.

Hang tight - it'll be worth it. 

PS. If you're interested in reviewing some code or trying out writing extensions, shoot me an email.

Documentation
-------
You can find documentation at [chartjs.org/docs](http://www.chartjs.org/docs).

License
-------
Chart.js was taken down on the 19th March. It is now back online for good and IS available under MIT license.

Chart.js is available under the [MIT license] (http://opensource.org/licenses/MIT).
