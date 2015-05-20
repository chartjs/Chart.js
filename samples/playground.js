(function() {

    var module = angular.module('app', []);

    module.controller('mainController', function($scope, $timeout) {
        angular.extend($scope, {

            chart: {},
            chartTypes: chartTypes(),

            init: init,
            randomizeData: randomizeData,
        });


        init();



        function init() {
            if ($scope._chart) {
                $scope._chart.destroy();
            }
            $scope.ctx = $('canvas')[0].getContext("2d");
            buildData();
            buildChart();

            $scope.$watch('options', function(val) {
                try {
                    angular.extend($scope.chart.options, JSON.parse(val));
                } catch (e) {
                    console.log(e);
                }
            }, true);

            $scope.$watch('chart.options', function() {
                if ($scope._chart) {
                    $scope._chart.update();
                }
            }, true);
        }

        function chartTypes() {
            return [{
                name: 'Line/Scatter',
                value: 'Line/Scatter',
                selected: true
            }, {
                name: 'Bar',
                value: 'Bar',
            }, {
                name: 'Pie/Doughnut',
                value: 'Pie/Doughnut',
            }, {
                name: 'Polar',
                value: 'Polar',
            }, {
                name: 'Radar',
                value: 'Radar',
            }];
        }



        function buildData() {
            $scope.chart.data = groupData();
            $scope.chart.options = {
                stacked: true,
                hoverMode: 'label'
            };
            $scope.options = stringify($scope.chart.options);
        }

        function buildChart() {
            $scope._chart = new Chart($scope.ctx)[$scope.chartType || 'Line']($scope.chart);
        }

        function stringify(o) {
            var cache = [];
            var result = JSON.stringify(o, function(key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        // Circular reference found, discard key
                        return;
                    }
                    // Store value in our collection
                    cache.push(value);
                }
                return value;
            }, 1);
            cache = null; // Enable garbage collection
            return result;
        }


        function groupData() {
            return {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "Dataset 1",
                    data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()],
                    backgroundColor: randomColor(0.8),
                }, {
                    label: "Dataset 2",
                    data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()],
                    backgroundColor: randomColor(0.8),
                }, {
                    label: "Dataset 3",
                    data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()],
                    backgroundColor: randomColor(0.8),
                }]
            };
        }

        function flatData() {
            return {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "My First dataset",
                    data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()]
                }, {
                    label: "My Second dataset",
                    data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()]
                }]
            };
        }

        function randomizeData() {

            angular.forEach($scope.chart.data.datasets, function(dataset) {

                dataset.data = [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()];
                dataset.backgroundColor = randomColor(.8);
                dataset.borderColor = randomColor(0.7);
                dataset.pointBackgroundColor = randomColor(1);
                dataset.pointBorderColor = randomColor(1);


                $scope._chart.update();
            });
        }




        function randomScalingFactor() {
            return Math.round(Math.random() * 100 * (Math.random() > 0.5 ? -1 : 1));
        }

        function randomColor(opacity) {
            return 'rgba(' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + (typeof opacity != "undefined" ? opacity : '.3') + ')';
        }

    });

})();
