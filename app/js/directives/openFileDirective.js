
/*jslint browser: true*/
/*global angular, amplitude*/

(function () {

    'use strict';

    amplitude.directive("openFile", function () {
        return {
            restrict: 'A',
            scope: {
                model: "=ngModel"
            },
            link: function ($scope, $element) {
                $element.on("change", function () {
                    $scope.model.parse($element[0].files, function () {
                        $element.val(null);
                    });
                });
            }
        };
    });

}());