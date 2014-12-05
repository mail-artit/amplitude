
/*jslint browser: true*/
/*global angular, amplitude*/

(function () {

    'use strict';

    amplitude.directive('displayPanel', ['audioService', 'utils', function (audioService, utils) {

        return {
            restrict: 'A',
            scope: {
                model: '=ngModel'
            },
            link: function ($scope, $element, $attributes) {

                var context = $element[0].getContext('2d'),
                    canvasWidth = $attributes.width,
                    canvasHeight = $attributes.height,
                    state = null,
                    paused = 1,
                    gradient = null,
                    frequencyData = null,
                    config = {
                        width: 2,
                        padding: 1,
                        step: 4,
                        offsetX: 2,
                        offsetY: 2
                    };

                function lazyGradient() {
                    if (!gradient) {
                        gradient = context.createLinearGradient(0, 39, 0, 69);
                        gradient.addColorStop(0.1, 'red');
                        gradient.addColorStop(0.12, 'yellow');
                        gradient.addColorStop(1, 'rgb(0,170,0)');
                    }
                    return gradient;
                }

                function lazyFrequencyData(sound) {
                    if (!frequencyData) {
                        frequencyData = new window.Uint8Array(audioService.frequencyBinCount());
                    }
                    return frequencyData;
                }

                function drawNumber(number, x, y) {
                    var width = 14,
                        height = 22,
                        heigthDiv2 = Math.floor(height / 2),
                        partCoords = [
                            [config.width, 0, width - config.width, config.width],
                            [0, config.width, config.width, heigthDiv2 - config.width],
                            [width, config.width, config.width, heigthDiv2 - config.width],
                            [config.width, heigthDiv2, width - config.width, config.width],
                            [0, heigthDiv2 + config.width, config.width, heigthDiv2 - config.width],
                            [width, heigthDiv2 + config.width, config.width, heigthDiv2 - config.width],
                            [config.width, height, width - config.width, config.width]
                        ],
                        parts = ["1110111", "0010010", "1011101", "1011011", "0111010", "1101011", "1101111", "1010010", "1111111", "1111011"],
                        part = parts[number],
                        i;

                    for (i = 0; i < 7; i += 1) {
                        if (part[i] === "1") {
                            context.fillRect(x + partCoords[i][0], y + partCoords[i][1], partCoords[i][2], partCoords[i][3]);
                        }
                    }
                }

                function drawSeconds(s, noSound) {
                    var val,
                        i,
                        n,
                        numberPositions = [30, 54, 76, 110, 132];

                    context.fillStyle = "#00AA00";

                    val = utils.secondsToString(s, "");

                    if (!noSound) {
                        for (i = 0, n = val.length; i < n; i += 1) {
                            drawNumber(Number(val[i]), numberPositions[i + 5 - val.length], 5);
                        }
                    }

                    context.fillRect(99, 14, config.width * 2, config.width);
                    context.fillRect(99, 20, config.width * 2, config.width);
                }

                function drawState() {
                    if (state === 'playing') {
                        context.beginPath();
                        context.moveTo(10, 6);
                        context.lineTo(10, 28);
                        context.lineTo(20, 17);
                        context.fill();
                    } else if (state === 'paused') {
                        context.fillRect(6, 12, 6, 10);
                        context.fillRect(18, 12, 6, 10);
                    } else {
                        context.fillRect(10, 12, 10, 10);
                    }
                }

                function drawBackground() {
                    var i,
                        j;

                    context.fillStyle = "rgb(20,20,35)";

                    for (i = 0; i < canvasWidth; i += config.step) {
                        for (j = 0; j < canvasHeight; j += config.step) {
                            if (i % (config.step * 2) === 0 && j % (config.step * 2) === 0) {
                                context.fillRect(
                                    i + config.offsetX,
                                    j + config.offsetY,
                                    config.width,
                                    config.width
                                );
                                context.fillRect(
                                    i + config.offsetX + config.width + config.padding,
                                    j + config.offsetY,
                                    config.width,
                                    config.width
                                );
                                context.fillRect(
                                    i + config.offsetX,
                                    j + config.width + config.padding + config.offsetY,
                                    config.width,
                                    config.width
                                );
                                context.fillRect(
                                    i + config.offsetX + config.width + config.padding,
                                    j + config.width + config.padding + config.offsetY,
                                    config.width,
                                    config.width
                                );
                            }
                        }
                    }
                }

                function drawFFt(data, sampleRate) {
                    var i = 0,
                        weights = [0.7, 0.7, 0.7, 0.8, 0.8, 0.9, 0.9, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                        ranges = [0, 30.0, 60, 115.00, 170, 240.00, 270.0, 310, 400.00, 600, 800.00, 1000, 2000.00, 3000, 4500.00, 6000, 8000.00, 12000, 13000.00, 14000, 15000.00, 16000, Number.MAX_VALUE],
                        bucket,
                        sum,
                        len,
                        hz,
                        step = sampleRate / 2048,
                        targetBucket,
                        avg;

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

                        avg = ((sum / len) / 256) * 30;

                        context.fillRect(bucket * 7, canvasHeight - avg, 5, avg);
                    }
                }

                function tick() {

                    if (!audioService.haveAudio()) {
                        window.requestAnimationFrame(tick);
                        return;
                    }

                    context.clearRect(0, 0, canvasWidth, canvasHeight);
                    drawBackground();
                    drawSeconds(audioService.currentTime());
                    drawState();

                    context.fillStyle = lazyGradient();

                    drawFFt(lazyFrequencyData(), audioService.sampleRate());

                    if (!paused) {
                        audioService.getByteFrequencyData(lazyFrequencyData());
                        window.requestAnimationFrame(tick);
                    }

                }

                function start() {
                    if (paused) {
                        paused = 0;
                        tick();
                    }
                }

                function stop() {
                    paused = 1;
                    context.clearRect(0, 0, canvasWidth, canvasHeight);
                    drawBackground();
                    drawSeconds(1, 1);
                    drawState();
                }

                function pause() {
                    paused = 1;
                }

                $scope.$watch('model.state', function ($state) {
                    state = $state;
                    if (state === 'playing') {
                        start();
                    } else if (state === 'paused') {
                        pause();
                    } else {
                        stop();
                    }
                });
            }
        };

    }]);

}());