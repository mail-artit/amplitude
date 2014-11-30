var ScrollingLabel = ScrollingLabel || ((function() {
            
    var _str = "Amplitude",
        _index = 0,
        _paused = 1,
        _tickTime = 0,
        _timer,
        _result,
        _labelStill = null,
        _label,
        
        getLabel = function() {
            if(!_label) {
                _label = $("#scrolling-label")[0];
            }
            return _label;
        },
        
        calcResult = function() {
            _result = _str.substr(_index % _str.length, 31);
            
            if(_result.length < 31) {
                _result = _result + _str.substr(0, 31 - _result.length);
            }
        },
        
        tick = function () {
            
            _tickTime = new Date().getTime();
            
            calcResult();
            
            if(_labelStill === null) {
                getLabel().innerHTML = _result;
            } else {
                getLabel().innerHTML = _labelStill;
            }
            _index += 1;
            
            if(!_paused) {
                _timer = setTimeout(tick, 100 - (new Date().getTime() - _tickTime));
            }
        };
        
    return {
        "setLabel": function(str) {
            if(_str !== str + " *** ") {
                _str = str + " *** ";
            }
            
        },
        
        "setLabelStill": function(str) {
            if(_paused) {
                if(str === null) {
                    getLabel().innerHTML = "amplitude";
                } else {
                    getLabel().innerHTML = str;
                }
            } else {
                _labelStill = str;
            }
        },
        
        "start": function() {
            if(_paused) {
                _paused = 0;
                tick();
            }
        },
        
        "stop": function() {
            _index = 0;
            _paused = 1;
            clearTimeout(_timer);
        },
        "pause": function() {
            _paused = 1;
            clearTimeout(_timer);
        }
    };
    
})());

$(function() {
    
    var currentSound = null;
    
    var audioContext = new AudioContext();
    
    var sliderTimer;
    
    var volumeData = document.createElement('input'),
        volumeSlider = new Slider(document.getElementById("volume-slider"), volumeData);
    
    var panData = document.createElement('input'),
        panSlider = new Slider(document.getElementById("pan-slider"), panData);
        
    var rangeData = document.createElement('input'),
        rangeSlider = new Slider(document.getElementById("range-slider"), rangeData);
    
    /** drawing functions*/
    
    var fft = document.getElementById("fft");
    var fftCtx = fft.getContext("2d");
    
    
    var fftCtxOpts = {
        width: 2,
        padding: 1,
        step: 4,
        offsetX: 2,
        offsetY: 2
    };
    
    var drawFftBackground = function(ctx) {
        var i,
            j;
    
        ctx.fillStyle = "rgb(20,20,35)";
        
        for(i = 0; i < fft.width; i += fftCtxOpts.step) {
           for(j = 0; j < fft.height; j += fftCtxOpts.step) {
                if(i % (fftCtxOpts.step * 2) === 0 && j % (fftCtxOpts.step * 2) === 0) {
                    ctx.fillRect(
                        i+fftCtxOpts.offsetX,
                        j+fftCtxOpts.offsetY,
                        fftCtxOpts.width,
                        fftCtxOpts.width
                    );
                    ctx.fillRect(
                        i+fftCtxOpts.offsetX+fftCtxOpts.width+fftCtxOpts.padding,
                        j+fftCtxOpts.offsetY,
                        fftCtxOpts.width,
                        fftCtxOpts.width
                    );
                    ctx.fillRect(
                        i+fftCtxOpts.offsetX,
                        j+fftCtxOpts.width+fftCtxOpts.padding+fftCtxOpts.offsetY,
                        fftCtxOpts.width,
                        fftCtxOpts.width
                    );
                    ctx.fillRect(
                        i+fftCtxOpts.offsetX+fftCtxOpts.width+fftCtxOpts.padding,
                        j+fftCtxOpts.width+fftCtxOpts.padding+fftCtxOpts.offsetY,
                        fftCtxOpts.width,
                        fftCtxOpts.width
                    );
                }
            }
        }
    };
    
    var drawNumber = function(ctx, number, x, y) {
        var width = 14,
            height= 22,
            heigthDiv2 = Math.floor(height/2),
            partCoords = [
                [fftCtxOpts.width,0,width-fftCtxOpts.width,fftCtxOpts.width],
                [0,fftCtxOpts.width,fftCtxOpts.width,heigthDiv2-fftCtxOpts.width],
                [width,fftCtxOpts.width,fftCtxOpts.width,heigthDiv2-fftCtxOpts.width],
                [fftCtxOpts.width,heigthDiv2,width-fftCtxOpts.width,fftCtxOpts.width],
                [0,heigthDiv2+fftCtxOpts.width,fftCtxOpts.width,heigthDiv2-fftCtxOpts.width],
                [width,heigthDiv2+fftCtxOpts.width,fftCtxOpts.width,heigthDiv2-fftCtxOpts.width],
                [fftCtxOpts.width,height,width-fftCtxOpts.width,fftCtxOpts.width]
            ],
            parts = ["1110111","0010010","1011101","1011011","0111010","1101011","1101111","1010010","1111111","1111011"];
            var part = parts[number],
                i;
        
        for(i = 0; i < 7; i += 1) {
            if(part[i] == "1") {
                ctx.fillRect(x+partCoords[i][0],y+partCoords[i][1],partCoords[i][2],partCoords[i][3]);
            }
        }
        
        
    };
    
    var drawSeconds = function(ctx, s, noSound) {
      var val,
          i,
          numberPositions = [30,54,76,110,132];
        
        ctx.fillStyle = "#00AA00";
        
        val = secondsToString(s, "");
        
        if(!noSound) {
            for(i = val.length; i--;) {
                drawNumber(ctx, Number(val[i]), numberPositions[i+5-val.length], 5);
            }
        }
        
        fftCtx.fillRect(99,14,fftCtxOpts.width * 2,fftCtxOpts.width);
        fftCtx.fillRect(99,20,fftCtxOpts.width * 2,fftCtxOpts.width);
    };
    
    var drawState = function(ctx) {
        if(!currentSound || !currentSound.audio || (!currentSound.audio.currentTime && currentSound.audio.paused)) {
            ctx.fillRect(10,12,10,10);
        } else if(currentSound && currentSound.audio && !currentSound.audio.paused) {
            ctx.beginPath();
            ctx.moveTo(10,6);
            ctx.lineTo(10,28);
            ctx.lineTo(20,17);
            ctx.fill();
        } else if(currentSound && currentSound.audio && currentSound.audio.paused) {
            ctx.fillRect(6,12,6,10);
            ctx.fillRect(18,12,6,10);
        }
    };
    
    var drawFFt = function(ctx, data) {
        var i = 0,
            weights = [0.7,  0.7,  0.7,   0.8,    0.8, 0.9,    0.9,   0.9, 1,    1,   1,      1,    1,       1,    1,       1,    1,       1,     1,        1,     1,        1,          1          ],
            ranges =  [0,   30.0, 60,   115.00, 170, 240.00, 270.0, 310, 400.00, 600, 800.00, 1000, 2000.00, 3000, 4500.00, 6000, 8000.00, 12000, 13000.00, 14000, 15000.00, 16000, Number.MAX_VALUE],
            bucket,
            sum,
            len,
            hz,
            step = currentSound.ctx.sampleRate/2048,
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
                
                ctx.fillRect(bucket * 7, fft.height - avg, 5, avg);
            }
    };
    
    var CanvasRenderer = CanvasRenderer || ((function() {
        
        var _paused = 1,
            _gradient,
            
            getGradient = function() {
                if(!_gradient) {
                    _gradient = fftCtx.createLinearGradient(0,39,0,69);
                    _gradient.addColorStop(0.1,"red");
                    _gradient.addColorStop(0.12,"yellow");
                    _gradient.addColorStop(1,"rgb(0,170,0");
                }
                return _gradient;
            },
            
            tick = function () {
                
                if(!currentSound || !currentSound.audio || typeof currentSound.currentTime === "undefined") {
                    requestAnimationFrame(tick);
                    return;
                }
                
                fftCtx.clearRect(0,0,fft.width,fft.height);
                drawFftBackground(fftCtx);
                drawSeconds(fftCtx, currentSound.currentTime);
                drawState(fftCtx);
                
                fftCtx.fillStyle = getGradient();
        
                drawFFt(fftCtx, currentSound.frequencyData);
    	        
    	        if(!_paused) {
    	            currentSound.analyser.getByteFrequencyData(currentSound.frequencyData);
                    requestAnimationFrame(tick);
                }
            };
        
        
        return {
            "start": function() {
                if(_paused) {
                    _paused = 0;
                    tick();
                }
            },
            "stop": function() {
                _paused = 1;
            },
            "pause": function() {
                _paused = 1;
            }
        };
        
    })());
    
    /** drawing functions*/
        
    /**utility functions*/
    
    var secondsToString = function(s, delim) {
        var min = Math.floor(s / 60),
            mods = Math.floor(s) - min * 60;
            
        min = min < 10 ? "0"+min : ""+min;
        mods = mods < 10 ? "0"+mods : ""+mods;
        
        return min+delim+mods;
        
    };
    
    var makeSound = function(tags) {
        var ret =  {
            "title": tags.title || "Unknown Title",
            "artist": tags.artist || "Unknown Artist",
            "track": tags.v2 && tags.v2.track || null,
            "getScrollingText": function() {
                
                return (ret.track !== null ? ret.track +". " : "") +
                    ret.artist + " - " +
                    ret.title + 
                    (ret.duration ? " ("+ secondsToString(ret.duration, ":") + ")" : "");
            }
        };
        
        return ret;
    };
    
    var destructCurrentSound = function() {
        if(currentSound && currentSound.audio) {
            currentSound.currentTime = 0;
            currentSound.audio.pause();
            currentSound.audio = null;
        }
        resetUI();
    };
    
    var constructCurrentSound = function() {
        
        currentSound.audio = new Audio();
        
        currentSound.audio.addEventListener("ended", function() {
            if($("#sw-repeat").hasClass("active")) {
                currentSound.audio.currentTime = 0;
                currentSound.currentTime = 0;
            } else {
                destructCurrentSound();
            }
        });
        
        currentSound.audio.addEventListener("canplaythrough", function() {
            if(currentSound && currentSound.audio) {
                currentSound.audio.play();
                ScrollingLabel.start();
                CanvasRenderer.start();
                $("#range-slider").find(".handle").removeClass("hidden");
            }
        });
        
        currentSound.audio.addEventListener("timeupdate",function (){
            if(currentSound && currentSound.audio) {
                currentSound.duration = currentSound.audio.duration;
                currentSound.currentTime = currentSound.audio.currentTime;
                updateUI();
            }
        });
        
        currentSound.sampleRate = audioContext.sampleRate;
        currentSound.autoplay = false;
        
        currentSound.audio.src = currentSound.src;

        currentSound.source = audioContext.createMediaElementSource(currentSound.audio);
        
        currentSound.gain = audioContext.createGain();
        currentSound.panner = audioContext.createPanner();
        currentSound.analyser = audioContext.createAnalyser(); 
        
        currentSound.source.connect(currentSound.gain);
        currentSound.source.connect(currentSound.analyser);
        
        currentSound.gain.connect(currentSound.panner);
        
        currentSound.gain.gain.value = volumeSlider.getValue() / 100;
        panSlider.onchange(null);
        
        currentSound.panner.connect(audioContext.destination);
        
        currentSound.analyser.smoothingTimeConstant = 0.7;
        currentSound.analyser.fftSize = 2048;
        currentSound.frequencyData = new Uint8Array(currentSound.analyser.frequencyBinCount);
    };

    var handleFile = function(files, callback) {
        
        destructCurrentSound();
        
        id3(files[0], function(err, tags) {
            
            currentSound = makeSound(tags);
            
            currentSound.ctx = audioContext;
            
            currentSound.src = URL.createObjectURL(files[0]);
            
            constructCurrentSound();
            
            callback();
        });
        
    };
    
    var resetUI = function() {
        fftCtx.clearRect(0,0,fft.width,fft.height);
        drawFftBackground(fftCtx);
        drawSeconds(fftCtx, 1, 1);
        drawState(fftCtx);
        $("#range-slider").find(".handle").addClass("hidden");
    };
    
    var updateUI = function() {
        
        ScrollingLabel.setLabel(currentSound.getScrollingText());
        
        /**TODO*/
        var kbps = "N/A";
        
        $("#kbps-label").text(kbps);
        $("#khz-label").text(Math.floor(currentSound.sampleRate/1000));
        
        
        if(currentSound.source.channelCount > 1) {
            $("#mono-label").removeClass("active");
            $("#stereo-label").addClass("active");
        } else {
            $("#stereo-label").removeClass("active");
            $("#mono-label").addClass("active");
        }
        
        if(!rangeSlider.isMoving()) {
            rangeSlider.setValue(currentSound.currentTime*1000);
        }
        
        rangeSlider.setMaximum(currentSound.duration*1000);
    };
    
    /**utility functions*/
    
    /**event handlers*/
    
    rangeSlider.onchange = function(sender) {
        var val = rangeSlider.getValue() / 1000;
        
        if(!currentSound || !currentSound.audio) {
            $("#range-slider").find(".handle").addClass("hidden");
            return;
        }
        
        if(sender && sender.mouse && currentSound.audio) {
            currentSound.audio.currentTime = val;
            currentSound.currentTime = val;
            clearTimeout(sliderTimer);
            ScrollingLabel.setLabelStill(null);
        } else if(sender && currentSound.audio) {
            clearTimeout(sliderTimer);
            ScrollingLabel.setLabelStill("seek to: " +
                secondsToString(val, ":")+
                "/"+
                secondsToString(currentSound.duration, ":")+
                " "+
                Math.floor(val/currentSound.duration*100)
                + "%");
            sliderTimer = setTimeout(function() {
                ScrollingLabel.setLabelStill(null);
            }, 1000);
        }
    };
    
    /**todo: -webkit prefix*/
    panSlider.onchange = function(sender) {
        var val = Number(panData.value),
            gradVal = Math.floor(120+-120*(50-val)*(val > 50 ? -1 : 1)/50),
            gradient = "-webkit-linear-gradient(top, hsl("+gradVal+", 75%, 35%) 0%, hsl("+gradVal+", 76%, 50%) 100%)",
            pan = function(val) {
                var xDeg = (val / 100 * 90) - 45;
                var zDeg = xDeg + 90;
                if (zDeg > 90) {
                    zDeg = 180 - zDeg;
                }
                var x = Math.sin(xDeg * (Math.PI / 180));
                var z = Math.sin(zDeg * (Math.PI / 180));
                currentSound && currentSound.panner.setPosition(x, 0, z);
            };
            
        panSlider.line.children[0].style.background = gradient;
        
        pan(val);
        
        if(sender) {
            clearTimeout(sliderTimer);
            
            ScrollingLabel.setLabelStill("balance: " + 
                (val === 50 ? 
                    "center" : 
                    (val < 50 ?
                        (Math.floor((50 - val)/50*100) + "% left") :
                        (Math.floor((val-50)/50*100) + "% right")
                            )));
            sliderTimer = setTimeout(function() {
                ScrollingLabel.setLabelStill(null);
            }, 1000);
        }
    };
    
    /**todo: -webkit prefix*/
    volumeSlider.onchange = function(sender) {
        var val = Number(volumeData.value),
            gradVal = Math.floor(120-(120/100*val)),
            gradient = "-webkit-linear-gradient(top, hsl("+gradVal+", 75%, 35%) 0%, hsl("+gradVal+", 76%, 50%) 100%)";
        
        $(volumeSlider.line.children[0]).css("background", gradient);
        
        currentSound && (currentSound.gain.gain.value = val / 100);
        
        if(sender) {
            clearTimeout(sliderTimer);
            ScrollingLabel.setLabelStill("volume: "+val+"%");
            sliderTimer = setTimeout(function() {
                ScrollingLabel.setLabelStill(null);
            }, 1000);
        }
    };
    
    
    $(window).focus(function(){
        $("#amplitude").addClass("active");
    }).blur(function(){
        $("#amplitude").removeClass("active"); 
    });
    
    $("#open").change(function() {
        var that = this;
        handleFile(that.files, function() {
            $(that).val(null);
        });
    });
    
    
    $("#btn-pause").click(function() {
        if(currentSound && currentSound.audio) {
            if(!currentSound.audio.paused) {
                CanvasRenderer.pause();
                currentSound.audio.pause();
            } else {
                CanvasRenderer.start();
                currentSound.audio.play();
            }
        }
    });
    
    $("#btn-play").click(function() {
        if(currentSound && currentSound.audio) {
            if(currentSound.audio.paused) {
                CanvasRenderer.start();
                currentSound.audio.play();
            } else {
                currentSound.audio.currentTime = 0;
                currentSound.currentTime = 0;
            }
        } else if(currentSound) {
            constructCurrentSound();
        }
    });
    
    $("#btn-stop").click(function() {
        destructCurrentSound();
    });
    
    $("#sw-repeat").click(function() {
       $(this).toggleClass("active");
    });

    $("#h-close").click(function() {
        chrome.app.window.current().close();
    });
    
    $("#h-minimize").click(function() {
        chrome.app.window.current().minimize();
    });

    /**event handlers*/
    
    /**init */
    
    resetUI();
    
    volumeSlider.setMaximum(100);
    volumeSlider.setValue(100);
    volumeSlider.setBlockIncrement(10);
    volumeSlider.onchange(null);
        
    panSlider.setMaximum(100);
    panSlider.setValue(50);
    panSlider.setBlockIncrement(10);
    panSlider.setStickTo(50,15);
    panSlider.onchange(null);
    
    /**init */
});