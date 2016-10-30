/* global window: false */
'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;

	Chart.defaults.global.animation = {
		duration: 1000,
		easing: 'easeOutQuart',
		onProgress: helpers.noop,
		onComplete: helpers.noop
	};

	Chart.Animation = Chart.Element.extend({
		currentStep: null, // the current animation step
		numSteps: 60, // default number of steps
		easing: '', // the easing to use for this animation
		render: null, // render function used by the animation service

		onAnimationProgress: null, // user specified callback to fire on each step of the animation
		onAnimationComplete: null // user specified callback to fire when the animation finishes
	});

	Chart.animationService = {
		frameDuration: 17,
		animations: [],
		dropFrames: 0,
		request: null,

		/**
		 * @function Chart.animationService.addAnimation
		 * @param chartInstance {ChartController} the chart to animate
		 * @param animationObject {IAnimation} the animation that we will animate
		 * @param duration {Number} length of animation in ms
		 * @param lazy {Boolean} if true, the chart is not marked as animating to enable more responsive interactions
		 */
		addAnimation: function(chartInstance, animationObject, duration, lazy) {
			var me = this;

			if (!lazy) {
				chartInstance.animating = true;
			}

			for (var index = 0; index < me.animations.length; ++index) {
				if (me.animations[index].chartInstance === chartInstance) {
					// replacing an in progress animation
					me.animations[index].animationObject = animationObject;
					return;
				}
			}

			me.animations.push({
				chartInstance: chartInstance,
				animationObject: animationObject
			});

			// If there are no animations queued, manually kickstart a digest, for lack of a better word
			if (me.animations.length === 1) {
				me.requestAnimationFrame();
			}
		},
		// Cancel the animation for a given chart instance
		cancelAnimation: function(chartInstance) {
			var index = helpers.findIndex(this.animations, function(animationWrapper) {
				return animationWrapper.chartInstance === chartInstance;
			});

			if (index !== -1) {
				this.animations.splice(index, 1);
				chartInstance.animating = false;
			}
		},
		requestAnimationFrame: function() {
			var me = this;
			if (me.request === null) {
				// Skip animation frame requests until the active one is executed.
				// This can happen when processing mouse events, e.g. 'mousemove'
				// and 'mouseout' events will trigger multiple renders.
				me.request = helpers.requestAnimFrame.call(window, function() {
					me.request = null;
					me.startDigest();
				});
			}
		},
		startDigest: function() {
			var me = this;

			var startTime = Date.now();
			var framesToDrop = 0;

			if (me.dropFrames > 1) {
				framesToDrop = Math.floor(me.dropFrames);
				me.dropFrames = me.dropFrames % 1;
			}

			var i = 0;
			while (i < me.animations.length) {
				if (me.animations[i].animationObject.currentStep === null) {
					me.animations[i].animationObject.currentStep = 0;
				}

				me.animations[i].animationObject.currentStep += 1 + framesToDrop;

				if (me.animations[i].animationObject.currentStep > me.animations[i].animationObject.numSteps) {
					me.animations[i].animationObject.currentStep = me.animations[i].animationObject.numSteps;
				}

				me.animations[i].animationObject.render(me.animations[i].chartInstance, me.animations[i].animationObject);
				if (me.animations[i].animationObject.onAnimationProgress && me.animations[i].animationObject.onAnimationProgress.call) {
					me.animations[i].animationObject.onAnimationProgress.call(me.animations[i].chartInstance, me.animations[i]);
				}

				if (me.animations[i].animationObject.currentStep === me.animations[i].animationObject.numSteps) {
					if (me.animations[i].animationObject.onAnimationComplete && me.animations[i].animationObject.onAnimationComplete.call) {
						me.animations[i].animationObject.onAnimationComplete.call(me.animations[i].chartInstance, me.animations[i]);
					}

					// executed the last frame. Remove the animation.
					me.animations[i].chartInstance.animating = false;

					me.animations.splice(i, 1);
				} else {
					++i;
				}
			}

			var endTime = Date.now();
			var dropFrames = (endTime - startTime) / me.frameDuration;

			me.dropFrames += dropFrames;

			// Do we have more stuff to animate?
			if (me.animations.length > 0) {
				me.requestAnimationFrame();
			}
		}
	};
};
