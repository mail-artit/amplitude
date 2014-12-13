
/*global chrome*/

(function () {

    'use strict';

    chrome.app.runtime.onLaunched.addListener(function () {

        chrome.app.window.create('main.html', {
            'frame': 'none',
            'resizable': false,
            'bounds': {
                'width': 480,
                'height': 200
            }
        });

    });

}());