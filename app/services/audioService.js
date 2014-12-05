amplitude.factory('audioService', ['$rootScope', 'utils', function($rootScope, utils) {

	var config = {
			volume: 100,
	        pan: 50,
	        repeat: 0
		},
		currentSound = null,
		audioContext = new webkitAudioContext();

	function pan (val) {
        var xDeg = (val / 100 * 90) - 45;
        var zDeg = xDeg + 90;
        if (zDeg > 90) {
            zDeg = 180 - zDeg;
        }
        var x = Math.sin(xDeg * (Math.PI / 180));
        var z = Math.sin(zDeg * (Math.PI / 180));

        currentSound.panner.setPosition(x, 0, z);
    }

    function makeSound (tags) {
        var ret =  {
            "title": tags.title || "Unknown Title",
            "artist": tags.artist || "Unknown Artist",
            "track": tags.v2 && tags.v2.track || null,
            "toString": function() {
                
                return (ret.track !== null ? ret.track +". " : "") +
                    ret.artist + " - " +
                    ret.title + 
                    (ret.duration ? " ("+ utils.secondsToString(ret.duration, ":") + ")" : "");
            }
        };
        
        return ret;
    };

    function constructCurrentSound () {
        
        var audio = new Audio();
        
        audio.addEventListener("ended", function() {
            if(config.repeat) {
                currentSound.audio.currentTime = 0;
                currentSound.currentTime = 0;
            } else {
                deinit();
            }
        });
        
        audio.addEventListener("canplaythrough", function() {
            if(currentSound && currentSound.audio) {
                currentSound.audio.play();
                $rootScope.$broadcast("canplaythrough");
            }
        });
        
        audio.addEventListener("timeupdate",function (){
            if(currentSound && currentSound.audio) {
                currentSound.duration = currentSound.audio.duration;
                currentSound.currentTime = currentSound.audio.currentTime;
                $rootScope.$broadcast("timeupdate");
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
    };

    function destructCurrentSound () {
        if(haveAudio()) {
            currentSound.currentTime = 0;
            currentSound.audio.pause();
            currentSound.audio = null;
        }
    }

    function setVolume (value) {
    	config.volume = value;
        currentSound && (currentSound.gain.gain.value = value / 100);
    }

    function setPan (value) {
    	config.pan = value;
    	currentSound && pan(value);
    }

	function init(tags, src) {
		currentSound = makeSound(tags);
	    currentSound.src = src;
	    constructCurrentSound();
	}

	function haveAudio() {
		return currentSound && currentSound.audio && currentSound.source;
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
		return haveAudio() && (currentSound.audio.currentTime = val);
	}

	function pauseCurrentSound() {
		return haveAudio() && !currentSound.audio.paused && currentSound.audio.pause();
	}

	function resumeCurrentSound() {
		return haveAudio() && currentSound.audio.paused && currentSound.audio.play();
	}

	function isPaused() {
		if (!haveAudio()) {
			return true;
		} else {
			return currentSound.audio.paused;
		}
	}

	function playCurrentSound() {
		return haveAudio() && currentSound.audio.play();
	}

	function getFrequencyBinCount() {
		return haveAudio() && currentSound.analyser.frequencyBinCount;
	}

	function getByteFrequencyData(array) {
		return haveAudio() && currentSound.analyser.getByteFrequencyData(array);
	}

	function setRepeat(repeat) {
		config.repeat = repeat;
	}

	function isRepeat() {
		return config.repeat;
	}

	function deinit() {
		destructCurrentSound();
		$rootScope.$broadcast("currentSoundEnded");
	}

	function stopCurrentSound() {
		destructCurrentSound();
	}

	return {
		"pan": setPan,
		"volume": setVolume,
		"deinit": destructCurrentSound,
		"init": init,
		"soundText": getCurrentSoundText,
		"currentTime": getCurrentTime,
		"duration": getDuration,
		"sampleRate": getSampleRate,
		"channelCount": getChannelCount,
		"seek": seekTo,
		"pause": pauseCurrentSound,
		"resume": resumeCurrentSound,
		"paused": isPaused,
		"haveAudio": haveAudio,
		"play": playCurrentSound,
		"reinit": constructCurrentSound,
		"frequencyBinCount": getFrequencyBinCount,
		"getByteFrequencyData": getByteFrequencyData,
		"setRepeat": setRepeat,
		"isRepeat": isRepeat,
		"stop": stopCurrentSound
	}


}]);