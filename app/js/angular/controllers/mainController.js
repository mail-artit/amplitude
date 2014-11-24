amplitude.controller('MainController', ['$scope', function($scope) {

	$scope.scrollingText = {
		'default': $scope.config.title,
		'text': null,
		'still': null,
		'state': 'paused'
	};

	$scope.hack = function() {
		$scope.scrollingText.state = "scrolling";
	}

}]);