
/*jslint devel: true*/
/*global amplitude, chrome*/

function windowService() {

    'use strict';

    var windowProperties = {
        'main': {
            'id': 'main',
            'frame': 'none',
            'resizable': false,
            'innerBounds': {
                'width': 480,
                'height': 200
            }
        },
        'pl': {
            'id': 'pl',
            'frame': 'none',
            'resizable': true,
            'innerBounds': {
                'width': 480,
                'height': 200,
                'minWidth': 480,
                'minHeight': 200
            },
            'state': 'normal'
        },
        'visual': {
            'id': 'visual',
            'frame': 'none',
            'resizable': false,
            'innerBounds': {
                'width': 480,
                'height': 294,
                'minWidth': 480,
                'minHeight': 294
            },
            'state': 'normal'
        }
    };

    amplitude.factory('windowService', ['$window', function ($window) {

        var children = {};

        return {

            closeAll: function () {
                var windows = chrome.app.window.getAll(),
                    i;

                children = {};

                for (i = 0; i < windows.length; i += 1) {
                    windows[i].close();
                }
            },

            close: function (id) {
                delete children[id];
                chrome.app.window.get(id).close();
            },

            minimize: function () {
                var windows = chrome.app.window.getAll(),
                    i;
                for (i = 0; i < windows.length; i += 1) {
                    windows[i].minimize();
                }
            },

            open: function (id, callback) {
                chrome.app.window.create(id + '.html', windowProperties[id], function (window) {

                    function deleteWindow(id) {
                        return function () {
                            delete children[id];
                        };
                    }

                    function restoreAll() {
                        var windows = chrome.app.window.getAll(),
                            i;
                        for (i = 0; i < windows.length; i += 1) {
                            windows[i].restore();
                        }
                    }

                    children[id] = window;
                    window.contentWindow.parent = $window;

                    window.onRestored.addListener(restoreAll);
                    window.onMinimized.addListener(function () {
                        $window.setTimeout(function () {
                            window.restore();
                        }, 1000);
                    });

                    window.onClosed.addListener(deleteWindow(id));

                    window.contentWindow.document.addEventListener('DOMContentLoaded', callback, false);
                });
            },

            isOpen: function (id) {
                return children[id] ? 1 : 0;
            },

            getChildren: function () {
                var id = null,
                    ret = [];

                for (id in children) {
                    if (children.hasOwnProperty(id)) {
                        ret.push(children[id].contentWindow);
                    }
                }

                return ret;
            },

            parentInjector: function () {
                return $window.parent.angular.element($window.parent.document.querySelector('[ng-controller]')).injector();
            },

            init: function (id) {
                chrome.app.window.get('main').onClosed.addListener(function () {
                    chrome.app.window.get(id).close();
                });
            }
        };
    }]);

    chrome.app.runtime.onLaunched.addListener(function () {
        chrome.app.window.create(windowProperties.main.id + '.html', windowProperties.main, function (window) {

            function aggregateWindow(func) {
                var windows = chrome.app.window.getAll(),
                    i;
                for (i = 0; i < windows.length; i += 1) {
                    windows[i][func]();
                }
            }

            window.onMinimized.addListener(function () {
                aggregateWindow('minimize');
            });

            window.onRestored.addListener(function () {
                aggregateWindow('restore');
            });
        });
    });

}

windowService();