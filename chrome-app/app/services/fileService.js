
/*jslint devel: true*/
/*global amplitude, id3, URL, chrome*/

(function () {

    'use strict';

    amplitude.factory('fileService', ['audioService', function (audioService) {

        return {

            openFile: function () {
                chrome.fileSystem.chooseEntry({
                    'type': 'openFile',
                    'acceptsMultiple': true,
                    'accepts': [{'extensions': ['mp3']}]
                }, function (entry) {
                    if (entry[0]) {
                        entry[0].file(function (file) {
                            id3(file, function (err, tags) {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                                audioService.deinit();
                                audioService.init(tags, URL.createObjectURL(file));
                            });
                        });
                    }
                });
            }

        };
    }]);

}());