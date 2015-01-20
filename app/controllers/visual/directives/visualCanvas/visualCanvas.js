
/*jslint browser: true, devel: true*/
/*global angular, amplitude*/

amplitude.directive('visualCanvas', ['$window', 'windowService', 'utils', function ($window, windowService, utils) {

    'use strict';

    return {
        restrict: 'E',
        link: function ($scope, $element) {

            //unused jslint error
            $scope.toString();

            var em,
                starsCanvas = angular.element('<canvas>')[0],
                fftCanvas = angular.element('<canvas>')[0],
                image = angular.element('<div>')[0],
                text = angular.element('<div>')[0],
                starsCtx = starsCanvas.getContext("2d"),
                fftCtx = fftCanvas.getContext("2d"),
                stars = new Array(1024),
                MAX_DEPTH = 16,
                audioService = windowService.parentInjector().get('audioService'),
                frequencyData,
                speed = 0;

            image.className = 'amp-logo';

            $element[0].appendChild(fftCanvas);
            $element[0].appendChild(image);
            $element[0].appendChild(starsCanvas);

            text.toString();

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

                    stars[i].z -= 0.2 * speed;

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

            }

            function drawFft(canvas, ctx) {

                if (audioService.haveAudio()) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    utils.getBuckets(lazyFrequencyData(), audioService.sampleRate(), function (avg, bucket, length) {
                        var spacing = 3,
                            targetWidth = canvas.width - 4 * em,
                            width = (targetWidth - (length - 1) * em / spacing) / length,
                            height = avg * (canvas.height - 2 * em),
                            coords;
                        ctx.fillStyle = 'rgba(78,78,114,' + Math.min(avg * 2, 1) + ')';
                        ctx.lineWidth = avg * ((em / spacing) / 4);
                        ctx.strokeStyle = '#9494aa';
                        coords = [2 * em + bucket * (width + em / spacing), canvas.height - (em / spacing) / 8, width, -height];
                        ctx.fillRect.apply(ctx, coords);
                        ctx.strokeRect.apply(ctx, coords);
                    });
                }

            }

            function draw() {
                drawStars(starsCanvas, starsCtx);
                drawFft(fftCanvas, fftCtx);

                if (audioService.haveAudio()) {
                    audioService.getByteFrequencyData(lazyFrequencyData());
                    speed = getSpeed();
                }

                image.style.transform = 'scale(' + (1 + (speed / 5)) + ')';

                $window.requestAnimationFrame(draw);
            }

            function resize() {
                starsCanvas.style.background = 'black';

                if (!$window.document.webkitIsFullScreen) {
                    starsCanvas.width = $element[0].parentNode.clientWidth;
                    starsCanvas.height = $element[0].parentNode.clientHeight || $window.screen.height;
                } else {
                    starsCanvas.width = $window.screen.width;
                    starsCanvas.height = $window.screen.height;
                }

                fftCanvas.style.position = 'absolute';
                fftCanvas.width = starsCanvas.width;
                fftCanvas.height = starsCanvas.height / 2;

                em = starsCanvas.height / 12;

                image.style.position = 'absolute';
                image.style.top = fftCanvas.height + em + 'px';
                image.style.height = fftCanvas.height - 3 * em + 'px';
                image.style.width = image.style.height;
                image.style.left = 2 * em + 'px';
            }

            $window.onresize = resize;

            $element[0].ondblclick = function () {
                if (!$window.document.webkitIsFullScreen) {
                    $element[0].webkitRequestFullscreen();
                } else {
                    $window.document.webkitCancelFullScreen();
                }
            };

            initStars();
            resize();
            draw();
        }
    };

}]);