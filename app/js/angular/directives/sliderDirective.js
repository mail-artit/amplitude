amplitude.directive("slider", function($parse) {

	return {
		'restrict': 'A',
		'scope': {
			'model': '=ngModel'
		},
		'link': function($scope, $element, $attributes)  {

			var data = null,
				slider = null;

			data = document.createElement('input'),
        	slider = new Slider($element[0], data);

        	if(!$scope.model) return;

        	slider.onchange = function(sender) {
        		$scope.model.value = slider.getValue();
        		$scope.model.onchange && $scope.model.onchange(sender);
        	}

      		$scope.$watch('model.max', function (max) {
        		slider.setMaximum(max);
      		});

      		$scope.$watch('model.value', function (value) {
        		slider.setValue(value);
      		});

      		$scope.$watch('model.block', function (block) {
        		slider.setBlockIncrement(block);
      		});
      		
      		$scope.$watch('model.background', function (background) {
      			var line = $element[0].children[0];
        		line.children[0].style.background = background;
      		});

      		$scope.$watch('model.stickTo', function (stickTo) {
      			if(!stickTo) return;
      			slider.setStickTo(stickTo[0],stickTo[1]);
      		});
		}
	}
});