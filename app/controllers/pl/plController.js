
/*jslint browser: true, devel: true*/
/*global amplitude*/

(function () {

    'use strict';

    amplitude.controller('PlController', ['$scope', '$window', 'externalService', function ($scope, $window, externalService) {

        externalService = externalService.parentInjector().get('externalService');

        $scope.active = 1;

        $window.onfocus = function () {
            $scope.active = 1;
            $scope.$apply();
        };

        $window.onblur = function () {
            $scope.active = 0;
            $scope.$apply();
        };

        $scope.$on('timeupdate', function () {
            console.log('this is a test!');
        });

        $scope.close = function () {
            externalService.close('pl');
        };

    }]);

}());