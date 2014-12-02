
/*jslint browser: true*/
/*global angular, amplitude*/

(function () {

    'use strict';

    amplitude.directive("scrollingText", function () {

        return {
            restrict: 'A',
            scope: {
                model: "=ngModel"
            },
            link: function ($scope, $element) {

                var str = "",
                    index = 0,
                    paused = 1,
                    timer = null,
                    result = null,
                    labelStill = null;

                function calcResult() {

                    var dup = null;

                    result = str.substr(index % str.length, 31);

                    if (result.length < 31) {
                        dup = new Array(Math.floor((31 - result.length + 1) / result.length + 3)).join(str);
                        result = result + dup.substr(0, 31 - str.length + index);
                    }

                }

                function tick() {

                    calcResult();

                    if (labelStill === null) {
                        $element.html(result);
                    } else {
                        $element.html(labelStill);
                    }

                    index += 1;

                    if (!paused) {
                        timer = window.setTimeout(tick, 100);
                    }

                }

                $scope.$watch('model.text', function (text) {

                    if (text === null) {
                        text = $scope.model.default;
                    } else {
                        text = text.trim().replace(/[\x00-\x1F\x7F-\x9F]/gi, '');
                        $element.html(text);
                    }

                    if (str !== text + ' *** ') {
                        str = text + ' *** ';
                    }

                });

                $scope.$watch('model.still', function (still) {
                    if (paused) {
                        if (still === null) {
                            $element.html($scope.model.default);
                        } else {
                            $element.html(still);
                        }
                    }
                    labelStill = still;
                });

                $scope.$watch('model.state', function (state) {
                    switch (state) {
                    case "paused":
                        paused = 1;
                        window.clearTimeout(timer);
                        break;
                    case "stopped":
                        index = 0;
                        paused = 1;
                        window.clearTimeout(timer);
                        break;
                    case "scrolling":
                        if (paused) {
                            paused = 0;
                            tick();
                        }
                        break;
                    }
                });
            }
        };
    });
}());