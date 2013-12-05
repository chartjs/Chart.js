/*global describe, expect, it, Chart, beforeEach*/
describe('Chart.js', function(){
    
    describe('validateArguments function', function(){
        
        var context;
        
        beforeEach( function(){
            
            context = {
                canvas: {
                    style : {
                        width: 100,
                        height: 100
                    },
                    width: 100,
                    height: 100,
                },
                scale : function(){}
            };    
        })
        
        it('should throw an error when using a non-valid animationEasing string on a Pie chart', function(){
            
            expect(function(){
                new Chart(context).Pie({},{animationEasing : 'fooPie'});
            }).to.throw('fooPie is not a valid animationEasing option.  Please visit http://www.chartjs.org/docs/ for documentation.');
        });
        
        it('should throw an error when using a non-valid animationEasing string on a Bar chart', function(){
            
            expect(function(){
                new Chart(context).Bar({},{animationEasing : 'fooBar'});
            }).to.throw('fooBar is not a valid animationEasing option.  Please visit http://www.chartjs.org/docs/ for documentation.');
        });
        
        it('should throw an error when using a non-valid animationEasing string on a Doughnut chart', function(){
            
            expect(function(){
                new Chart(context).Doughnut({},{animationEasing : 'fooDoughnut'});
            }).to.throw('fooDoughnut is not a valid animationEasing option.  Please visit http://www.chartjs.org/docs/ for documentation.');
        });
        
        it('should throw an error when using a non-valid animationEasing string on a Line chart', function(){
            
            expect(function(){
                new Chart(context).Line({},{animationEasing : 'fooLine'});
            }).to.throw('fooLine is not a valid animationEasing option.  Please visit http://www.chartjs.org/docs/ for documentation.');
        });
        
        it('should throw an error when using a non-valid animationEasing string on a Polar Area chart', function(){
            
            expect(function(){
                new Chart(context).PolarArea({},{animationEasing : 'fooPolarArea'});
            }).to.throw('fooPolarArea is not a valid animationEasing option.  Please visit http://www.chartjs.org/docs/ for documentation.');
        });
        
        it('should throw an error when using a non-valid animationEasing string on a Radar chart', function(){
            
            expect(function(){
                new Chart(context).Radar({},{animationEasing : 'fooRadar'});
            }).to.throw('fooRadar is not a valid animationEasing option.  Please visit http://www.chartjs.org/docs/ for documentation.');
        });
    });
});