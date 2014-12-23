
/*global amplitude, chrome*/

(function () {

    'use strict';

    amplitude.factory('externalService', [function () {

        var windowProperties = {
            'pl': {
                'frame': 'none',
                'resizable': true,
                'bounds': {
                    'width': 480,
                    'height': 200
                }
            }
        };

        return {
            close: function () {
                chrome.app.window.current().close();
            },

            minimize: function () {
                var windows = chrome.app.window.getAll(),
                    i;
                for (i = 0; i < windows.length; i += 1) {
                    windows[i].minimize();
                }
            },

            open: function (id) {
                return chrome.app.window.create(id + '.html', windowProperties[id]);
            }
        };
    }]);

}());