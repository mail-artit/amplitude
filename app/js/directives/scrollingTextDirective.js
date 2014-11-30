amplitude.directive("scrollingText", function($parse) {

  return {
    restrict: 'A',
    scope: { 
      model: "=ngModel"
    },
    link: function($scope, $element, $attributes) {

      var _str = "",
        _index = 0,
        _paused = 1,
        _tickTime = 0,
        _timer = null,
        _result = null,
        _labelStill = null,
        _label = null,

        calcResult = function() {

            _result = _str.substr(_index % _str.length, 31);

            if(_result.length < 31) {
              _result = _result + new Array(Math.floor((31 - _result.length + 1) / _result.length + 3)).join(_str).substr(0, 31 - _str.length + _index);
            }

        };

      var tick = function () {
          
          calcResult();
          
          if(_labelStill === null) {
            $element.html(_result);
          } else {
            $element.html(_labelStill);
          }

          _index += 1;

          if(!_paused) {
              _timer = setTimeout(tick, 100);
          }
      };

      $scope.$watch('model.text', function (text) {
        
        if(text === null) {
          text = $scope.model.default;
        } else {
          text = text.trim().replace(/[\x00-\x1F\x7F-\x9F]/gi, "");
          $element.html(text);
        }

        if(_str !== text + " *** ") {
          _str = text + " *** ";
        }

      });

      $scope.$watch('model.still', function (still) {
        if(_paused) {
          if(still === null) {
            $element.html($scope.model.default);
          } else {
            $element.html(still);
          }
        } 
        _labelStill = still;
      });

      $scope.$watch('model.state', function (state) {
        switch(state) {
          case "paused": {
            _paused = 1;
            clearTimeout(_timer);
            break;
          }
          case "stopped": {
            _index = 0;
            _paused = 1;
            clearTimeout(_timer);
            break;
          }
          case "scrolling": {
            if(_paused) {
                _paused = 0;
                tick();
            }
            break;
          }
        }
      });
    }
  };
});