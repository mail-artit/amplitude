amplitude.directive("openFile", function($parse) {
	return {
	    restrict: 'A',
	    scope: { 
	      model: "=ngModel"
	    },
	    link: function($scope, $element, $attributes) {
	    	$element.on("change", function() {
		  		$scope.model.parse($element[0].files, function() {
		    		$element.val(null);
		  		});
	    	});
	   	}
	}
});