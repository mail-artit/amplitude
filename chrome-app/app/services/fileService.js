
/*jslint devel: true*/
/*global amplitude, id3, URL, chrome, async*/

amplitude.factory('fileService', ['playlistService', 'audioService', function (playlistService, audioService) {

    'use strict';

    function parseEntry(callback) {
        return function (file) {
            id3(file, function (err, tags) {
                if (err) {
                    console.error(err);
                } else {
                    playlistService.add(tags, URL.createObjectURL(file));
                    callback();
                }
            });
        };
    }

    return {

        openFile: function () {
            chrome.fileSystem.chooseEntry({
                'type': 'openFile',
                'acceptsMultiple': true,
                'accepts': [{'extensions': ['mp3']}]
            }, function (entry) {

                if (!entry || !entry.length) {
                    return;
                }

                audioService.deinit();
                playlistService.empty();

                async.mapSeries(entry, function (item, callback) {
                    item.file(parseEntry(callback));
                }, function () {
                    playlistService.play();
                });

            });
        }

    };
}]);