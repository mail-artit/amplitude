
/*jslint browser: true, devel: true*/
/*global amplitude*/

amplitude.controller('VisualController', ['$scope', '$window', 'windowService', function ($scope, $window, windowService) {

    'use strict';

    var audioService = windowService.parentInjector().get('audioService');

    windowService = windowService.parentInjector().get('windowService');

    $scope.visualCanvas = {
        'data': {
            'artist': 'AMPLITUDE',
            'title': ''
        }
    };

    if (audioService.haveAudio()) {
        $scope.visualCanvas.data.artist = audioService.currentSound().artist;
        $scope.visualCanvas.data.title = audioService.currentSound().title;
    }

    $scope.active = 1;

    $window.onfocus = function () {
        $scope.active = 1;
        $scope.$apply();
    };

    $window.onblur = function () {
        $scope.active = 0;
        $scope.$apply();
    };

    $scope.close = function () {
        windowService.close('visual');
    };

    $scope.$on('constructcurrentsound', function () {
        var currentSound = audioService.currentSound();
        $scope.visualCanvas.data.artist = currentSound.artist;
        $scope.visualCanvas.data.title = currentSound.title;
        $scope.$apply();
    });

}]);