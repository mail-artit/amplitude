
/*jslint browser: true, devel: true*/
/*global angular, amplitude*/

amplitude.directive('displayPanel', ['audioService', 'utils', '$window', function (audioService, utils, $window) {

    'use strict';

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
                gradient = null,
                config = {
                    width: 2,
                    padding: 1,
                    step: 4,
                    offsetX: 2,
                    offsetY: 2
                },
                frequencyData,
                paused = 1;

            function lazyGradient() {
                if (!gradient) {
                    gradient = context.createLinearGradient(0, 39, 0, 69);
                    gradient.addColorStop(0.1, 'red');
                    gradient.addColorStop(0.12, 'yellow');
                    gradient.addColorStop(1, 'rgb(0,170,0)');
                }
                return gradient;
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
                    parts = ['1110111', '0010010', '1011101', '1011011', '0111010', '1101011', '1101111', '1010010', '1111111', '1111011'],
                    part = parts[number],
                    i;

                for (i = 0; i < 7; i += 1) {
                    if (part[i] === '1') {
                        context.fillRect(x + partCoords[i][0], y + partCoords[i][1], partCoords[i][2], partCoords[i][3]);
                    }
                }
            }

            function drawSeconds(s, noSound) {
                var val,
                    i,
                    n,
                    numberPositions = [30, 54, 76, 110, 132];

                context.fillStyle = '#00FF00';

                val = utils.secondsToString(s, '');

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

                context.fillStyle = 'rgb(20,20,35)';

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
                utils.getBuckets(data, sampleRate, function (avg, bucket) {
                    avg = avg * 30;
                    context.fillRect(bucket * 7, canvasHeight - avg, 5, avg);
                });
            }


            function tick() {
                if (!paused) {
                    context.clearRect(0, 0, canvasWidth, canvasHeight);
                    drawBackground();
                    drawSeconds(audioService.currentTime());
                    drawState();
                    context.fillStyle = lazyGradient();
                    drawFFt(frequencyData, audioService.sampleRate());
                }
                $window.requestAnimationFrame(tick);
            }

            $scope.model.update = function update() {
                if (audioService.haveAudio() && !audioService.paused()) {
                    frequencyData = audioService.frequencyData();
                    paused = 0;
                }
            };

            $scope.model.pause = function pause() {
                paused = 1;
            };

            $scope.model.clear = function clear() {
                paused = 1;
                context.clearRect(0, 0, canvasWidth, canvasHeight);
                drawBackground();
                drawSeconds(1, 1);
                drawState();
            };

            $scope.$watch('model.state', function ($state) {
                state = $state;
                $scope.model.update();
                if (state === 'default') {
                    $scope.model.clear();
                }
            });

            tick();
        }
    };

}]);