
/*jslint browser: true, devel: true*/
/*global amplitude*/

amplitude.controller('VisualController', ['$scope', '$window', 'windowService', function ($scope, $window, windowService) {

    'use strict';

    var audioService = windowService.parentInjector().get('audioService'),
        defaultData = {
            'artist': 'AMPLITUDE',
            'title': ''
        };

    windowService.init('visual');

    windowService = windowService.parentInjector().get('windowService');

    $scope.visualCanvas = {
        'data': defaultData
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
        $scope.visualCanvas.data = {};
        $scope.visualCanvas.data.artist = currentSound.artist;
        $scope.visualCanvas.data.title = currentSound.title;
        $scope.$apply();
    });

    $scope.$on('frequencyData', function () {
        $scope.visualCanvas.update();
    });

    $scope.$on('paused', function () {
        $scope.visualCanvas.pause();
    });

    $scope.$on('currentSoundDestructed', function () {
        $scope.visualCanvas.stop();
    });

}]);