amplitude.directive("slider", function($parse) {

	var data = null,
		slider = null;

	return {
		'restrict': 'A',
		'scope': {
			'model': '=ngModel'
		},
		'link': function($scope, $element, $attributes)  {
			data = document.createElement('input'),
        	slider = new Slider($element[0], data);
		}
	}
});