'use strict';

var category = require('./scale.category');
var linear = require('./scale.linear');
var logarithmic = require('./scale.logarithmic');
var radialLinear = require('./scale.radialLinear');
var time = require('./scale.time');

module.exports = {
	category: category,
	linear: linear,
	logarithmic: logarithmic,
	radialLinear: radialLinear,
	time: time
};
