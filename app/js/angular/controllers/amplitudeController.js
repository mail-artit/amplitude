amplitude.controller('AmplitudeController', ['utils', '$scope', function(utils, $scope) {
	
	$scope.config = {
		title : 'Amplitude',
		homepage : 'https://artit.hu'
	};

	$scope.currentSound = null;
    
    $scope.audioContext = new AudioContext();

    $scope.makeSound = function(tags) {
        var ret =  {
            "title": tags.title || "Unknown Title",
            "artist": tags.artist || "Unknown Artist",
            "track": tags.v2 && tags.v2.track || null,
            "getScrollingText": function() {
                
                return (ret.track !== null ? ret.track +". " : "") +
                    ret.artist + " - " +
                    ret.title + 
                    (ret.duration ? " ("+ utils.secondsToString(ret.duration, ":") + ")" : "");
            }
        };
        
        return ret;
    };

	$scope.constructCurrentSound = function() {
        
        $scope.currentSound.audio = new Audio();
        
        $scope.currentSound.audio.addEventListener("ended", function() {
            /*if($("#sw-repeat").hasClass("active")) {
                currentSound.audio.currentTime = 0;
                currentSound.currentTime = 0;
            } else {
                destructCurrentSound();
            }*/
        });
        
        $scope.currentSound.audio.addEventListener("canplaythrough", function() {
            if($scope.currentSound && $scope.currentSound.audio) {
                $scope.currentSound.audio.play();
                $scope.$broadcast("canplaythrough");
                //ScrollingLabel.start();
                //CanvasRenderer.start();
                //$("#range-slider").find(".handle").removeClass("hidden");
            }
        });
        
        $scope.currentSound.audio.addEventListener("timeupdate",function (){
            if($scope.currentSound && $scope.currentSound.audio) {
                $scope.currentSound.duration = $scope.currentSound.audio.duration;
                $scope.currentSound.currentTime = $scope.currentSound.audio.currentTime;
                $scope.$broadcast("timeupdate");
            }
        });
        
        $scope.currentSound.sampleRate = $scope.audioContext.sampleRate;
        $scope.currentSound.autoplay = false;
        
        $scope.currentSound.audio.src = $scope.currentSound.src;

        $scope.currentSound.source = $scope.audioContext.createMediaElementSource($scope.currentSound.audio);
        
        $scope.currentSound.gain = $scope.audioContext.createGain();
        $scope.currentSound.panner = $scope.audioContext.createPanner();
        $scope.currentSound.analyser = $scope.audioContext.createAnalyser(); 
        
        $scope.currentSound.source.connect($scope.currentSound.gain);
        $scope.currentSound.source.connect($scope.currentSound.analyser);
        
        $scope.currentSound.gain.connect($scope.currentSound.panner);
        
        //$scope.currentSound.gain.gain.value = volumeSlider.getValue() / 100;
        //panSlider.onchange(null);
        
        $scope.currentSound.panner.connect($scope.audioContext.destination);
        
        $scope.currentSound.analyser.smoothingTimeConstant = 0.7;
        $scope.currentSound.analyser.fftSize = 2048;
    };

    $scope.destructCurrentSound = function() {
        if($scope.currentSound && $scope.currentSound.audio) {
            $scope.currentSound.currentTime = 0;
            $scope.currentSound.audio.pause();
            $scope.currentSound.audio = null;
        }
        $scope.$broadcast("currentSoundDestructed");
    };

    $scope.openFile = {
		'parse' : function(files, callback) {
			$scope.destructCurrentSound();

			id3(files[0], function(err, tags) {

	            $scope.currentSound = $scope.makeSound(tags);
	            $scope.currentSound.ctx = $scope.audioContext;
	            $scope.currentSound.src = URL.createObjectURL(files[0]);
	            $scope.constructCurrentSound();
	            
	            callback();

	        });
		}
	};

}]);