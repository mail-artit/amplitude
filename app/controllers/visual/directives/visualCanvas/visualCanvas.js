
/*jslint browser: true, devel: true*/
/*global angular, amplitude*/

(function () {

    'use strict';

    amplitude.directive('visualCanvas', ['$window', 'windowService', 'utils', function ($window, windowService, utils) {

        return {
            restrict: 'E',
            link: function ($scope, $element) {

                //unused jslint error
                $scope.toString();

                var starsCanvas = angular.element('<canvas>')[0],
                    starsCtx = starsCanvas.getContext("2d"),
                    fftCanvas = angular.element('<canvas>')[0],
                    fftCtx = fftCanvas.getContext("2d"),
                    stars = new Array(1024),
                    MAX_DEPTH = 16,
                    audioService = windowService.parentInjector().get('audioService'),
                    frequencyData;

                $element[0].appendChild(fftCanvas);
                $element[0].appendChild(starsCanvas);

                function lazyFrequencyData() {
                    if (!frequencyData) {
                        frequencyData = new window.Uint8Array(audioService.frequencyBinCount());
                    }
                    return frequencyData;
                }

                function randomRange(minVal, maxVal) {
                    return Math.floor(Math.random() * (maxVal - minVal - 1)) + minVal;
                }

                function initStars() {
                    var i;

                    for (i = 0; i < stars.length; i += 1) {
                        stars[i] = {
                            x: randomRange(-25, 25),
                            y: randomRange(-25, 25),
                            z: randomRange(1, MAX_DEPTH)
                        };
                    }
                }

                function getSpeed() {
                    var data,
                        i,
                        n,
                        sum = 0;

                    if (audioService.haveAudio()) {
                        data = lazyFrequencyData();
                        for (i = 0, n = data.length; i < n; i += 1) {
                            sum += data[i];
                        }
                        return sum / (n * 255);
                    }

                    return 0;
                }

                function drawStars(canvas, ctx) {
                    var halfWidth  = starsCanvas.width / 2,
                        halfHeight = starsCanvas.height / 2,
                        i,
                        k,
                        px,
                        py,
                        size,
                        shade;

                    ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

                    for (i = 0; i < stars.length; i += 1) {

                        stars[i].z -= 0.2 * getSpeed();

                        if (stars[i].z <= 0) {
                            stars[i].x = randomRange(-25, 25);
                            stars[i].y = randomRange(-25, 25);
                            stars[i].z = MAX_DEPTH;
                        }

                        k  = 128.0 / stars[i].z;
                        px = stars[i].x * k + halfWidth;
                        py = stars[i].y * k + halfHeight;

                        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
                            size = (1 - stars[i].z / 16.0) * 2;
                            shade = parseInt((1 - stars[i].z / 16.0) * 255, 10);
                            ctx.fillStyle = 'rgb(' + shade + ',' + shade + ',' + shade + ')';
                            ctx.beginPath();
                            ctx.arc(px, py, size, 0, 2 * Math.PI, false);
                            ctx.fill();
                            ctx.closePath();
                        }

                    }
                    if (audioService.haveAudio()) {
                        audioService.getByteFrequencyData(lazyFrequencyData());
                    }

                }

                function drawFft(canvas, ctx) {

                    if (audioService.haveAudio()) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = '#4e4e72';
                        utils.getBuckets(lazyFrequencyData(), audioService.sampleRate(), function (avg, bucket, length) {
                            var em = canvas.width / 24,
                                targetWidth = canvas.width - 4 * em,
                                width = (targetWidth - (length - 1) * em / 3) / length,
                                height = avg * canvas.height / 1.5;

                            ctx.fillRect(2 * em + bucket * (width + em / 3), canvas.height - height, width, height);
                        });
                    }

                }

                function draw() {
                    drawStars(starsCanvas, starsCtx);
                    drawFft(fftCanvas, fftCtx);
                    window.requestAnimationFrame(draw);
                }

                function resize() {
                    starsCanvas.style.background = 'black';
                    starsCanvas.width = $element[0].parentNode.clientWidth;
                    starsCanvas.height = $element[0].parentNode.clientHeight;
                    fftCanvas.style.position = 'absolute';
                    fftCanvas.width = starsCanvas.width;
                    fftCanvas.height = starsCanvas.height / 2;
                }

                $window.onresize = resize;

                $element[0].ondblclick = function () {
                    if (!$window.webkitIsFullScreen) {
                        $element[0].webkitRequestFullscreen();
                    }
                };

                initStars();
                resize();
                draw();
            }
        };

    }]);

}());