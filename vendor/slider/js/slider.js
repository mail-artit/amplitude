

function Slider(oElement, oInput, sOrientation) {

	var oThis = this;

	this._orientation = sOrientation || "horizontal";
	this._range = new Range();
	this._range.setExtent(0);
	this._blockIncrement = 10;
	this._unitIncrement = 1;
	this._timer = new Timer(10);

	this.document = oElement.ownerDocument;

	this.element = oElement;
	this.element.slider = this;

	// add class name tag to class name
	this.element.className = this._orientation + " " + this.classNameTag + " " + this.element.className;

	// create line
	this.line = this.document.createElement("div");
	this.line.className = "line";
	this.line.appendChild(this.document.createElement("div"));
	this.element.appendChild(this.line);

	// create handle
	this.handle = this.document.createElement("div");
	this.handle.className = "handle";
	this.handle.appendChild(this.document.createElement("div"));
	this.handle.firstChild.appendChild(this.document.createTextNode(String.fromCharCode(160)));
	this.element.appendChild(this.handle);

	this.input = oInput;

	this._range.onchange = function () {
		oThis.recalculate();
		oThis.onchange && oThis.onchange();
	};

	this.element.onmousedown = Slider.eventHandlers.onmousedown;
	this.element.onmouseover = Slider.eventHandlers.onmouseover;
	this.element.onmouseout = Slider.eventHandlers.onmouseout;

	this._timer.ontimer = function () {
		oThis.ontimer();
	};

	this.recalculate();
}

Slider.eventHandlers = {
	onmousedown:	function (e) {
		var s = this.slider;
		s.setMoving(1);
		s.element.focus && s.element.focus();
		Slider._currentInstance = s;
		s.document.addEventListener("mousemove", Slider.eventHandlers.onmousemove, true);
		s.document.addEventListener("mouseup", Slider.eventHandlers.onmouseup, true);
		s._mouseX = e.pageX;
		s._mouseY = e.pageY;
		s.ontimer();
	},

	onmousemove:	function (e) {
		var s = Slider._currentInstance;
		if (s != null) {
			s._mouseX = e.pageX;
			s._mouseY = e.pageY;
		}
	},

	onmouseup:	function (e) {
		var s = Slider._currentInstance;
		var doc = s.document;
		doc.removeEventListener("mousemove", Slider.eventHandlers.onmousemove, true);
		doc.removeEventListener("mouseup", Slider.eventHandlers.onmouseup, true);
		s._timer.stop();
		s.onchange && s.onchange({"mouse": 1});
		s.setMoving(0);
		Slider._currentInstance = null;
	}
};

Slider.prototype.classNameTag = "dynamic-slider-control",

Slider.prototype.setValue = function (v) {
	var mr, mx;
	if(typeof this.stickTo !== "undefined" && typeof this.stickToRange !== "undefined") {
		mr = this.stickTo - this.stickToRange;
		mx = this.stickTo + this.stickToRange;
		if(v < mr || v > mx) {
			this._range.setValue(v);
		} else {
			this._range.setValue(this.stickTo);
			this.onchange && this.onchange();
		}
		this.input.value = this.getValue();
	} else {
		this._range.setValue(v);
		this.input.value = this.getValue();
	}
};

Slider.prototype.getValue = function () {
	return this._range.getValue();
};

Slider.prototype.setMinimum = function (v) {
	this._range.setMinimum(v);
	this.input.value = this.getValue();
};

Slider.prototype.getMinimum = function () {
	return this._range.getMinimum();
};

Slider.prototype.setMaximum = function (v) {
	this._range.setMaximum(v);
	this.input.value = this.getValue();
};

Slider.prototype.getMaximum = function () {
	return this._range.getMaximum();
};

Slider.prototype.setUnitIncrement = function (v) {
	this._unitIncrement = v;
};

Slider.prototype.getUnitIncrement = function () {
	return this._unitIncrement;
};

Slider.prototype.setBlockIncrement = function (v) {
	this._blockIncrement = v;
};

Slider.prototype.getBlockIncrement = function () {
	return this._blockIncrement;
};

Slider.prototype.getOrientation = function () {
	return this._orientation;
};

Slider.prototype.setStickTo = function(v,r) {
	this.stickTo = v;
	this.stickToRange = r;
};

Slider.prototype.isMoving = function() {
	return this._moving;
};

Slider.prototype.setMoving = function(moving) {
	this._moving = moving;
};

Slider.prototype.setOrientation = function (sOrientation) {
	if (sOrientation != this._orientation) {
		this.element.className = this.element.className.replace(this._orientation, sOrientation);
		this._orientation = sOrientation;
		this.recalculate();
	}
};

Slider.prototype.recalculate = function() {

	var w = this.element.offsetWidth;
	var h = this.element.offsetHeight;
	var hw = this.handle.offsetWidth;
	var hh = this.handle.offsetHeight;
	var lw = this.line.offsetWidth;
	var lh = this.line.offsetHeight;

	if (this._orientation == "horizontal") {
		this.handle.style.left = (w - hw) * (this.getValue() - this.getMinimum()) /
			(this.getMaximum() - this.getMinimum()) + "px";
		this.handle.style.top = (h - hh) / 2 + "px";
		this.line.style.top = (h - lh) / 2 + "px";
		this.line.style.left = 0;
		this.line.style.width = (w - 2) +"px";
		this.line.firstChild.style.width = (w - 4) +"px";
	} else {
		this.handle.style.left = (w - hw) / 2 + "px";
		this.handle.style.top = h - hh - (h - hh) * (this.getValue() - this.getMinimum()) /
			(this.getMaximum() - this.getMinimum()) + "px";

		this.line.style.left = (w - lw) / 2 + "px";
		this.line.style.top = hh / 2 + "px";
		this.line.style.height = Math.max(0, h - hh - 2) + "px";	//hard coded border width
		//this.line.style.bottom = hh / 2 + "px";
		this.line.firstChild.style.height = Math.max(0, h - hh - 4) + "px";	//hard coded border width
	}
};

Slider.prototype.ontimer = function () {
	var hw = this.handle.offsetWidth;
	var hh = this.handle.offsetHeight;
	var hl = this.handle.offsetLeft;
	var ht = this.handle.offsetTop;

	if (this._orientation == "horizontal") {
		this.setValue(((this._mouseX - 
			(this.line.firstChild.getBoundingClientRect().left + 
				window.pageXOffset - 
				document.documentElement.clientLeft)) /
			this.line.firstChild.offsetWidth)*this.getMaximum());

		this.onchange && this.onchange({"mouse": 0});
	}

	this._timer.start();
};