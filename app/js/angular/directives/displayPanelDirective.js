amplitude.directive('displayPanel', ['utils', '$parse', function(utils, $parse) {

	var context = null,
		width = null,
		height = null,
		_state = null;

	var config = {
        width: 2,
        padding: 1,
        step: 4,
        offsetX: 2,
        offsetY: 2
    };

	var drawFftBackground = function() {
        var i,
            j;
    
        context.fillStyle = "rgb(20,20,35)";
        
        for(i = 0; i < width; i += config.step) {
           for(j = 0; j < height; j += config.step) {
                if(i % (config.step * 2) === 0 && j % (config.step * 2) === 0) {
                    context.fillRect(
                        i+config.offsetX,
                        j+config.offsetY,
                        config.width,
                        config.width
                    );
                    context.fillRect(
                        i+config.offsetX+config.width+config.padding,
                        j+config.offsetY,
                        config.width,
                        config.width
                    );
                    context.fillRect(
                        i+config.offsetX,
                        j+config.width+config.padding+config.offsetY,
                        config.width,
                        config.width
                    );
                    context.fillRect(
                        i+config.offsetX+config.width+config.padding,
                        j+config.width+config.padding+config.offsetY,
                        config.width,
                        config.width
                    );
                }
            }
        }
    };

    var drawNumber = function(number, x, y) {
        var width = 14,
            height= 22,
            heigthDiv2 = Math.floor(height/2),
            partCoords = [
                [config.width,0,width-config.width,config.width],
                [0,config.width,config.width,heigthDiv2-config.width],
                [width,config.width,config.width,heigthDiv2-config.width],
                [config.width,heigthDiv2,width-config.width,config.width],
                [0,heigthDiv2+config.width,config.width,heigthDiv2-config.width],
                [width,heigthDiv2+config.width,config.width,heigthDiv2-config.width],
                [config.width,height,width-config.width,config.width]
            ],
            parts = ["1110111","0010010","1011101","1011011","0111010","1101011","1101111","1010010","1111111","1111011"];
            var part = parts[number],
                i;
        
        for(i = 0; i < 7; i += 1) {
            if(part[i] === "1") {
                context.fillRect(x+partCoords[i][0],y+partCoords[i][1],partCoords[i][2],partCoords[i][3]);
            }
        }
    };

    var drawSeconds = function(s, noSound) {
      var val,
          i,
          numberPositions = [30,54,76,110,132];
        
        context.fillStyle = "#00AA00";
        
        val = utils.secondsToString(s, "");
        
        if(!noSound) {
            for(i = val.length; i--;) {
                drawNumber(Number(val[i]), numberPositions[i+5-val.length], 5);
            }
        }
        
        context.fillRect(99,14,config.width * 2,config.width);
        context.fillRect(99,20,config.width * 2,config.width);
    };

    var drawState = function() {
        if(_state === 'playing') {
            context.beginPath();
            context.moveTo(10,6);
            context.lineTo(10,28);
            context.lineTo(20,17);
            context.fill();
        } else if(_state === 'paused') {
            context.fillRect(6,12,6,10);
            context.fillRect(18,12,6,10);
        } else {
        	context.fillRect(10,12,10,10);
        }
    };

    var drawFFt = function(data, sampleRate) {
        var i = 0,
            weights = [0.7,  0.7,  0.7,   0.8,    0.8, 0.9,    0.9,   0.9, 1,    1,   1,      1,    1,       1,    1,       1,    1,       1,     1,        1,     1,        1,          1          ],
            ranges =  [0,   30.0, 60,   115.00, 170, 240.00, 270.0, 310, 400.00, 600, 800.00, 1000, 2000.00, 3000, 4500.00, 6000, 8000.00, 12000, 13000.00, 14000, 15000.00, 16000, Number.MAX_VALUE],
            bucket,
            sum,
            len,
            hz,
            step = sampleRate/2048,
            targetBucket,
            avg;
            
        while(i < data.length) {
            
            hz = step * i;
    
            bucket = 0;
            sum = 0;
            len = 0;
            
            while(hz > ranges[bucket]) {
                bucket++;
            }
            
            targetBucket = bucket;
            
            while(i < data.length && targetBucket === bucket) {
                sum += data[i]*weights[bucket];
                len += 1;
                i += 1;
                
                hz = step * i;
    
                targetBucket = 0;
                
                while(hz > ranges[targetBucket]) {
                    targetBucket++;
                }
            }
            
            avg = ((sum / len) / 256) * 30;
            
            context.fillRect(bucket * 7, height - avg, 5, avg);
        }
    };

	return {
		restrict: 'A',
		scope: {
			model : '=ngModel'
		},
		link: function($scope, $element, $attributes) {
			
			var DisplayPanelRenderer = DisplayPanelRenderer || ((function() {

				var _paused = 1,
					_gradient = null,
					_frequencyData = null;

				getGradient = function() {
					if(!_gradient) {
						_gradient = context.createLinearGradient(0,39,0,69);
						_gradient.addColorStop(0.1,"red");
						_gradient.addColorStop(0.12,"yellow");
						_gradient.addColorStop(1,"rgb(0,170,0");
					}
					return _gradient;
				},

				getFrequencyData = function(sound) {
					if(!_frequencyData) {
						_frequencyData = new Uint8Array(sound.analyser.frequencyBinCount)
					}
					return _frequencyData;
				},

				tick = function () {

					var sound = $scope.model.currentSound;

					if(!(sound && sound.audio && typeof sound.currentTime !== "undefined")) {
                    	requestAnimationFrame(tick);
                    	return;
                	}

					context.clearRect(0, 0, width, height);
					drawFftBackground();
					drawSeconds(sound.currentTime);
					drawState();

					context.fillStyle = getGradient();

					drawFFt(getFrequencyData(sound), sound.sampleRate);

					if(!_paused) {
						sound.analyser.getByteFrequencyData(getFrequencyData(sound));
						requestAnimationFrame(tick);
					}

				};


				return {
					start: function() {
						if(_paused) {
							_paused = 0;
							tick();
						}
					},
					stop: function() {
						_paused = 1;
						context.clearRect(0,0, width, height);
        				drawFftBackground();
        				drawSeconds(1, 1);
        				drawState();
					},
					pause: function() {
						_paused = 1;
					}
				};

			})());

			context = $element[0].getContext('2d');
			width = $attributes.width;
			height = $attributes.height;

        	$scope.$watch('model.state', function(state) {
        		_state = state;
        		if(state === 'playing') {
        			DisplayPanelRenderer.start();
        		} else if(state === 'paused') {
        			DisplayPanelRenderer.pause();
        		} else {
        			DisplayPanelRenderer.stop();
        		}
        	});
		}
	};

}]);