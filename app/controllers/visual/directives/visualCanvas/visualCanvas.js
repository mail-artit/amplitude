
/*jslint browser: true, devel: true*/
/*global angular, amplitude*/

(function () {

    'use strict';

    amplitude.directive('visualCanvas', ['$window', function ($window) {

        return {
            restrict: 'E',
            link: function ($scope, $element) {

                //unused jslint error
                $scope.toString();

                var canvas = angular.element('<canvas>')[0],
                    ctx = canvas.getContext("2d");

                $element[0].appendChild(canvas);

                function draw() {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                function resize() {
                    canvas.width = $element[0].parentNode.clientWidth;
                    canvas.height = $element[0].parentNode.clientHeight;
                    draw();
                }

                $window.onresize = resize;

                resize();
            }
        };

    }]);

}());