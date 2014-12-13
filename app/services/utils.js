
/*global amplitude*/

(function () {

    'use strict';

    amplitude.factory('utils', function () {
        var utils = {};

        utils.secondsToString = function (s, delim) {
            var min = Math.floor(s / 60),
                mods = Math.floor(s) - min * 60;

            min = min < 10 ? '0' + min : String(min);
            mods = mods < 10 ? '0' + mods : String(mods);

            return min + delim + mods;
        };

        return utils;
    });

}());