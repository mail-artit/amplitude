
/*jslint devel: true*/
/*global amplitude, chrome*/

(function () {

    'use strict';

    amplitude.factory('externalService', [function () {

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
                for (i = 0; i < windows.length; i += 1) {
                    windows[i].close();
                }
            },

            close: function (id) {
                chrome.app.window.get(id).close();
                delete children[id];
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
            }
        };
    }]);

}());