amplitude.factory('externalService', [function() {
	return {
		"close": function () {
			chrome.app.window.current().close();
		},

		"minimize": function () {
			chrome.app.window.current().minimize();
		}
	};
}]);