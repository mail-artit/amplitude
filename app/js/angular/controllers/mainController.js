amplitude.controller('MainController', ['$scope', function ($scope) {

	var updateUI = function() {
		
	};

	$scope.scrollingText = {
		'default': $scope.config.title,
		'text': null,
		'still': null,
		'state': 'paused'
	};

	$scope.$on("timeupdate", updateUI);

	$scope.$on("canplaythrough", function() {
		$scope.scrollingText.text = $scope.currentSound.getScrollingText();
		$scope.scrollingText.state = "scrolling";
		$scope.$apply();
	});

}]);