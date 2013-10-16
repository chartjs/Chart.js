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

###Update - 8th September
Just a quick update on the refactor. 

Just wanted to let you guys know it's making really good progress, and it'll be well worth the wait.

The new version is being broken up into Chart type modules, with each of the current 6 chart types using documented and extendable classes and helper methods from the Chart.js core. This means the community will be able to build new chart types using existing components, or extend existing types to do something a bit different. 

By splitting the different charts into modules will mean the ability to use AMD if appropriate, but I'll also be writing a simple web interface for concatenating chart types into a minified production ready custom build.

The syntax for creating charts **will not change**, so the upgrade should be a drop in replacement, but give you the ability to have a whole new level of interactivity and animated data updates.

Right now I've wrote 80% of the core, and refactored the Doughnut and Pie charts, and I'm a good way through the Line and Bar charts. I hope to have the new version ready to release with some new docs late September/early October.

I know PR and issues are racking up in the repo, and I'll do my best to sort them ASAP, but I think this update is really important for creating flexibility and extensibility to cater for these new features in an elegant way, rather than introducing scope creep into an architecture that wasn't designed to deliver this extra functionality.

Big thanks for all the support - it's been totally overwhelming.

###Another Quick Update - 16th October
First of all - my apologies, early October has drifted away from me and we're moving towards late October. This last month has been really unexpectedly busy, and I've had a lot of stuff going on, so I haven't quite managed to find as much time to work on Chart.js as I'd hoped.

In terms of an updated ETA, I'm really aiming for a pre-November release, and I'll be having some late nights and a few days off to try my best to make this happen.

Again, really appreciate the support and cheers for your patience for the new version.


Documentation
-------
You can find documentation at [chartjs.org/docs](http://www.chartjs.org/docs).

License
-------
Chart.js was taken down on the 19th March. It is now back online for good and IS available under MIT license.

Chart.js is available under the [MIT license] (http://opensource.org/licenses/MIT).
