
/*jslint devel: true*/
/*global amplitude, id3, URL, chrome, async*/

amplitude.factory('fileService', ['playlistService', 'audioService', function (playlistService, audioService) {

    'use strict';

    function parseEntry(callback) {
        return function (file) {

            if (file.type !== 'audio/mp3') {
                return callback();
            }

            id3(file, function (err, tags) {
                if (err) {
                    console.error(err);
                } else {
                    playlistService.add(tags, URL.createObjectURL(file));
                }
                callback();
            });
        };
    }

    function processEntries(entries, empty, cb) {
        async.mapSeries(entries, function (item, callback) {
            if (item.isFile) {
                item.file(parseEntry(callback));
            } else {
                callback();
            }
        }, function () {
            if (empty) {
                playlistService.play();
            }

            if (cb) {
                cb();
            }
        });
    }

    function openFiles(cb, empty) {
        chrome.fileSystem.chooseEntry({
            'type': 'openFile',
            'acceptsMultiple': true,
            'accepts': [{'extensions': ['mp3']}]
        }, function (entries) {

            if (!entries || !entries.length) {
                if (cb) {
                    cb();
                }
                return;
            }

            if (empty) {
                audioService.deinit();
                playlistService.empty();
            }

            processEntries(entries, empty, cb);
        });
    }

    function listDir(dirent, cb, listing) {

        var reader = dirent.createReader(),
            readSome;

        if (listing === undefined) {
            listing = [];
        }

        readSome = reader.readEntries.bind(reader, function (ents) {

            function processSome(ents, i) {
                for (i; i < ents.length; i += 1) {
                    listing.push(ents[i]);

                    if (ents[i].isDirectory) {
                        return listDir(ents[i], processSome.bind(null, ents, i + 1), listing);
                    }
                }

                readSome();
            }

            if (ents.length === 0) {
                return cb(listing);
            }

            processSome(ents, 0);

        }, function () {
            console.error('error reading directory');
        });

        readSome();
    }

    return {

        openFile: function (cb) {
            openFiles(cb, 1);
        },

        addFile: function (cb) {
            openFiles(cb);
        },

        addDir: function (cb) {
            chrome.fileSystem.chooseEntry({
                'type': 'openDirectory'
            }, function (entry) {
                if (!entry && cb) {
                    return cb();
                }
                listDir(entry, function (entries) {
                    processEntries(entries, 0, cb);
                });
            });
        }

    };
}]);