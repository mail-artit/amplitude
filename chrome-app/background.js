
/*global chrome*/

(function () {

    'use strict';

    chrome.app.runtime.onLaunched.addListener(function () {

        chrome.app.window.create('main.html', {
            'id': 'main',
            'frame': 'none',
            'resizable': false,
            'innerBounds': {
                'width': 480,
                'height': 200
            }
        });

    });

}());