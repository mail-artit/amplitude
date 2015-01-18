
/*jslint browser: true, devel: true*/
/*global amplitude*/

(function () {

    'use strict';

    amplitude.controller('VisualController', ['$scope', '$window', 'windowService', function ($scope, $window, windowService) {

        windowService = windowService.parentInjector().get('windowService');

        $scope.active = 1;

        $window.onfocus = function () {
            $scope.active = 1;
            $scope.$apply();
        };

        $window.onblur = function () {
            $scope.active = 0;
            $scope.$apply();
        };

        /*$scope.$on('timeupdate', function () {
            console.log('this is a test!');
        });*/

        $scope.close = function () {
            windowService.close('visual');
        };

    }]);

}());