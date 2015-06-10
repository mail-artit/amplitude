
/*jslint browser: true, devel: true*/
/*global amplitude, Blob, URL */

amplitude.factory('audioService', ['broadcasterService', '$window', function (broadcasterService, $window) {

    'use strict';

    var config = {
            volume: 100,
            pan: 50
        },
        currentSound = null,
        frequencyDataArray = null,
        audioContext = new window.AudioContext(),
        frequencyDataTimer = {
            'start': function () {
                frequencyDataTimer.tick();
            },
            'tick': function () {
                var start = new Date().getTime();
                if (currentSound && currentSound.audio) {
                    currentSound.analyser.getByteFrequencyData(frequencyDataArray);
                    broadcasterService.broadcast('frequencyData');
                }
                $window.setTimeout(frequencyDataTimer.tick, 16 - (new Date().getTime() - start));
            }
        };

    function pan(val) {
        var xDeg = (val / 100 * 90) - 45,
            zDeg = xDeg + 90,
            x,
            z;

        if (zDeg > 90) {
            zDeg = 180 - zDeg;
        }

        x = Math.sin(xDeg * (Math.PI / 180));
        z = Math.sin(zDeg * (Math.PI / 180));

        currentSound.panner.setPosition(x, 0, z);
    }

    function haveAudio() {
        return currentSound && currentSound.audio && currentSound.source;
    }

    function destructCurrentSound() {
        if (haveAudio()) {
            currentSound.currentTime = 0;
            currentSound.audio.pause();
            currentSound.audio = null;
            broadcasterService.broadcast('currentSoundDestructed');
        }
    }

    function deinit() {
        destructCurrentSound();
        broadcasterService.broadcast('currentSoundEnded');
    }

    function constructCurrentSound() {

        var audio = new window.Audio();

        audio.addEventListener('ended', deinit);

        audio.addEventListener('canplaythrough', function () {
            if (currentSound && currentSound.audio) {
                currentSound.audio.play();
                broadcasterService.broadcast('canplaythrough');
            }
        });

        audio.addEventListener('timeupdate', function () {
            if (currentSound && currentSound.audio) {
                currentSound.duration = currentSound.audio.duration;
                currentSound.currentTime = currentSound.audio.currentTime;
                broadcasterService.broadcast('timeupdate');
            }
        });

        currentSound.sampleRate = audioContext.sampleRate;
        currentSound.autoplay = false;

        audio.src = currentSound.src;

        currentSound.source = audioContext.createMediaElementSource(audio);

        currentSound.gain = audioContext.createGain();
        currentSound.panner = audioContext.createPanner();
        currentSound.analyser = audioContext.createAnalyser();
        currentSound.source.connect(currentSound.gain);
        currentSound.source.connect(currentSound.analyser);
        currentSound.gain.connect(currentSound.panner);
        currentSound.gain.gain.value = config.volume / 100;

        currentSound.panner.connect(audioContext.destination);

        pan(config.pan);

        currentSound.analyser.smoothingTimeConstant = 0.7;
        currentSound.analyser.fftSize = 2048;

        currentSound.audio = audio;

        frequencyDataArray = new $window.Uint8Array(currentSound.analyser.frequencyBinCount);

        broadcasterService.broadcast('constructcurrentsound');
    }

    function init(current) {
        currentSound = current;
        constructCurrentSound();
    }

    function setVolume(value) {
        config.volume = value;
        if (haveAudio()) {
            currentSound.gain.gain.value = value / 100;
        }
    }

    function setPan(value) {
        config.pan = value;
        if (haveAudio()) {
            pan(value);
        }
    }

    function getCurrentSoundText() {
        return currentSound && currentSound.toString();
    }

    function getCurrentTime() {
        return haveAudio() && currentSound.audio.currentTime;
    }

    function getDuration() {
        return haveAudio() && currentSound.audio.duration;
    }

    function getSampleRate() {
        return haveAudio() && audioContext.sampleRate;
    }

    function getChannelCount() {
        return haveAudio() && currentSound.source.channelCount;
    }

    function seekTo(val) {
        if (haveAudio()) {
            currentSound.audio.currentTime = val;
        }
    }

    function pauseCurrentSound() {
        if (haveAudio() && !currentSound.audio.paused) {
            broadcasterService.broadcast('paused');
            currentSound.audio.pause();
        }
    }

    function resumeCurrentSound() {
        return haveAudio() && currentSound.audio.paused && currentSound.audio.play();
    }

    function isPaused() {

        if (!haveAudio()) {
            return true;
        }

        return currentSound.audio.paused;
    }

    function playCurrentSound() {
        return haveAudio() && currentSound.audio.play();
    }

    function frequencyData() {
        return haveAudio() && frequencyDataArray;
    }

    function stopCurrentSound() {
        destructCurrentSound();
    }

    function getCurrentSound() {
        return haveAudio() && currentSound;
    }

    frequencyDataTimer.start();

    return {
        'pan': setPan,
        'volume': setVolume,
        'deinit': destructCurrentSound,
        'init': init,
        'soundText': getCurrentSoundText,
        'currentTime': getCurrentTime,
        'duration': getDuration,
        'sampleRate': getSampleRate,
        'channelCount': getChannelCount,
        'seek': seekTo,
        'pause': pauseCurrentSound,
        'resume': resumeCurrentSound,
        'paused': isPaused,
        'haveAudio': haveAudio,
        'play': playCurrentSound,
        'reinit': constructCurrentSound,
        'frequencyData': frequencyData,
        'stop': stopCurrentSound,
        'currentSound': getCurrentSound
    };

}]);