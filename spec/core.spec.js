(function () {
  'use strict';

  describe('Chart.js', function () {
    it('provides a global Chart object', function () {
      expect(Chart).to.be.a('function');
    });

    it('provides global defaults', function () {
      expect(Chart.defaults.global).to.be.an('object');
      expect(Chart.defaults.global).to.have.keys(
        'animation',
        'animationSteps',
        'animationEasing',
        'showScale',
        'scaleOverride',
        'scaleSteps',
        'scaleStepWidth',
        'scaleStartValue',
        'scaleLineColor',
        'scaleLineWidth',
        'scaleShowLabels',
        'scaleLabel',
        'scaleIntegersOnly',
        'scaleBeginAtZero',
        'scaleFontFamily',
        'scaleFontSize',
        'scaleFontStyle',
        'scaleFontColor',
        'responsive',
        'showTooltips',
        'tooltipEvents',
        'tooltipFillColor',
        'tooltipFontFamily',
        'tooltipFontSize',
        'tooltipFontStyle',
        'tooltipFontColor',
        'tooltipTitleFontFamily',
        'tooltipTitleFontSize',
        'tooltipTitleFontStyle',
        'tooltipTitleFontColor',
        'tooltipYPadding',
        'tooltipXPadding',
        'tooltipCaretSize',
        'tooltipCornerRadius',
        'tooltipXOffset',
        'tooltipTemplate',
        'multiTooltipTemplate',
        'multiTooltipKeyBackground',
        'onAnimationProgress',
        'onAnimationComplete'
      );
    });

    it('has different chart types', function () {
      expect(Chart.types).to.be.an('object');
      expect(Chart.types).to.have.keys(
        'Bar',
        'Doughnut',
        'Pie',
        'Line',
        'PolarArea',
        'Radar'
      );
    });

    it('has helper methods', function () {
      expect(Chart.helpers).to.be.an('object');
      expect(Chart.helpers).to.have.keys(
        'each',
        'clone',
        'extend',
        'merge',
        'indexOf',
        'inherits',
        'noop',
        'uid',
        'warn',
        'amd',
        'isNumber',
        'max',
        'min',
        'cap',
        'getDecimalPlaces',
        'radians',
        'getAngleFromPoint',
        'aliasPixel',
        'splineCurve',
        'calculateOrderOfMagnitude',
        'calculateScaleRange',
        'template',
        'generateLabels',
        'easingEffects',
        'requestAnimFrame',
        'cancelAnimFrame',
        'animationLoop',
        'getRelativePosition',
        'addEvent',
        'removeEvent',
        'bindEvents',
        'unbindEvents',
        'getMaximumSize',
        'retinaScale',
        'clear',
        'fontString',
        'longestText',
        'drawRoundedRectangle'
      );
    });
  });

  describe('Chart.js helper method', function () {
    var h = Chart.helpers;

    describe('each', function () {
      var each = h.each;
      
      it('should be a function', function () {
        expect(each).to.be.a('function');
      });

      it('should iterate over values in an Array', function () {
        var sourceArray = [1, 2, 3],
            newArray = [],
            result = each(sourceArray, function (item) {
              newArray.push(item += 1);
            });
        expect(newArray).to.eql([2, 3, 4]);
      });

      it('should iterate over values in an Object', function () {
        var sourceObj = {
              a: 1,
              b: 2,
              c: 3
            };

        each(sourceObj, function (v, k) {
          sourceObj[k] = v + 1;
        });

        expect(sourceObj).to.eql({
          a: 2,
          b: 3,
          c: 4
        });
      });
    });

    describe('clone', function () {

    });

    describe('extend', function () {

    });

    describe('merge', function () {

    });

    describe('indexOf', function () {

    });

    describe('inherits', function () {

    });

    describe('noop', function () {

    });

    describe('uid', function () {

    });

    describe('warn', function () {

    });

    describe('amd', function () {

    });

    describe('isNumber', function () {

    });

    describe('max', function () {

    });

    describe('min', function () {

    });

    describe('cap', function () {

    });

    describe('getDecimalPlaces', function () {

    });

    describe('radians', function () {

    });

    describe('getAngleFromPoint', function () {

    });

    describe('aliasPixel', function () {

    });

    describe('splineCurve', function () {

    });

    describe('calculateOrderOfMagnitude', function () {

    });

    describe('calculateScaleRange', function () {

    });

    describe('template', function () {

    });

    describe('generateLabels', function () {

    });

    describe('easingEffects', function () {

    });

    describe('requestAnimFrame', function () {

    });

    describe('cancelAnimFrame', function () {

    });

    describe('animationLoop', function () {

    });

    describe('getRelativePosition', function () {

    });

    describe('addEvent', function () {

    });

    describe('removeEvent', function () {

    });

    describe('bindEvents', function () {

    });

    describe('unbindEvents', function () {

    });

    describe('getMaximumSize', function () {

    });

    describe('retinaScale', function () {

    });

    describe('clear', function () {

    });

    describe('fontString', function () {

    });

    describe('longestText', function () {

    });

    describe('drawRoundedRectangle', function () {

    });
  });
})();