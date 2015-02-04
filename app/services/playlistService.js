
/*jslint browser: true, devel: true*/
/*global amplitude, Blob, URL */

amplitude.factory('playlistService', ['audioService', 'broadcasterService', 'utils', function (audioService, broadcasterService, utils) {
    'use strict';

    var playlist = [],
        playlistIndex = 0;

    function nextInPlaylist() {
        if (playlistIndex + 1 < playlist.length) {
            playlistIndex += 1;
        } else {
            playlistIndex = 0;
        }
        audioService.stop();
        audioService.init(playlist[playlistIndex]);
        broadcasterService.broadcast('playlistChange');
    }

    function prevInPlaylist() {
        if (playlistIndex > 0) {
            playlistIndex -= 1;
        } else {
            playlistIndex = playlist.length - 1;
        }
        audioService.stop();
        audioService.init(playlist[playlistIndex]);
        broadcasterService.broadcast('playlistChange');
    }

    function hasNextInPlaylist() {
        return playlistIndex + 1 < playlist.length;
    }

    function addToPlaylist(tags, src) {
        var sound = utils.makeSound(tags);
        sound.src = src;
        playlist.push(sound);
        broadcasterService.broadcast('playlistChange');
    }

    function emptyPlaylist() {
        playlist = [];
        playlistIndex = 0;
        broadcasterService.broadcast('playlistChange');
    }

    function isPlaylistEmpty() {
        return !playlist.length;
    }

    function playCurrent() {
        audioService.init(playlist[playlistIndex]);
    }

    function getPlaylistIndex() {
        return playlistIndex;
    }

    function getPlaylist() {
        return playlist;
    }

    return {
        'next': nextInPlaylist,
        'prev': prevInPlaylist,
        'hasNext': hasNextInPlaylist,
        'empty': emptyPlaylist,
        'isEmpty': isPlaylistEmpty,
        'add': addToPlaylist,
        'play': playCurrent,
        'playlist': getPlaylist,
        'playlistIndex': getPlaylistIndex
    };

}]);