
/*jslint bitwise: true */
/*global amplitude*/

amplitude.factory('utils', [function () {

    'use strict';

    var utils = {};

    utils.secondsToString = function (s, delim) {
        var min = Math.floor(s / 60),
            mods = Math.floor(s) - min * 60;

        min = min < 10 ? '0' + min : String(min);
        mods = mods < 10 ? '0' + mods : String(mods);

        return min + delim + mods;
    };

    utils.getBuckets = function (data, sampleRate, render) {
        var i = 0,
            weights = [0.7, 0.7, 0.7, 0.8, 0.8, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            ranges = [0, 30.0, 60, 115.00, 170, 240.00, 270.0, 310, 400.00, 600, 800.00, 1000, 2000.00, 3000, 4500.00, 6000, 8000.00, 12000, 13000.00, 14000, 15000.00, 16000, Number.MAX_VALUE],
            bucket,
            sum,
            len,
            hz,
            step = sampleRate / 2048,
            targetBucket;

        while (i < data.length) {

            hz = step * i;

            bucket = 0;
            sum = 0;
            len = 0;

            while (hz > ranges[bucket]) {
                bucket += 1;
            }

            targetBucket = bucket;

            while (i < data.length && targetBucket === bucket) {
                sum += data[i] * weights[bucket];
                len += 1;
                i += 1;

                hz = step * i;

                targetBucket = 0;

                while (hz > ranges[targetBucket]) {
                    targetBucket += 1;
                }
            }

            if (bucket !== ranges.length - 1) {
                render((sum / len) / 256, bucket, ranges.length - 1);
            }
        }
    };

    return utils;
}]);