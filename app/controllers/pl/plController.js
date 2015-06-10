
/*jslint browser: true, devel: true*/
/*global amplitude, angular*/

amplitude.controller('PlController', ['$scope', '$window', 'windowService', 'utils', function ($scope, $window, windowService, utils) {
    'use strict';

    var fileService = windowService.parentInjector().get('fileService'),
        playlistService = windowService.parentInjector().get('playlistService');

    windowService.init('pl');

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
                            $scope.hideOverlay();
                        });
                    }
                },
                {
                    'title': 'ADD FILE',
                    'fn': function () {
                        fileService.addFile(function () {
                            $scope.hideOverlay();
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
                    'title': 'REM ALL',
                    'fn': function () {
                        playlistService.empty();
                        $scope.hideOverlay();
                    }
                },
                {
                    'title': 'CROP',
                    'fn': function () {
                        playlistService.removeSelected(1);
                        $scope.hideOverlay();
                    }
                },
                {
                    'title': 'REM SEL',
                    'fn': function () {
                        playlistService.removeSelected();
                        $scope.hideOverlay();
                    }
                }
            ]
        },
        {
            'title': 'SEL',
            'submenus': [
                {
                    'title': 'INV SEL',
                    'fn': function () {
                        playlistService.selectInverse();
                        $scope.hideOverlay();
                    }
                },
                {
                    'title': 'SEL ZERO',
                    'fn': function () {
                        playlistService.selectNone();
                        $scope.hideOverlay();
                    }
                },
                {
                    'title': 'SEL ALL',
                    'fn': function () {
                        playlistService.selectAll();
                        $scope.hideOverlay();
                    }
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
    $scope.selectedIndices = playlistService.selectedIndices();

    $scope.overlay = {
        'menu': [],
        'position': {}
    };

    $scope.jumpTo = function (sound) {
        playlistService.jumpTo(sound);
    };

    $scope.select = function (event, sound) {
        playlistService.select(sound, event.shiftKey, event.ctrlKey);
    };

    $window.onclick = function (event) {
        if (event.target.className.indexOf('button-context-cell') === -1) {
            $scope.overlay = [];
            $scope.$apply();
        }
    };

    $scope.hideOverlay = function () {
        $scope.overlay = [];
        $scope.safeApply();
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

    $scope.transformCounter = function (count) {
        var maxLength = Math.floor(Math.log10($scope.playlist.length)) + 1,
            length = Math.floor(Math.log10(count)) + 1;

        return new Array(maxLength - length + 1).join(' ') + count + '.';
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && typeof fn === 'function') {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    angular.forEach(['playlistChange', 'timeupdate'], function (value) {
        $scope.$on(value, function () {
            $scope.playlist = playlistService.playlist();
            $scope.playlistIndex = playlistService.playlistIndex();
            $scope.safeApply();
        });
    });

}]);