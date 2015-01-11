
/*jslint browser: true, devel: true*/
/*global amplitude, id3, URL*/

(function () {

    'use strict';

    amplitude.controller('MainController', ['externalService', 'audioService', '$window', 'utils', '$scope', function (externalService, audioService, $window, utils, $scope) {

        function reset() {
            $scope.displayPanel.state = 'default';
            $scope.durationSlider.disabled = 1;
            $scope.scrollingText.still = null;
        }

        $scope.config = {
            title: 'Amplitude',
            homepage: 'https://github.com/artit91/amplitude'
        };

        $scope.active = 1;

        $scope.scrollingText = {
            'default': $scope.config.title,
            'text': null,
            'still': null,
            'state': 'paused',
            'stillTimeout': null
        };

        $scope.openFile = {
            'parse': function (files, callback) {
                audioService.deinit();

                id3(files[0], function (err, tags) {
                    if (err) {
                        console.log(err);
                        return callback();
                    }
                    audioService.init(tags, URL.createObjectURL(files[0]));
                });
            }
        };

        $scope.displayPanel = {
            'state': 'default',
            'currentSound': null
        };

        $scope.volumeSlider = {
            'max': 100,
            'value': 100,
            'onchange': function (sender) {
                var val = $scope.volumeSlider.value,
                    gradVal = Math.floor(120 - (120 / 100 * val)),
                    gradient = '-webkit-linear-gradient(top, hsl(' + gradVal + ', 75%, 35%) 0%, hsl(' + gradVal + ', 76%, 50%) 100%)';

                $scope.volumeSlider.background = gradient;

                audioService.volume(val);

                if (sender) {
                    clearTimeout($scope.scrollingText.stillTimeout);
                    $scope.scrollingText.still = 'volume: ' + val + '%';
                    $scope.$apply();
                    $scope.scrollingText.stillTimeout = setTimeout(function () {
                        $scope.scrollingText.still = null;
                        $scope.$apply();
                    }, 1000);
                }
            }
        };

        $scope.panSlider = {
            'max': 100,
            'value': 50,
            'stickTo': [50, 15],
            'onchange': function (sender) {
                var val = $scope.panSlider.value,
                    gradVal = Math.floor(120 - 120 * (50 - val) * (val > 50 ? -1 : 1) / 50),
                    gradient = '-webkit-linear-gradient(top, hsl(' + gradVal + ', 75%, 35%) 0%, hsl(' + gradVal + ', 76%, 50%) 100%)';

                audioService.pan(val);

                $scope.panSlider.background = gradient;

                if (sender) {
                    clearTimeout($scope.scrollingText.stillTimeout);
                    $scope.scrollingText.still = 'balance: ' +
                        (val === 50 ?
                                'center' :
                                (val < 50 ?
                                        (Math.floor((50 - val) / 50 * 100) + '% left') :
                                        (Math.floor((val - 50) / 50 * 100) + '% right')
                                ));
                    $scope.$apply();
                    $scope.scrollingText.stillTimeout = setTimeout(function () {
                        $scope.scrollingText.still = null;
                        $scope.$apply();
                    }, 1000);
                }
            }
        };

        $scope.durationSlider = {
            'max': 0,
            'value': 0,
            'disabled': 1,
            'setWhileSliding': 0,
            'onchange': function (sender) {

                var val = $scope.durationSlider.value / 1000;

                if (sender && sender.mouse) {
                    audioService.seek(val);
                    clearTimeout($scope.scrollingText.stillTimeout);
                    $scope.scrollingText.still = null;
                } else if (sender) {
                    clearTimeout($scope.scrollingText.stillTimeout);

                    $scope.scrollingText.still = 'seek to: ' +
                        utils.secondsToString(val, ':') +
                        '/' +
                        utils.secondsToString(audioService.duration(), ':') +
                        ' ' +
                        Math.floor(val / audioService.duration() * 100) +
                        '%';

                    $scope.scrollingText.stillTimeout = setTimeout(function () {
                        $scope.scrollingText.still = null;
                    }, 1000);
                }
            }
        };

        $scope.kbps = '\u00A0';
        $scope.khz = '\u00A0';
        $scope.channels = 0;

        $scope.$on('timeupdate', function () {
            $scope.scrollingText.text = audioService.soundText();
            $scope.durationSlider.value = audioService.currentTime() * 1000;
            $scope.durationSlider.max = audioService.duration() * 1000;
            $scope.$apply();
        });

        $scope.$on('canplaythrough', function () {
            $scope.scrollingText.text = audioService.soundText();
            $scope.scrollingText.state = 'scrolling';
            $scope.kbps = 'N/A';
            $scope.khz = Math.floor(audioService.sampleRate() / 1000);
            $scope.channels = audioService.channelCount();
            $scope.displayPanel.state = 'playing';
            $scope.durationSlider.disabled = 0;
            $scope.$apply();
        });

        $scope.$on('currentSoundEnded', function () {
            reset();
            $scope.$apply();
        });

        $scope.$on('UICloseWindow', function (id) {
            externalService.close(id);
        });

        $window.onfocus = function () {
            $scope.active = 1;
            $scope.$apply();
        };

        $window.onblur = function () {
            $scope.active = 0;
            $scope.$apply();
        };

        $scope.pause = function () {
            if (audioService.haveAudio()) {
                if (!audioService.paused()) {
                    $scope.displayPanel.state = 'paused';
                    audioService.pause();
                } else {
                    $scope.displayPanel.state = 'playing';
                    audioService.resume();
                }
            }
        };

        $scope.stop = function () {
            audioService.stop();
            reset();
        };

        $scope.play = function () {
            if (audioService.haveAudio()) {
                if (audioService.paused()) {
                    $scope.displayPanel.state = 'playing';
                    audioService.resume();
                } else {
                    audioService.seek(0);
                }
            } else {
                $scope.displayPanel.state = 'playing';
                audioService.reinit();
            }
        };

        $scope.toggleRepeat = function () {
            audioService.setRepeat((audioService.isRepeat() + 1) % 2);
        };

        $scope.isRepeat = function () {
            return audioService.isRepeat();
        };

        $scope.close = function () {
            externalService.closeAll();
        };

        $scope.minimize = function () {
            externalService.minimize();
        };

        $scope.togglePl = function () {
            if (!$scope.isOpen('pl')) {
                externalService.open('pl', function () {
                    $scope.$apply();
                });
            } else {
                externalService.close('pl');
            }
        };

        $scope.isOpen = function (id) {
            return externalService.isOpen(id);
        };

    }]);

}());