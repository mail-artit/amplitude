
/*jslint browser: true*/
/*global angular, amplitude, Slider*/

(function () {

    'use strict';

    amplitude.directive("slider", function () {

        return {
            restrict : 'A',
            scope : {
                model : '=ngModel'
            },
            'link': function ($scope, $element) {

                var data = document.createElement('input'),
                    slider = new Slider($element[0], data),
                    setWhileSliding = 1;

                slider.onchange = function (sender) {
                    $scope.model.value = slider.getValue();
                    if ($scope.model.onchange) {
                        $scope.model.onchange(sender);
                    }
                };

                $scope.$watch('model.max', function (max) {
                    slider.setMaximum(max);
                });

                $scope.$watch('model.value', function (value) {
                    if (setWhileSliding || !slider.isMoving()) {
                        slider.setValue(value);
                    }
                });

                $scope.$watch('model.background', function (background) {
                    var line = $element[0].children[0];
                    line.children[0].style.background = background;
                });

                $scope.$watch('model.stickTo', function (stickTo) {
                    if (!stickTo) {
                        return;
                    }
                    slider.setStickTo(stickTo[0], stickTo[1]);
                });

                $scope.$watch('model.handler', function (handler) {
                    if (!handler && handler !== 0) {
                        return;
                    }
                    var h = $element[0].children[1];
                    if (!handler) {
                        h.style.visibility = 'hidden';
                        slider.setDisabled(1);
                    } else {
                        h.style.visibility = 'visible';
                        slider.setDisabled(0);
                    }
                    slider.setValue(0);
                });

                $scope.$watch('model.setWhileSliding', function ($setWhileSliding) {
                    if (!setWhileSliding && setWhileSliding !== 0) {
                        return;
                    }
                    setWhileSliding = $setWhileSliding;
                });

            }
        };
    });
}());