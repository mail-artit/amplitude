
/*jslint devel: true*/
/*global amplitude, chrome*/

(function () {

    'use strict';

    amplitude.factory('externalService', ['$window', function ($window) {

        var windowProperties = {
            'pl': {
                'id': 'pl',
                'frame': 'none',
                'resizable': true,
                'innerBounds': {
                    'width': 480,
                    'height': 200
                }
            }
        },
            children = {};

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
                    children[id] = window;
                    window.contentWindow.parent = $window;
                    callback();
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
            }
        };
    }]);

}());