amplitude.factory('utils', function() {
	var utils = {};

	utils.secondsToString = function(s, delim) {
        var min = Math.floor(s / 60),
            mods = Math.floor(s) - min * 60;
            
        min = min < 10 ? "0"+min : ""+min;
        mods = mods < 10 ? "0"+mods : ""+mods;
        
        return min+delim+mods;
    };

    utils.pan = function(val, panner) {
        var xDeg = (val / 100 * 90) - 45;
        var zDeg = xDeg + 90;
        if (zDeg > 90) {
            zDeg = 180 - zDeg;
        }
        var x = Math.sin(xDeg * (Math.PI / 180));
        var z = Math.sin(zDeg * (Math.PI / 180));

        panner.setPosition(x, 0, z);
    };

	return utils;
});