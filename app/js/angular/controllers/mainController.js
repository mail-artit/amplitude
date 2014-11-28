amplitude.controller('MainController', ['$window', 'utils', '$scope', function ($window, utils, $scope) {
	
	$scope.active = 0;

	$scope.scrollingText = {
		'default': $scope.config.title,
		'text' : null,
		'still' : null,
		'state' : 'paused',
		'stillTimeout': null
	};

	$scope.displayPanel = {
		'state' : 'default',
		'currentSound' : null
	};

	$scope.volumeSlider = {
		'max': 100,
		'value': 100,
		'block': 10,
		'onchange': function(sender) {
			var val = $scope.volumeSlider.value,
            	gradVal = Math.floor(120-(120/100*val)),
            	gradient = "-webkit-linear-gradient(top, hsl("+gradVal+", 75%, 35%) 0%, hsl("+gradVal+", 76%, 50%) 100%)";
        
        	$scope.volumeSlider.background = gradient;
        	$scope.config.volume = val;

	        if(sender) {
	            clearTimeout($scope.scrollingText.stillTimeout);
	            $scope.scrollingText.still = "volume: "+val+"%";
	            $scope.$apply();
	            $scope.scrollingText.stillTimeout = setTimeout(function() {
	                $scope.scrollingText.still = null;
	                $scope.$apply();
	            }, 1000);
	        }
		}
	};

	$scope.panSlider = {
		'max': 100,
		'value': 50,
		'block': 10,
		'stickTo': [50,15],
		'onchange': function(sender) {
			var val = $scope.panSlider.value,
	            gradVal = Math.floor(120+-120*(50-val)*(val > 50 ? -1 : 1)/50),
	            gradient = "-webkit-linear-gradient(top, hsl("+gradVal+", 75%, 35%) 0%, hsl("+gradVal+", 76%, 50%) 100%)";

            $scope.config.pan = val;
        	$scope.panSlider.background = gradient;
        
	        if(sender) {
	            clearTimeout($scope.scrollingText.stillTimeout);
	            $scope.scrollingText.still = "balance: " + 
	                (val === 50 ? 
	                    "center" : 
	                    (val < 50 ?
	                        (Math.floor((50 - val)/50*100) + "% left") :
	                        (Math.floor((val-50)/50*100) + "% right")
	                            ));
	            $scope.$apply();
	            $scope.scrollingText.stillTimeout = setTimeout(function() {
	                $scope.scrollingText.still = null;
	                $scope.$apply();
	            }, 1000);
	        }
		}
	};

	$scope.kbps = '\u00A0';
	$scope.khz = '\u00A0';
	$scope.channels = 0;

	$scope.$on('timeupdate', updateUI);

	$scope.$on('canplaythrough', function() {
		var sound = $scope.currentSound;
		$scope.scrollingText.text = sound.getScrollingText();
		$scope.scrollingText.state = 'scrolling';
		$scope.kbps = 'N/A';
		$scope.khz = Math.floor(sound.sampleRate/1000);
		$scope.channels = sound.source.channelCount;
		$scope.displayPanel.currentSound = sound;
		$scope.displayPanel.state = "playing";
		$scope.$apply();
	});

	$scope.$on('currentSoundDestructed', function() {
		$scope.displayPanel.currentSound = null;
		$scope.displayPanel.state = "default";
	});

	$window.onfocus = function() {
		$scope.active = 1;
		$scope.$apply();
	};

	$window.onblur = function() {
		$scope.active = 0;
		$scope.$apply();
	};

	function updateUI () {
		$scope.scrollingText.text = $scope.currentSound.getScrollingText();
		/*if(!rangeSlider.isMoving()) {
            rangeSlider.setValue(currentSound.currentTime*1000);
        }
        
        rangeSlider.setMaximum(currentSound.duration*1000);*/


        $scope.$apply();
	};

	$scope.pause = function() {
        if($scope.currentSound && $scope.currentSound.audio) {
            if(!$scope.currentSound.audio.paused) {
                $scope.displayPanel.state = "paused";
                $scope.currentSound.audio.pause();
            } else {
                $scope.displayPanel.state = "playing";
                $scope.currentSound.audio.play();
            }
        }
    };

    $scope.stop = function() {
        $scope.destructCurrentSound();
    };

    $scope.play = function() {
        if($scope.currentSound && $scope.currentSound.audio) {
            if($scope.currentSound.audio.paused) {
                $scope.displayPanel.state = "playing";
                $scope.currentSound.audio.play();
            } else {
                $scope.currentSound.audio.currentTime = 0;
                $scope.currentSound.currentTime = 0;
            }
        } else if($scope.currentSound) {
            $scope.constructCurrentSound();
        }
    };
}]);