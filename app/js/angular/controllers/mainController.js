amplitude.controller('MainController', ['$window', 'utils', '$scope', function ($window, utils, $scope) {
	
	$scope.active = 0;

	$scope.scrollingText = {
		'default': $scope.config.title,
		'text' : null,
		'still' : null,
		'state' : 'paused'
	};

	$scope.displayPanel = {
		'state' : 'default',
		'currentSound' : null
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