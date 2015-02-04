
/*jslint browser: true, devel: true*/
/*global amplitude, angular*/

amplitude.controller('PlController', ['$scope', '$window', 'windowService', 'utils', function ($scope, $window, windowService, utils) {
    'use strict';

    var fileService = windowService.parentInjector().get('fileService'),
        playlistService = windowService.parentInjector().get('playlistService');

    windowService = windowService.parentInjector().get('windowService');

    $scope.active = 1;
    $scope.menus = [
        {
            'title': 'ADD',
            'submenus': [
                {
                    'title': 'ADD URL',
                    'disabled': 1
                },
                {
                    'title': 'ADD DIR',
                    'fn': function () {
                        fileService.addDir(function () {
                            $scope.overlay = [];
                            $scope.$apply();
                        });
                    }
                },
                {
                    'title': 'ADD FILE',
                    'fn': function () {
                        fileService.addFile(function () {
                            $scope.overlay = [];
                            $scope.$apply();
                        });
                    }
                }
            ]
        },
        {
            'title': 'REM',
            'submenus': [
                {
                    'title': 'REM MISC',
                    'disabled': 1
                },
                {
                    'title': 'REM ALL'
                },
                {
                    'title': 'CROP'
                },
                {
                    'title': 'REM SEL'
                }
            ]
        },
        {
            'title': 'SEL',
            'submenus': [
                {
                    'title': 'INV SEL'
                },
                {
                    'title': 'SEL ZERO'
                },
                {
                    'title': 'SEL ALL'
                }
            ]
        },
        {
            'title': 'MISC',
            'disabled': 1
        }
    ];

    $scope.playlist = playlistService.playlist();
    $scope.playlistIndex = playlistService.playlistIndex();

    $scope.overlay = {
        'menu': [],
        'position': {}
    };

    $window.onclick = function (event) {
        if (event.target.className.indexOf('button-context-cell') === -1) {
            $scope.overlay = [];
            $scope.$apply();
        }
    };

    $scope.overlayMenu = function (menu, event) {
        $scope.overlay.menu = menu.submenus;
        $scope.overlay.position = {
            'bottom': 5,
            'left': event.target.getBoundingClientRect().left - 12
        };
    };

    $window.onfocus = function () {
        $scope.active = 1;
        $scope.$apply();
    };

    $window.onblur = function () {
        $scope.active = 0;
        $scope.$apply();
    };

    $scope.close = function () {
        windowService.close('pl');
    };

    $scope.transformDuration = function (duration) {
        if (!duration) {
            return '';
        }
        return utils.secondsToString(duration, ":", 1);
    };

    angular.forEach(['playlistChange', 'timeupdate'], function (value) {
        $scope.$on(value, function () {
            $scope.playlist = playlistService.playlist();
            $scope.playlistIndex = playlistService.playlistIndex();
            $scope.$apply();
        });
    });

}]);