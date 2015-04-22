
/*jslint browser: true, devel: true*/
/*global amplitude, Blob, URL */

amplitude.factory('playlistService', ['audioService', 'broadcasterService', 'utils', function (audioService, broadcasterService, utils) {
    'use strict';

    var playlist = [],
        playlistIndex = 0,
        lastInteractedIndex = 0,
        selectedIndices = [];

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
        playlist.length = 0;
        playlistIndex = 0;
        broadcasterService.broadcast('playlistChange');
    }

    function isPlaylistEmpty() {
        return !playlist.length;
    }

    function playCurrent() {
        if (playlist.length) {
            if (playlistIndex === -1) {
                playlistIndex = 0;
            }
            audioService.init(playlist[playlistIndex]);
        }
    }

    function getPlaylistIndex() {
        return playlistIndex;
    }

    function getPlaylist() {
        return playlist;
    }

    function jumpTo(sound) {
        var index = playlist.indexOf(sound);
        if (index !== -1) {
            playlistIndex = index;
            audioService.stop();
            audioService.init(playlist[playlistIndex]);
        }
    }

    function handleSelect(sound, bunch, toggle) {
        var index = playlist.indexOf(sound),
            selectedIndex,
            i,
            desc;

        if (index !== -1) {
            selectedIndex = selectedIndices.indexOf(index);

            if (toggle) {
                if (selectedIndex !== -1) {
                    selectedIndices.splice(selectedIndex, 1);
                } else {
                    selectedIndices.push(index);
                }
                lastInteractedIndex = index;
            } else if (bunch) {
                selectedIndices.length = 0;
                desc = lastInteractedIndex < index ? 1 : -1;
                for (i = lastInteractedIndex * desc; i <= index * desc; i += 1) {
                    selectedIndices.push(Math.abs(i));
                }
            } else {
                selectedIndices.length = 0;
                selectedIndices.push(index);
                lastInteractedIndex = index;
            }

        }
    }

    function getSelectedIndices() {
        return selectedIndices;
    }

    function removeSelected(crop) {
        var i,
            removeables = [],
            index,
            currentSound;

        if (selectedIndices.length) {

            if ((crop && selectedIndices.indexOf(playlistIndex) === -1) || (!crop && selectedIndices.indexOf(playlistIndex) !== -1)) {
                playlistIndex = -1;
            }

            currentSound = playlist[playlistIndex];

            for (i = 0; i < playlist.length; i += 1) {
                if ((crop && selectedIndices.indexOf(i) === -1) || (!crop && selectedIndices.indexOf(i) !== -1)) {
                    removeables.push(playlist[i]);
                }
            }

            for (i = 0; i < removeables.length; i += 1) {
                index = playlist.indexOf(removeables[i]);
                if (index !== -1) {
                    playlist.splice(index, 1);
                }
            }

            selectedIndices.length = 0;
            lastInteractedIndex = 0;

            if (currentSound) {
                playlistIndex = playlist.indexOf(currentSound);
            } else {
                playlistIndex = -1;
            }

            if (removeables.length) {
                broadcasterService.broadcast('playlistChange');
            }
        }
    }

    function selectNone() {
        selectedIndices.length = 0;
        lastInteractedIndex = 0;
    }

    function selectAll() {
        var i;
        selectedIndices.length = 0;
        for (i = 0; i < playlist.length; i += 1) {
            selectedIndices.push(i);
        }
        lastInteractedIndex = 0;
    }

    function selectInverse() {
        var i,
            selectedIndicesCopy = selectedIndices.slice(0);

        selectedIndices.length = 0;

        for (i = 0; i < playlist.length; i += 1) {
            if (selectedIndicesCopy.indexOf(i) === -1) {
                selectedIndices.push(i);
            }
        }

        lastInteractedIndex = 0;
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
        'playlistIndex': getPlaylistIndex,
        'jumpTo': jumpTo,
        'select': handleSelect,
        'selectNone': selectNone,
        'selectAll': selectAll,
        'selectInverse': selectInverse,
        'selectedIndices': getSelectedIndices,
        'removeSelected': removeSelected
    };

}]);