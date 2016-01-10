/* 
	gulpfile.js
	-------------------------------
	Tasks are defined in gulpfile.js/tasks and are automatically loaded below

*/

var requireDir = require('require-dir');

requireDir('./tasks', {
	recurse: true
});